
import Stripe from 'stripe';

export default async function handler(req, res) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { setupIntentId } = req.query;

    if (!setupIntentId) {
      return res.status(400).json({ error: 'Setup Intent ID requis' });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // Si c'est un ID de session Checkout, récupérer la session
    if (setupIntentId.startsWith('cs_')) {
      const session = await stripe.checkout.sessions.retrieve(setupIntentId);
      
      if (session.setup_intent) {
        const setupIntent = await stripe.setupIntents.retrieve(session.setup_intent);
        return res.status(200).json({
          status: setupIntent.status,
          paymentMethod: setupIntent.payment_method
        });
      }
      
      return res.status(200).json({
        status: session.status === 'complete' ? 'succeeded' : 'incomplete'
      });
    }

    // Sinon, c'est directement un Setup Intent
    const setupIntent = await stripe.setupIntents.retrieve(setupIntentId);
    
    return res.status(200).json({
      status: setupIntent.status,
      paymentMethod: setupIntent.payment_method
    });

  } catch (error) {
    console.error('❌ Erreur check-setup:', error);
    return res.status(500).json({ error: error.message });
  }
}
