import * as functions from 'firebase-functions';
import { stripe } from './stripeConfig';

export const stripeCheckSetup = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { setupIntentId } = req.body;

    if (!setupIntentId) {
      return res.status(400).json({ error: 'setupIntentId is required' });
    }

    console.log('🔍 Checking setup intent:', setupIntentId);

    // Si c'est un session ID au lieu d'un setup intent ID, récupérer la session
    let actualSetupIntentId = setupIntentId;
    
    if (setupIntentId.startsWith('cs_')) {
      console.log('📋 Retrieving checkout session:', setupIntentId);
      const session = await stripe.checkout.sessions.retrieve(setupIntentId);
      
      if (session.setup_intent && typeof session.setup_intent === 'string') {
        actualSetupIntentId = session.setup_intent;
        console.log('✅ Setup intent ID from session:', actualSetupIntentId);
      } else {
        return res.status(400).json({ error: 'No setup intent found in session' });
      }
    }

    // Récupérer le setup intent
    const setupIntent = await stripe.setupIntents.retrieve(actualSetupIntentId);
    console.log('✅ Setup intent retrieved:', setupIntent.id, 'Status:', setupIntent.status);

    if (setupIntent.status !== 'succeeded') {
      return res.status(400).json({ 
        error: 'Setup intent not completed',
        status: setupIntent.status 
      });
    }

    // Récupérer les détails de la méthode de paiement
    const paymentMethodId = setupIntent.payment_method as string;
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
    
    console.log('✅ Payment method retrieved:', paymentMethodId);

    return res.json({
      success: true,
      setupIntentId: actualSetupIntentId,
      paymentMethodId: paymentMethodId,
      paymentMethod: {
        id: paymentMethod.id,
        type: paymentMethod.type,
        card: paymentMethod.card ? {
          brand: paymentMethod.card.brand,
          last4: paymentMethod.card.last4,
          exp_month: paymentMethod.card.exp_month,
          exp_year: paymentMethod.card.exp_year
        } : null
      },
      metadata: setupIntent.metadata
    });

  } catch (error) {
    console.error('❌ Error checking setup intent:', error);
    return res.status(500).json({ 
      error: 'Failed to check setup intent',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});