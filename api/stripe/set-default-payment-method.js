
import Stripe from 'stripe';

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
    const { userEmail, paymentMethodId } = req.body;

    if (!userEmail || !paymentMethodId) {
      return res.status(400).json({ error: 'Email et ID de méthode de paiement requis' });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // Trouver le client Stripe
    const customers = await stripe.customers.list({
      email: userEmail,
      limit: 1
    });

    if (customers.data.length === 0) {
      return res.status(404).json({ error: 'Client Stripe non trouvé' });
    }

    const customerId = customers.data[0].id;

    // Définir la méthode de paiement par défaut
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId
      }
    });

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('❌ Erreur set-default-payment-method:', error);
    return res.status(500).json({ error: error.message });
  }
}
