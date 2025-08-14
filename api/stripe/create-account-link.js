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
      accountId,
      affiliateId,
      refreshUrl,
      returnUrl 
    } = req.body;

    if (!accountId) {
      return res.status(400).json({ 
        error: 'ID du compte Stripe requis' 
      });
    }

    console.log('🔄 STRIPE CONNECT: Creating account link for:', accountId);

    // URLs par défaut si non fournies
    const defaultRefreshUrl = refreshUrl || `https://refspring.app/affiliate-onboarding?account=${accountId}&refresh=true`;
    const defaultReturnUrl = returnUrl || `https://refspring.app/affiliate-onboarding?account=${accountId}&success=true`;

    // Créer le lien d'onboarding
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: defaultRefreshUrl,
      return_url: defaultReturnUrl,
      type: 'account_onboarding',
    });

    console.log('✅ STRIPE CONNECT: Account link created:', accountLink.url);

    // Retourner le lien d'onboarding
    res.status(200).json({
      success: true,
      onboardingUrl: accountLink.url,
      accountId: accountId,
      expiresAt: accountLink.expires_at,
    });

  } catch (error) {
    console.error('❌ STRIPE CONNECT: Error creating account link:', error);
    
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