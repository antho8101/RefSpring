import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userEmail, campaignName } = req.body;

    // Get or create customer
    let customers = await stripe.customers.list({
      email: userEmail,
      limit: 1
    });

    let customer;
    if (customers.data.length === 0) {
      customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          campaign: campaignName
        }
      });
    } else {
      customer = customers.data[0];
    }

    // Create setup intent
    const setupIntent = await stripe.setupIntents.create({
      customer: customer.id,
      payment_method_types: ['card'],
      usage: 'off_session'
    });

    res.status(200).json({ 
      clientSecret: setupIntent.client_secret,
      customerId: customer.id 
    });
  } catch (error) {
    console.error('Error creating setup intent:', error);
    res.status(500).json({ error: error.message });
  }
}