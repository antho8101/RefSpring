
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
    const { campaignId, campaignName, userEmail } = req.body;

    if (!campaignId || !campaignName || !userEmail) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    console.log('🔄 CREATE-SETUP: Création setup pour:', { campaignId, campaignName, userEmail });

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // Vérifier si un client existe déjà
    const customers = await stripe.customers.list({
      email: userEmail,
      limit: 1
    });

    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      console.log('✅ CREATE-SETUP: Client existant trouvé:', customerId);
    } else {
      // Créer un nouveau client
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: { source: 'RefSpring' }
      });
      customerId = customer.id;
      console.log('✅ CREATE-SETUP: Nouveau client créé:', customerId);
    }

    // Construire l'URL de base correctement pour Vercel
    const origin = req.headers.origin || req.headers.host;
    const baseUrl = origin ? (origin.startsWith('http') ? origin : `https://${origin}`) : 'https://refspring.com';

    console.log('🔄 CREATE-SETUP: Création session checkout avec cartes classiques forcées');

    // Créer une session Checkout en FORÇANT les cartes classiques
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'setup',
      currency: 'eur',
      payment_method_types: ['card'], // Force uniquement les cartes classiques
      payment_method_options: {
        card: {
          setup_future_usage: 'off_session' // Force l'attachement pour usage futur
        }
      },
      success_url: `${baseUrl}/payment-success?setup_intent={CHECKOUT_SESSION_ID}&campaign_id=${campaignId}`,
      cancel_url: `${baseUrl}/dashboard`,
      metadata: {
        campaign_id: campaignId,
        campaign_name: campaignName,
        customer_id: customerId
      }
    });

    console.log('✅ CREATE-SETUP: Session créée avec cartes forcées:', {
      sessionId: session.id,
      customerId: customerId,
      paymentMethodTypes: session.payment_method_types
    });

    return res.status(200).json({
      setupIntentId: session.id,
      stripeCustomerId: customerId,
      checkoutUrl: session.url
    });

  } catch (error) {
    console.error('❌ CREATE-SETUP: Erreur:', error);
    return res.status(500).json({ error: error.message });
  }
}
