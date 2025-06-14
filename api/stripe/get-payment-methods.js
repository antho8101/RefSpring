
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

    console.log('🔍 GET-PAYMENT-METHODS: Recherche pour email:', userEmail);

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // Trouver le client Stripe
    const customers = await stripe.customers.list({
      email: userEmail,
      limit: 1
    });

    if (customers.data.length === 0) {
      console.log('❌ GET-PAYMENT-METHODS: Aucun client trouvé pour:', userEmail);
      return res.status(200).json({ paymentMethods: [] });
    }

    const customerId = customers.data[0].id;
    console.log('✅ GET-PAYMENT-METHODS: Client trouvé:', customerId);

    // Récupérer les méthodes de paiement
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card'
    });

    console.log('💳 GET-PAYMENT-METHODS: Cartes trouvées:', paymentMethods.data.length);

    // Récupérer la méthode de paiement par défaut
    const customer = await stripe.customers.retrieve(customerId);
    let defaultPaymentMethodId = null;

    // Vérifier dans invoice_settings
    if (customer.invoice_settings?.default_payment_method) {
      defaultPaymentMethodId = customer.invoice_settings.default_payment_method;
    }
    // Sinon, vérifier dans default_source (pour les anciennes cartes)
    else if (customer.default_source) {
      defaultPaymentMethodId = customer.default_source;
    }

    console.log('🌟 GET-PAYMENT-METHODS: Carte par défaut:', defaultPaymentMethodId);

    // Formater les données
    const formattedMethods = paymentMethods.data.map(pm => {
      const isDefault = pm.id === defaultPaymentMethodId;
      console.log(`💳 GET-PAYMENT-METHODS: Carte ${pm.id} (${pm.card.brand} ****${pm.card.last4}) - défaut: ${isDefault}`);
      
      return {
        id: pm.id,
        type: pm.type,
        last4: pm.card.last4,
        brand: pm.card.brand,
        exp_month: pm.card.exp_month,
        exp_year: pm.card.exp_year,
        isDefault: isDefault
      };
    });

    console.log('✅ GET-PAYMENT-METHODS: Réponse finale:', formattedMethods.length, 'cartes');

    return res.status(200).json({ paymentMethods: formattedMethods });

  } catch (error) {
    console.error('❌ GET-PAYMENT-METHODS: Erreur:', error);
    return res.status(500).json({ error: error.message });
  }
}
