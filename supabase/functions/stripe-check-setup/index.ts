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
    console.log('🔍 STRIPE CHECK SETUP - Début traitement');

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Get authenticated user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    
    if (!user?.email) {
      throw new Error("User not authenticated");
    }

    console.log('👤 STRIPE CHECK SETUP - Utilisateur:', user.email);

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    const { setupIntentId } = await req.json();

    if (!setupIntentId) {
      return new Response(JSON.stringify({ error: "Setup Intent ID required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log('🎯 STRIPE CHECK SETUP - SetupIntent ID:', setupIntentId);

    // Retrieve setup intent
    const setupIntent = await stripe.setupIntents.retrieve(setupIntentId);

    console.log('📋 STRIPE CHECK SETUP - Statut:', setupIntent.status);

    if (setupIntent.status === 'succeeded' && setupIntent.payment_method) {
      // Attach payment method to customer if not already attached
      const paymentMethodId = typeof setupIntent.payment_method === 'string' 
        ? setupIntent.payment_method 
        : setupIntent.payment_method.id;

      const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

      if (!paymentMethod.customer) {
        await stripe.paymentMethods.attach(paymentMethodId, {
          customer: setupIntent.customer as string,
        });
        console.log('🔗 STRIPE CHECK SETUP - Méthode de paiement attachée au client');
      }

      // Optionally set as default payment method
      await stripe.customers.update(setupIntent.customer as string, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      console.log('✅ STRIPE CHECK SETUP - Setup vérifié et finalisé');

      return new Response(JSON.stringify({
        success: true,
        status: setupIntent.status,
        paymentMethodId: paymentMethodId,
        customerId: setupIntent.customer,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } else {
      console.log('⚠️ STRIPE CHECK SETUP - Setup non réussi:', setupIntent.status);
      
      return new Response(JSON.stringify({
        success: false,
        status: setupIntent.status,
        error: setupIntent.last_setup_error?.message || 'Setup intent not completed'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

  } catch (error) {
    console.error('❌ STRIPE CHECK SETUP - Erreur:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Internal server error"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});