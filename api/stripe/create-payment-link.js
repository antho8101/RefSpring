
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
    console.log('💳 API STRIPE PAYMENT LINK: Début création Payment Link');
    
    const { affiliateEmail, affiliateName, amount, description, campaignName } = req.body;

    if (!affiliateEmail || !amount || !description || !affiliateName) {
      return res.status(400).json({ 
        error: 'Paramètres manquants (affiliateEmail, affiliateName, amount, description requis)' 
      });
    }

    // Validation du montant (doit être en centimes, positif)
    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ 
        error: 'Le montant doit être un nombre positif en centimes' 
      });
    }

    console.log('💳 API STRIPE PAYMENT LINK: Paramètres validés:', {
      affiliateEmail,
      affiliateName,
      amount,
      description: description.substring(0, 50) + '...'
    });

    // Initialiser Stripe en mode PRODUCTION
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // Créer un produit temporaire pour ce paiement
    const product = await stripe.products.create({
      name: `Commission RefSpring - ${affiliateName}`,
      description: description,
      metadata: {
        campaign_name: campaignName,
        affiliate_email: affiliateEmail,
        affiliate_name: affiliateName,
        source: 'RefSpring'
      }
    });

    console.log('✅ STRIPE: Produit créé:', product.id);

    // Créer un prix pour ce produit
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: amount,
      currency: 'eur',
      metadata: {
        affiliate_email: affiliateEmail,
        campaign_name: campaignName
      }
    });

    console.log('✅ STRIPE: Prix créé:', price.id);

    // Créer le Payment Link
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      metadata: {
        affiliate_email: affiliateEmail,
        affiliate_name: affiliateName,
        campaign_name: campaignName,
        source: 'RefSpring'
      },
      after_completion: {
        type: 'redirect',
        redirect: {
          url: 'https://refspring.com/payment-success'
        }
      }
    });

    console.log('✅ STRIPE: Payment Link créé:', paymentLink.id);
    console.log('🔗 STRIPE: URL du Payment Link:', paymentLink.url);
    
    // Log pour traçabilité
    console.log('💰 PAYMENT LINK CRÉÉ AVEC SUCCÈS:', {
      affiliateEmail: affiliateEmail,
      affiliateName: affiliateName,
      amount: amount / 100,
      campaign: campaignName,
      paymentLinkId: paymentLink.id,
      paymentLinkUrl: paymentLink.url
    });

    return res.status(200).json({
      success: true,
      paymentLinkId: paymentLink.id,
      paymentLinkUrl: paymentLink.url,
      message: 'Payment Link créé avec succès'
    });

  } catch (error) {
    console.error('❌ API STRIPE PAYMENT LINK: Erreur PRODUCTION:', error);
    
    return res.status(500).json({
      error: 'Erreur lors de la création du Payment Link',
      details: error.message
    });
  }
}
