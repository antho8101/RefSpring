import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_CONNECT_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('❌ STRIPE CONNECT: Missing webhook secret');
    return res.status(400).json({ error: 'Missing webhook secret' });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    console.log('✅ STRIPE CONNECT: Webhook verified:', event.type);
  } catch (err) {
    console.error('❌ STRIPE CONNECT: Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  try {
    switch (event.type) {
      case 'account.updated':
        await handleAccountUpdated(event.data.object);
        break;
      
      case 'capability.updated':
        await handleCapabilityUpdated(event.data.object);
        break;
      
      case 'transfer.created':
        await handleTransferCreated(event.data.object);
        break;
      
      case 'transfer.paid':
        await handleTransferPaid(event.data.object);
        break;
      
      case 'transfer.failed':
        await handleTransferFailed(event.data.object);
        break;
      
      default:
        console.log('ℹ️ STRIPE CONNECT: Unhandled event type:', event.type);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('❌ STRIPE CONNECT: Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
}

async function handleAccountUpdated(account) {
  console.log('🔄 STRIPE CONNECT: Account updated:', account.id);
  
  // Récupérer les informations sur les capacités du compte
  const capabilities = account.capabilities || {};
  const charges_enabled = account.charges_enabled;
  const payouts_enabled = account.payouts_enabled;
  
  console.log('📊 STRIPE CONNECT: Account status:', {
    id: account.id,
    charges_enabled,
    payouts_enabled,
    transfers: capabilities.transfers
  });

  // TODO: Mettre à jour le statut dans Firestore
  // Stocker les informations de statut du compte affilié
  try {
    // Note: Ici on devrait mettre à jour Firestore avec le statut du compte
    // Pour l'instant, on log juste les informations importantes
    console.log('✅ STRIPE CONNECT: Account status updated for:', account.id);
  } catch (error) {
    console.error('❌ STRIPE CONNECT: Error updating account status:', error);
  }
}

async function handleCapabilityUpdated(capability) {
  console.log('🔄 STRIPE CONNECT: Capability updated:', capability.id);
  console.log('📊 STRIPE CONNECT: Capability status:', capability.status);
  
  // Les capacités importantes pour les affiliés :
  // - transfers: capacité à recevoir des transfers
  // - card_payments: capacité à recevoir des paiements par carte
  
  if (capability.object === 'capability' && capability.status === 'active') {
    console.log('✅ STRIPE CONNECT: Capability active:', capability.id);
  }
}

async function handleTransferCreated(transfer) {
  console.log('💸 STRIPE CONNECT: Transfer created:', transfer.id);
  console.log('💰 STRIPE CONNECT: Transfer amount:', transfer.amount / 100, transfer.currency);
  console.log('🎯 STRIPE CONNECT: Transfer destination:', transfer.destination);
  
  // TODO: Enregistrer le transfer dans Firestore pour tracking
}

async function handleTransferPaid(transfer) {
  console.log('✅ STRIPE CONNECT: Transfer paid:', transfer.id);
  console.log('💰 STRIPE CONNECT: Amount paid:', transfer.amount / 100, transfer.currency);
  
  // TODO: Mettre à jour le statut du paiement dans Firestore
  // Marquer la commission comme payée
}

async function handleTransferFailed(transfer) {
  console.error('❌ STRIPE CONNECT: Transfer failed:', transfer.id);
  console.error('💰 STRIPE CONNECT: Failed amount:', transfer.amount / 100, transfer.currency);
  console.error('📝 STRIPE CONNECT: Failure reason:', transfer.failure_code, transfer.failure_message);
  
  // TODO: Gérer l'échec du transfer
  // - Alerter l'admin
  // - Marquer le paiement comme échoué
  // - Peut-être re-essayer automatiquement
}