
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
    const { paymentMethodId } = req.body;

    if (!paymentMethodId) {
      return res.status(400).json({ error: 'ID de méthode de paiement requis' });
    }

    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

    // Détacher la méthode de paiement
    await stripe.paymentMethods.detach(paymentMethodId);

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('❌ Erreur delete-payment-method:', error);
    return res.status(500).json({ error: error.message });
  }
}
