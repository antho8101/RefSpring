import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userEmail } = req.body;

    // Get customer by email
    const customers = await stripe.customers.list({
      email: userEmail,
      limit: 1
    });

    if (customers.data.length === 0) {
      return res.status(200).json({ paymentMethods: [] });
    }

    const customer = customers.data[0];

    // Get payment methods for customer
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customer.id,
      type: 'card'
    });

    // Format the payment methods to match the expected structure  
    const formattedMethods = paymentMethods.data.map(pm => ({
      id: pm.id,
      type: pm.type,
      last4: pm.card?.last4 || '',
      brand: pm.card?.brand || '',
      exp_month: pm.card?.exp_month || 0,
      exp_year: pm.card?.exp_year || 0,
      isDefault: customer.invoice_settings?.default_payment_method === pm.id
    }));

    res.status(200).json({ paymentMethods: formattedMethods });
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    res.status(500).json({ error: error.message });
  }
}