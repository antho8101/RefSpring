import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      affiliateEmail, 
      affiliateName, 
      country = 'FR',
      type = 'express' 
    } = req.body;

    if (!affiliateEmail || !affiliateName) {
      return res.status(400).json({ 
        error: 'Email et nom de l\'affilié requis' 
      });
    }

    console.log('🔄 STRIPE CONNECT: Creating account for:', affiliateEmail);

    // Créer le compte Stripe Connect Express
    const account = await stripe.accounts.create({
      type: type,
      country: country,
      email: affiliateEmail,
      capabilities: {
        transfers: { requested: true },
      },
      business_profile: {
        name: affiliateName,
        support_email: affiliateEmail,
      },
      metadata: {
        affiliate_email: affiliateEmail,
        affiliate_name: affiliateName,
        created_by: 'refspring_affiliate_system',
        created_at: new Date().toISOString(),
      },
    });

    console.log('✅ STRIPE CONNECT: Account created:', account.id);

    // Retourner les informations du compte
    res.status(200).json({
      success: true,
      accountId: account.id,
      email: account.email,
      created: account.created,
      capabilities: account.capabilities,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
    });

  } catch (error) {
    console.error('❌ STRIPE CONNECT: Error creating account:', error);
    
    if (error.type === 'StripeCardError') {
      res.status(400).json({ error: error.message });
    } else if (error.type === 'StripeRateLimitError') {
      res.status(429).json({ error: 'Trop de requêtes, réessayez plus tard' });
    } else if (error.type === 'StripeInvalidRequestError') {
      res.status(400).json({ error: 'Paramètres invalides: ' + error.message });
    } else if (error.type === 'StripeAPIError') {
      res.status(500).json({ error: 'Erreur API Stripe, réessayez plus tard' });
    } else if (error.type === 'StripeConnectionError') {
      res.status(500).json({ error: 'Erreur de connexion à Stripe' });
    } else if (error.type === 'StripeAuthenticationError') {
      res.status(500).json({ error: 'Erreur d\'authentification Stripe' });
    } else {
      res.status(500).json({ error: 'Erreur interne du serveur' });
    }
  }
}