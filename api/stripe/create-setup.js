
import Stripe from 'stripe';

export default async function handler(req, res) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { campaignId, campaignName, userEmail } = req.body;

    if (!campaignId || !campaignName || !userEmail) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // Vérifier si un client existe déjà
    const customers = await stripe.customers.list({
      email: userEmail,
      limit: 1
    });

    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      // Créer un nouveau client
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: { source: 'RefSpring' }
      });
      customerId = customer.id;
    }

    // Créer une session Checkout pour SetupIntent
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'setup',
      success_url: `${process.env.VERCEL_URL || 'https://refspring.com'}/payment-success?setup_intent={CHECKOUT_SESSION_ID}&campaign_id=${campaignId}`,
      cancel_url: `${process.env.VERCEL_URL || 'https://refspring.com'}/dashboard`,
      metadata: {
        campaign_id: campaignId,
        campaign_name: campaignName
      }
    });

    return res.status(200).json({
      setupIntentId: session.id,
      stripeCustomerId: customerId,
      checkoutUrl: session.url
    });

  } catch (error) {
    console.error('❌ Erreur create-setup:', error);
    return res.status(500).json({ error: error.message });
  }
}
