import * as functions from 'firebase-functions';
import { stripe } from './stripeConfig';

export const stripeCreateSetup = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { campaignId, campaignName, userEmail } = req.body;

    if (!campaignId || !campaignName || !userEmail) {
      return res.status(400).json({ error: 'campaignId, campaignName and userEmail are required' });
    }

    console.log('💳 Creating setup intent for:', { campaignId, campaignName, userEmail });

    // Chercher ou créer le customer Stripe
    let customerId;
    const customers = await stripe.customers.list({
      email: userEmail,
      limit: 1
    });

    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      console.log('✅ Existing customer found:', customerId);
    } else {
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          campaignId,
          campaignName
        }
      });
      customerId = customer.id;
      console.log('✅ New customer created:', customerId);
    }

    // Créer le setup intent
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card'],
      usage: 'off_session',
      metadata: {
        campaignId,
        campaignName,
        userEmail
      }
    });

    console.log('✅ Setup intent created:', setupIntent.id);

    // Créer la session checkout pour le setup
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'setup',
      payment_method_types: ['card'],
      setup_intent_data: {
        metadata: {
          campaignId,
          campaignName,
          userEmail
        }
      },
      success_url: `${req.headers.origin || 'http://localhost:5173'}/payment-success?setup_intent={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin || 'http://localhost:5173'}/app`,
    });

    console.log('✅ Checkout session created:', checkoutSession.id);

    return res.json({
      setupIntentId: setupIntent.id,
      checkoutUrl: checkoutSession.url,
      clientSecret: setupIntent.client_secret
    });

  } catch (error) {
    console.error('❌ Error creating setup intent:', error);
    return res.status(500).json({ 
      error: 'Failed to create setup intent',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});