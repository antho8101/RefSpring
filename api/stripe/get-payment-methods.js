
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
    const { userEmail } = req.body;

    if (!userEmail) {
      return res.status(400).json({ error: 'Email utilisateur requis' });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // Trouver le client Stripe
    const customers = await stripe.customers.list({
      email: userEmail,
      limit: 1
    });

    if (customers.data.length === 0) {
      return res.status(200).json({ paymentMethods: [] });
    }

    const customerId = customers.data[0].id;

    // Récupérer les méthodes de paiement
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card'
    });

    // Récupérer la méthode de paiement par défaut
    const customer = await stripe.customers.retrieve(customerId);
    const defaultPaymentMethodId = customer.invoice_settings?.default_payment_method;

    // Formater les données
    const formattedMethods = paymentMethods.data.map(pm => ({
      id: pm.id,
      type: pm.type,
      last4: pm.card.last4,
      brand: pm.card.brand,
      exp_month: pm.card.exp_month,
      exp_year: pm.card.exp_year,
      isDefault: pm.id === defaultPaymentMethodId
    }));

    return res.status(200).json({ paymentMethods: formattedMethods });

  } catch (error) {
    console.error('❌ Erreur get-payment-methods:', error);
    return res.status(500).json({ error: error.message });
  }
}
