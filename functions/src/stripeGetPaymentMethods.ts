import * as functions from 'firebase-functions';
import { stripe } from './stripeConfig';
// import { db } from "firebase-admin/firestore";

export const stripeGetPaymentMethods = functions.https.onRequest(async (req, res) => {
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
    const { userEmail } = req.body;

    if (!userEmail) {
      return res.status(400).json({ error: 'userEmail is required' });
    }

    console.log('🔍 Getting payment methods for:', userEmail);

    // Chercher le customer Stripe par email
    const customers = await stripe.customers.list({
      email: userEmail,
      limit: 1
    });

    if (customers.data.length === 0) {
      console.log('📭 No Stripe customer found for:', userEmail);
      return res.json({ paymentMethods: [] });
    }

    const customer = customers.data[0];
    console.log('👤 Found customer:', customer.id);

    // Récupérer les méthodes de paiement
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customer.id,
      type: 'card',
    });

    const formattedMethods = paymentMethods.data.map(pm => ({
      id: pm.id,
      type: pm.type,
      last4: pm.card?.last4 || '',
      brand: pm.card?.brand || '',
      exp_month: pm.card?.exp_month || 0,
      exp_year: pm.card?.exp_year || 0,
      isDefault: customer.invoice_settings?.default_payment_method === pm.id
    }));

    console.log('💳 Found payment methods:', formattedMethods.length);

    return res.json({ paymentMethods: formattedMethods });

  } catch (error) {
    console.error('❌ Error getting payment methods:', error);
    return res.status(500).json({ 
      error: 'Failed to get payment methods',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});