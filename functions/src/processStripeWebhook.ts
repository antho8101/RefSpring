
import { onRequest } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export const processStripeWebhook = onRequest(
  { cors: false },
  async (req, res) => {
    console.log('🔔 WEBHOOK - Webhook Stripe reçu');
    
    const sig = req.headers['stripe-signature'] as string;
    let event: Stripe.Event;

    try {
      // Vérifier la signature du webhook
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
      console.log('✅ WEBHOOK - Signature vérifiée:', event.type);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('❌ WEBHOOK - Signature invalide:', errorMessage);
      res.status(400).send(`Webhook signature verification failed: ${errorMessage}`);
      return;
    }

    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
          break;
        
        case 'invoice.payment_succeeded':
          await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
          break;
        
        case 'customer.subscription.updated':
          await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;
        
        case 'setup_intent.succeeded':
          await handleSetupIntentSucceeded(event.data.object as Stripe.SetupIntent);
          break;
        
        default:
          console.log(`🔔 WEBHOOK - Type non traité: ${event.type}`);
      }

      res.json({ received: true });
    } catch (error: unknown) {
      console.error('❌ WEBHOOK - Erreur traitement:', error);
      res.status(500).send('Erreur traitement webhook');
    }
  }
);

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('💳 WEBHOOK - Checkout complété:', session.id);
  
  if (session.mode === 'setup' && session.setup_intent) {
    console.log('⚙️ WEBHOOK - Processing setup mode session');
    
    try {
      // Récupérer le setup intent pour obtenir la méthode de paiement
      const setupIntent = await stripe.setupIntents.retrieve(session.setup_intent as string);
      console.log('📋 WEBHOOK - SetupIntent récupéré:', setupIntent.id);
      
      if (setupIntent.payment_method && session.customer) {
        console.log('💳 WEBHOOK - Attachement de la méthode de paiement au client');
        
        // Forcer l'attachement de la méthode de paiement au client
        try {
          await stripe.paymentMethods.attach(setupIntent.payment_method as string, {
            customer: session.customer as string,
          });
          console.log('✅ WEBHOOK - Méthode de paiement attachée au client');
        } catch (attachError: any) {
          // Si déjà attachée, continuer
          if (attachError.code !== 'resource_already_exists') {
            throw attachError;
          }
          console.log('✅ WEBHOOK - Méthode de paiement déjà attachée');
        }
        
        // Définir comme méthode par défaut
        await stripe.customers.update(session.customer as string, {
          invoice_settings: {
            default_payment_method: setupIntent.payment_method as string,
          },
        });
        
        console.log('✅ WEBHOOK - Méthode de paiement définie par défaut');
      }
    } catch (attachError) {
      console.error('❌ WEBHOOK - Erreur lors de l\'attachement:', attachError);
      // Ne pas faire échouer le webhook pour cette erreur
    }
    
    // Configuration de paiement réussie
    const campaignId = session.metadata?.campaign_id;
    if (campaignId) {
      await admin.firestore()
        .collection('campaigns')
        .doc(campaignId)
        .update({
          paymentConfigured: true,
          isDraft: false,
          stripeCustomerId: session.customer,
          stripeSetupIntentId: session.setup_intent,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      
      console.log('✅ WEBHOOK - Campagne finalisée:', campaignId);
    }
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('💰 WEBHOOK - Paiement réussi:', invoice.id);
  
  if (invoice.customer && invoice.subscription) {
    // Traitement des paiements d'abonnement
    console.log('📊 WEBHOOK - Traitement paiement abonnement');
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('🔄 WEBHOOK - Abonnement mis à jour:', subscription.id);
}

async function handleSetupIntentSucceeded(setupIntent: Stripe.SetupIntent) {
  console.log('⚙️ WEBHOOK - SetupIntent réussi:', setupIntent.id);
  
  if (setupIntent.customer && setupIntent.payment_method) {
    try {
      // Forcer l'attachement de la méthode de paiement
      try {
        await stripe.paymentMethods.attach(setupIntent.payment_method as string, {
          customer: setupIntent.customer as string,
        });
        console.log('✅ WEBHOOK - Méthode de paiement attachée via SetupIntent');
      } catch (attachError: any) {
        // Si déjà attachée, continuer
        if (attachError.code !== 'resource_already_exists') {
          throw attachError;
        }
        console.log('✅ WEBHOOK - Méthode de paiement déjà attachée via SetupIntent');
      }
      
      // Mettre à jour la méthode de paiement par défaut
      await stripe.customers.update(setupIntent.customer as string, {
        invoice_settings: {
          default_payment_method: setupIntent.payment_method as string,
        },
      });
      
      console.log('✅ WEBHOOK - Méthode de paiement définie par défaut via SetupIntent');
    } catch (error) {
      console.error('❌ WEBHOOK - Erreur lors de l\'attachement via SetupIntent:', error);
    }
  }
}
