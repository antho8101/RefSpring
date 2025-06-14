
import Stripe from 'stripe';

export default async function handler(req, res) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { setupIntentId } = req.query;

    if (!setupIntentId) {
      return res.status(400).json({ error: 'Missing setupIntentId parameter' });
    }

    console.log('🔄 CHECK-SETUP: Vérification du statut pour:', setupIntentId);

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // Récupérer la session checkout
    const session = await stripe.checkout.sessions.retrieve(setupIntentId, {
      expand: ['setup_intent', 'setup_intent.payment_method']
    });

    console.log('📋 CHECK-SETUP: Session récupérée:', {
      sessionId: session.id,
      status: session.status,
      setupIntentStatus: session.setup_intent?.status
    });

    if (session.status !== 'complete') {
      return res.status(200).json({
        status: 'pending',
        message: 'Setup not completed yet'
      });
    }

    if (!session.setup_intent) {
      return res.status(400).json({ error: 'No setup intent found' });
    }

    const setupIntent = session.setup_intent;

    if (setupIntent.status === 'succeeded' && setupIntent.payment_method) {
      const paymentMethodId = typeof setupIntent.payment_method === 'string' 
        ? setupIntent.payment_method 
        : setupIntent.payment_method.id;

      console.log('💳 CHECK-SETUP: Setup réussi, finalisation de l\'attachement:', paymentMethodId);

      // Vérifier si la méthode de paiement est déjà attachée
      const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
      
      let attachmentResult = 'already_attached';
      if (!paymentMethod.customer && session.customer) {
        // Attacher la méthode de paiement au client
        await stripe.paymentMethods.attach(paymentMethodId, {
          customer: session.customer,
        });
        attachmentResult = 'attached';
        console.log('✅ CHECK-SETUP: Méthode de paiement attachée');
      }
      
      // Définir comme méthode par défaut
      if (session.customer) {
        await stripe.customers.update(session.customer, {
          invoice_settings: {
            default_payment_method: paymentMethodId,
          },
        });
        console.log('✅ CHECK-SETUP: Méthode de paiement définie par défaut');
      }

      // **NOUVEAU: Sauvegarder directement dans Firebase si c'est pour une campagne**
      const campaignId = session.metadata?.campaign_id;
      if (campaignId && campaignId !== 'temp_payment_method') {
        console.log('🔥 CHECK-SETUP: Sauvegarde dans Firebase pour campagne:', campaignId);
        
        try {
          // Appeler l'API de finalisation de campagne côté client
          const finalizeResponse = await fetch(`${req.headers.origin || 'https://refspring.com'}/api/finalize-campaign`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              campaignId,
              stripeCustomerId: session.customer,
              stripePaymentMethodId: paymentMethodId,
              setupIntentId: setupIntent.id
            })
          });
          
          if (finalizeResponse.ok) {
            console.log('✅ CHECK-SETUP: Campagne finalisée dans Firebase');
          } else {
            console.error('❌ CHECK-SETUP: Erreur finalisation Firebase:', await finalizeResponse.text());
          }
        } catch (firebaseError) {
          console.error('❌ CHECK-SETUP: Erreur communication Firebase:', firebaseError);
          // Ne pas faire échouer la réponse Stripe pour autant
        }
      }

      return res.status(200).json({
        status: 'succeeded',
        setupIntentId: setupIntent.id,
        paymentMethodId: paymentMethodId,
        customerId: session.customer,
        campaignId: session.metadata?.campaign_id,
        attachmentResult: attachmentResult,
        message: 'Payment method successfully configured'
      });
    }

    return res.status(200).json({
      status: setupIntent.status,
      message: `Setup status: ${setupIntent.status}`
    });

  } catch (error) {
    console.error('❌ CHECK-SETUP: Erreur:', error);
    return res.status(500).json({ error: error.message });
  }
}
