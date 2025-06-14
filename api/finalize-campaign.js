
import admin from 'firebase-admin';

// Initialiser Firebase Admin si pas déjà fait
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID || 'refspring-8c3ac',
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

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
    const { campaignId, stripeCustomerId, stripePaymentMethodId, setupIntentId } = req.body;

    if (!campaignId || !stripePaymentMethodId) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    console.log('🔥 FINALIZE: Finalisation campagne dans Firebase:', {
      campaignId,
      stripeCustomerId,
      stripePaymentMethodId: stripePaymentMethodId.substring(0, 10) + '...'
    });

    const db = admin.firestore();
    
    // Mettre à jour la campagne avec les données Stripe
    await db.collection('campaigns').doc(campaignId).update({
      isDraft: false,
      paymentConfigured: true,
      stripeCustomerId: stripeCustomerId,
      stripePaymentMethodId: stripePaymentMethodId,
      stripeSetupIntentId: setupIntentId,
      finalizedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log('✅ FINALIZE: Campagne finalisée avec succès dans Firebase');

    return res.status(200).json({
      success: true,
      message: 'Campaign finalized successfully',
      campaignId,
      stripePaymentMethodId
    });

  } catch (error) {
    console.error('❌ FINALIZE: Erreur:', error);
    return res.status(500).json({ error: error.message });
  }
}
