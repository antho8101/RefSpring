import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔔 STRIPE WEBHOOK - Webhook reçu');

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!webhookSecret) {
      throw new Error("STRIPE_WEBHOOK_SECRET not configured");
    }

    // Get the raw body as text
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      throw new Error("No stripe signature found");
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      console.log('✅ STRIPE WEBHOOK - Signature vérifiée:', event.type);
    } catch (err) {
      console.error('❌ STRIPE WEBHOOK - Signature invalide:', err);
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Initialize Supabase service client for database updates
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Process different webhook events
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session, stripe, supabaseService);
        break;
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice, supabaseService);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription, supabaseService);
        break;
      
      case 'setup_intent.succeeded':
        await handleSetupIntentSucceeded(event.data.object as Stripe.SetupIntent, stripe, supabaseService);
        break;
        
      default:
        console.log(`🔔 STRIPE WEBHOOK - Type non traité: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error('❌ STRIPE WEBHOOK - Erreur:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Webhook processing failed"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function handleCheckoutCompleted(session: Stripe.Checkout.Session, stripe: Stripe, supabase: any) {
  console.log('💳 STRIPE WEBHOOK - Checkout complété:', session.id);
  
  if (session.mode === 'setup' && session.setup_intent && session.customer) {
    console.log('⚙️ STRIPE WEBHOOK - Processing setup mode session');
    
    try {
      // Récupérer le setup intent pour obtenir la méthode de paiement
      const setupIntent = await stripe.setupIntents.retrieve(session.setup_intent as string, {
        expand: ['payment_method']
      });
      
      console.log('📋 STRIPE WEBHOOK - SetupIntent récupéré:', {
        setupIntentId: setupIntent.id,
        paymentMethodId: setupIntent.payment_method,
        customerId: session.customer
      });
      
      if (setupIntent.payment_method) {
        const paymentMethodId = typeof setupIntent.payment_method === 'string' 
          ? setupIntent.payment_method 
          : setupIntent.payment_method.id;
          
        console.log('💳 STRIPE WEBHOOK - Traitement méthode de paiement:', paymentMethodId);
        
        // Vérifier si la méthode de paiement est déjà attachée
        const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
        
        if (!paymentMethod.customer) {
          // Attacher la méthode de paiement au client
          await stripe.paymentMethods.attach(paymentMethodId, {
            customer: session.customer as string,
          });
          console.log('✅ STRIPE WEBHOOK - Méthode de paiement attachée');
        }
        
        // Définir comme méthode par défaut
        await stripe.customers.update(session.customer as string, {
          invoice_settings: {
            default_payment_method: paymentMethodId,
          },
        });
        
        console.log('✅ STRIPE WEBHOOK - Méthode de paiement définie par défaut');
      }
    } catch (attachError) {
      console.error('❌ STRIPE WEBHOOK - Erreur attachement:', attachError);
    }
    
    // Configuration de paiement réussie - mettre à jour la campagne
    const campaignId = session.metadata?.campaign_id;
    if (campaignId) {
      const { error } = await supabase
        .from('campaigns')
        .update({
          payment_configured: true,
          is_draft: false,
          stripe_customer_id: session.customer,
          stripe_setup_intent_id: session.setup_intent,
          stripe_payment_method_id: setupIntent.payment_method,
          updated_at: new Date().toISOString(),
        })
        .eq('id', campaignId);

      if (error) {
        console.error('❌ STRIPE WEBHOOK - Erreur mise à jour campagne:', error);
      } else {
        console.log('✅ STRIPE WEBHOOK - Campagne finalisée:', campaignId);
      }
    }
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice, supabase: any) {
  console.log('💰 STRIPE WEBHOOK - Paiement réussi:', invoice.id);
  
  if (invoice.customer && invoice.subscription) {
    console.log('📊 STRIPE WEBHOOK - Traitement paiement abonnement');
    // Add subscription payment processing logic here
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription, supabase: any) {
  console.log('🔄 STRIPE WEBHOOK - Abonnement mis à jour:', subscription.id);
  // Add subscription update logic here
}

async function handleSetupIntentSucceeded(setupIntent: Stripe.SetupIntent, stripe: Stripe, supabase: any) {
  console.log('⚙️ STRIPE WEBHOOK - SetupIntent réussi:', setupIntent.id);
  
  if (setupIntent.customer && setupIntent.payment_method) {
    try {
      const paymentMethodId = typeof setupIntent.payment_method === 'string' 
        ? setupIntent.payment_method 
        : setupIntent.payment_method.id;
        
      console.log('💳 STRIPE WEBHOOK - Traitement SetupIntent:', {
        setupIntentId: setupIntent.id,
        customerId: setupIntent.customer,
        paymentMethodId: paymentMethodId
      });
      
      // Vérifier si la méthode de paiement est déjà attachée
      const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
      
      if (!paymentMethod.customer) {
        // Attacher la méthode de paiement
        await stripe.paymentMethods.attach(paymentMethodId, {
          customer: setupIntent.customer as string,
        });
        console.log('✅ STRIPE WEBHOOK - Méthode de paiement attachée via SetupIntent');
      }
      
      // Mettre à jour la méthode de paiement par défaut
      await stripe.customers.update(setupIntent.customer as string, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
      
      console.log('✅ STRIPE WEBHOOK - Méthode par défaut définie via SetupIntent');
    } catch (error) {
      console.error('❌ STRIPE WEBHOOK - Erreur SetupIntent:', error);
    }
  }
}