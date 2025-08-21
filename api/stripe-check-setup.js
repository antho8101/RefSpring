import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { setupIntentId } = req.body;

    const setupIntent = await stripe.setupIntents.retrieve(setupIntentId);

    if (setupIntent.status === 'succeeded') {
      res.status(200).json({ 
        success: true,
        paymentMethodId: setupIntent.payment_method,
        customerId: setupIntent.customer
      });
    } else {
      res.status(400).json({ 
        error: 'Setup intent not completed',
        status: setupIntent.status 
      });
    }
  } catch (error) {
    console.error('Error checking setup intent:', error);
    res.status(500).json({ error: error.message });
  }
}