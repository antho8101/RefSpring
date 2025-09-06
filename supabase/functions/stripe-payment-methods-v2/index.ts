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
    console.log('💳 STRIPE PAYMENT METHODS V2 - Début traitement [SECRET-UPDATED-2025-01-11]');

    // DIAGNOSTIC COMPLET DES VARIABLES D'ENVIRONNEMENT
    console.log('🔍 DIAGNOSTIC V2 - Variables d\'environnement disponibles:');
    console.log('  - SUPABASE_URL:', !!Deno.env.get("SUPABASE_URL"));
    console.log('  - SUPABASE_ANON_KEY:', !!Deno.env.get("SUPABASE_ANON_KEY"));
    console.log('  - SUPABASE_SERVICE_ROLE_KEY:', !!Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));
    console.log('  - STRIPE_SECRET_KEY:', !!Deno.env.get("STRIPE_SECRET_KEY"));
    console.log('  - STRIPE_WEBHOOK_SECRET:', !!Deno.env.get("STRIPE_WEBHOOK_SECRET"));
    console.log('  - SHOPIFY_API_KEY:', !!Deno.env.get("SHOPIFY_API_KEY"));
    console.log('  - SHOPIFY_API_SECRET:', !!Deno.env.get("SHOPIFY_API_SECRET"));
    
    // Liste TOUTES les variables d'environnement disponibles (masquées)
    const allEnvVars = Object.keys(Deno.env.toObject());
    console.log('🔍 DIAGNOSTIC V2 - Toutes les variables disponibles:', allEnvVars.length, 'variables');
    console.log('🔍 DIAGNOSTIC V2 - Variables contenant "STRIPE":', allEnvVars.filter(key => key.includes('STRIPE')));
    console.log('🔍 DIAGNOSTIC V2 - Variables contenant "SECRET":', allEnvVars.filter(key => key.includes('SECRET')).map(key => `${key}=[MASKED]`));

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
      console.error('❌ AUTH V2 - Utilisateur non authentifié');
      throw new Error("User not authenticated");
    }

    console.log('👤 UTILISATEUR V2 - Email:', user.email);

    // Check if Stripe secret key is available avec diagnostic avancé
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    console.log('🔑 STRIPE SECRET KEY V2 - Disponible:', !!stripeSecretKey);
    console.log('🔑 STRIPE SECRET KEY V2 - Longueur:', stripeSecretKey?.length || 0);
    console.log('🔑 STRIPE SECRET KEY V2 - Commence par sk_:', stripeSecretKey?.startsWith('sk_') || false);
    
    if (!stripeSecretKey) {
      console.error('❌ STRIPE SECRET KEY V2 - Variable manquante dans l\'environnement');
      console.error('❌ DIAGNOSTIC V2 - Vérifiez que le secret STRIPE_SECRET_KEY existe dans Supabase');
      console.error('❌ DIAGNOSTIC V2 - Vérifiez que supabase/config.toml contient [functions.stripe-payment-methods-v2]');
      throw new Error("STRIPE_SECRET_KEY not found in environment variables - Check Supabase secrets configuration");
    }

    console.log('✅ V2 - STRIPE SECRET KEY trouvée, initialisation de Stripe...');

    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    console.log('✅ V2 - Stripe initialisé avec succès');

    // Handle different HTTP methods
    if (req.method === "GET") {
      return await handleGetPaymentMethods(stripe, user.email);
    } else if (req.method === "POST") {
      const body = await req.json();
      
      // Si aucune action spécifiée, c'est un GET via POST (pour compatibilité)
      if (!body || !body.action || body.action === undefined) {
        console.log('📋 V2 - POST sans action - Redirection vers GET');
        return await handleGetPaymentMethods(stripe, user.email);
      }
      
      return await handlePaymentMethodAction(stripe, body, user.email);
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error('❌ STRIPE PAYMENT METHODS V2 - Erreur:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Internal server error",
      function_version: "v2",
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function handleGetPaymentMethods(stripe: Stripe, userEmail: string) {
  console.log('📋 GET PAYMENT METHODS V2 - Récupération pour:', userEmail);

  try {
    // Find customer by email
    const customers = await stripe.customers.list({
      email: userEmail,
      limit: 1
    });

    if (customers.data.length === 0) {
      console.log('👤 GET PAYMENT METHODS V2 - Aucun client Stripe trouvé');
      return new Response(JSON.stringify({ paymentMethods: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customer = customers.data[0];
    console.log('👤 GET PAYMENT METHODS V2 - Client trouvé:', customer.id);

    // Get payment methods for customer
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customer.id,
      type: 'card',
    });

    console.log('💳 GET PAYMENT METHODS V2 - Méthodes trouvées:', paymentMethods.data.length);

    // Get default payment method
    const defaultPaymentMethodId = typeof customer.invoice_settings?.default_payment_method === 'string' 
      ? customer.invoice_settings.default_payment_method
      : null;

    // Format payment methods for frontend
    const formattedMethods = paymentMethods.data.map(pm => ({
      id: pm.id,
      type: pm.type,
      card: pm.card ? {
        brand: pm.card.brand,
        last4: pm.card.last4,
        exp_month: pm.card.exp_month,
        exp_year: pm.card.exp_year,
      } : null,
      isDefault: pm.id === defaultPaymentMethodId,
      created: pm.created,
    }));

    console.log('✅ GET PAYMENT METHODS V2 - Méthodes formatées avec succès');

    return new Response(JSON.stringify({ 
      paymentMethods: formattedMethods,
      customerId: customer.id,
      function_version: "v2"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error('❌ GET PAYMENT METHODS V2 - Erreur:', error);
    throw error;
  }
}

async function handlePaymentMethodAction(stripe: Stripe, body: any, userEmail: string) {
  const { action, customerId, paymentMethodId } = body;

  console.log('⚙️ PAYMENT METHOD ACTION V2 - Action:', action);

  if (action === 'delete') {
    // Delete/detach payment method
    if (!paymentMethodId) {
      return new Response(JSON.stringify({ error: "Payment method ID required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await stripe.paymentMethods.detach(paymentMethodId);
    console.log('✅ PAYMENT METHOD ACTION V2 - Méthode supprimée');
    
    return new Response(JSON.stringify({ success: true, function_version: "v2" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } else if (action === 'attach') {
    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    console.log('✅ PAYMENT METHOD ACTION V2 - Méthode attachée');
    return new Response(JSON.stringify({ success: true, function_version: "v2" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } else if (action === 'set_default') {
    // Set as default payment method - need to find customer first
    if (!paymentMethodId) {
      return new Response(JSON.stringify({ error: "Payment method ID required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Find customer by email
    const customers = await stripe.customers.list({
      email: userEmail,
      limit: 1
    });

    if (customers.data.length === 0) {
      return new Response(JSON.stringify({ error: "Customer not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const customer = customers.data[0];
    
    // Set as default payment method
    await stripe.customers.update(customer.id, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    console.log('✅ PAYMENT METHOD ACTION V2 - Méthode définie par défaut');
    return new Response(JSON.stringify({ success: true, function_version: "v2" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }

  return new Response(JSON.stringify({ error: "Invalid action" }), {
    status: 400,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}