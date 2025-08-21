import * as functions from 'firebase-functions';
import { stripe } from './stripeConfig';

export const stripeDeletePaymentMethod = functions.https.onRequest(async (req, res) => {
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
    const { paymentMethodId } = req.body;

    if (!paymentMethodId) {
      return res.status(400).json({ error: 'paymentMethodId is required' });
    }

    console.log('🗑️ Deleting payment method:', paymentMethodId);

    // Détacher la méthode de paiement
    await stripe.paymentMethods.detach(paymentMethodId);

    console.log('✅ Payment method deleted successfully');

    return res.json({ success: true });

  } catch (error) {
    console.error('❌ Error deleting payment method:', error);
    return res.status(500).json({ 
      error: 'Failed to delete payment method',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});