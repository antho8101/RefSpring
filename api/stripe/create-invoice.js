

import Stripe from 'stripe';

export default async function handler(req, res) {
  // Gestion CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    console.log('💳 API STRIPE INVOICE: Début prélèvement automatique PRODUCTION');
    
    const { userEmail, amount, description, campaignName, stripePaymentMethodId } = req.body;

    if (!userEmail || !amount || !description || !stripePaymentMethodId) {
      return res.status(400).json({ 
        error: 'Paramètres manquants (userEmail, amount, description, stripePaymentMethodId requis)' 
      });
    }

    // Validation du montant (doit être en centimes, positif)
    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ 
        error: 'Le montant doit être un nombre positif en centimes' 
      });
    }

    console.log('💳 API STRIPE INVOICE: Paramètres validés:', {
      userEmail,
      amount,
      description: description.substring(0, 50) + '...',
      paymentMethodId: stripePaymentMethodId
    });

    // Initialiser Stripe en mode PRODUCTION
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // Vérifier si un client existe déjà
    const customers = await stripe.customers.list({
      email: userEmail,
      limit: 1
    });

    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      console.log('💳 STRIPE: Client existant trouvé:', customerId);
    } else {
      // Créer un nouveau client
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: { source: 'RefSpring' }
      });
      customerId = customer.id;
      console.log('💳 STRIPE: Nouveau client créé:', customerId);
    }

    // Créer la facture avec prélèvement automatique
    const invoice = await stripe.invoices.create({
      customer: customerId,
      currency: 'eur',
      description: description,
      collection_method: 'charge_automatically', // ✅ PRÉLÈVEMENT AUTOMATIQUE
      default_payment_method: stripePaymentMethodId, // ✅ UTILISER LA CARTE DE LA CAMPAGNE
      metadata: {
        campaign_name: campaignName,
        source: 'RefSpring'
      }
    });

    // Ajouter l'article à la facture
    await stripe.invoiceItems.create({
      customer: customerId,
      invoice: invoice.id,
      amount: amount,
      currency: 'eur',
      description: description
    });

    // Finaliser la facture
    const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);
    console.log('✅ STRIPE: Facture créée et finalisée:', finalizedInvoice.id);
    
    // **PRÉLÈVEMENT AUTOMATIQUE : Payer la facture immédiatement**
    console.log('💳 STRIPE: Tentative de prélèvement automatique...');
    const paidInvoice = await stripe.invoices.pay(finalizedInvoice.id, {
      payment_method: stripePaymentMethodId
    });
    
    if (paidInvoice.status === 'paid') {
      console.log('✅ STRIPE: Prélèvement réussi ! Paiement confirmé');
      
      // Log pour traçabilité
      console.log('💰 FACTURATION REFSPRING RÉELLE - PAIEMENT CONFIRMÉ:', {
        email: userEmail,
        amount: amount / 100,
        campaign: campaignName,
        invoiceId: paidInvoice.id,
        paymentStatus: paidInvoice.status,
        paymentMethodId: stripePaymentMethodId
      });

      return res.status(200).json({
        success: true,
        invoiceId: paidInvoice.id,
        paymentStatus: 'paid',
        amountPaid: paidInvoice.amount_paid,
        message: 'Prélèvement automatique réussi - Vous pouvez maintenant payer les affiliés en toute sécurité'
      });
      
    } else {
      console.error('❌ STRIPE: Prélèvement échoué:', paidInvoice.status);
      return res.status(402).json({
        error: 'Prélèvement échoué',
        paymentStatus: paidInvoice.status,
        details: 'La carte bancaire a été refusée ou est insuffisamment provisionnée'
      });
    }

  } catch (error) {
    console.error('❌ API STRIPE INVOICE: Erreur PRODUCTION:', error);
    
    // Gestion spécifique des erreurs de paiement
    if (error.type === 'StripeCardError') {
      return res.status(402).json({
        error: 'Erreur de carte bancaire',
        details: error.message,
        code: error.code
      });
    }
    
    return res.status(500).json({
      error: 'Erreur lors du prélèvement automatique',
      details: error.message
    });
  }
}

