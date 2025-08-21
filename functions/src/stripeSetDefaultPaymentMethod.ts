import * as functions from 'firebase-functions';
import { stripe } from './stripeConfig';

export const stripeSetDefaultPaymentMethod = functions.https.onRequest(async (req, res) => {
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
    const { userEmail, paymentMethodId } = req.body;

    if (!userEmail || !paymentMethodId) {
      return res.status(400).json({ error: 'userEmail and paymentMethodId are required' });
    }

    console.log('⭐ Setting default payment method:', paymentMethodId, 'for:', userEmail);

    // Chercher le customer Stripe par email
    const customers = await stripe.customers.list({
      email: userEmail,
      limit: 1
    });

    if (customers.data.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const customer = customers.data[0];

    // Définir la méthode comme par défaut
    await stripe.customers.update(customer.id, {
      invoice_settings: {
        default_payment_method: paymentMethodId
      }
    });

    console.log('✅ Default payment method set successfully');

    return res.json({ success: true });

  } catch (error) {
    console.error('❌ Error setting default payment method:', error);
    return res.status(500).json({ 
      error: 'Failed to set default payment method',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});