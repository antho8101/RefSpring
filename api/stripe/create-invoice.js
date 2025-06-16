
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
    console.log('💳 API STRIPE INVOICE: Début création facture PRODUCTION');
    
    const { userEmail, amount, description, campaignName } = req.body;

    if (!userEmail || !amount || !description) {
      return res.status(400).json({ 
        error: 'Paramètres manquants (userEmail, amount, description requis)' 
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
      description: description.substring(0, 50) + '...'
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

    // Créer la facture Stripe réelle
    const invoice = await stripe.invoices.create({
      customer: customerId,
      currency: 'eur',
      description: description,
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

    // Finaliser et envoyer la facture
    const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);
    
    console.log('✅ STRIPE: Facture créée et finalisée:', finalizedInvoice.id);
    
    // Log pour traçabilité
    console.log('💳 FACTURATION REFSPRING RÉELLE:', {
      email: userEmail,
      amount: amount / 100, // Convertir en euros pour les logs
      campaign: campaignName,
      invoiceId: finalizedInvoice.id,
      invoiceUrl: finalizedInvoice.hosted_invoice_url
    });

    return res.status(200).json({
      success: true,
      invoiceId: finalizedInvoice.id,
      invoiceUrl: finalizedInvoice.hosted_invoice_url,
      message: 'Facture RefSpring créée et envoyée avec succès'
    });

  } catch (error) {
    console.error('❌ API STRIPE INVOICE: Erreur PRODUCTION:', error);
    return res.status(500).json({
      error: 'Erreur lors de la création de la facture Stripe',
      details: error.message
    });
  }
}
