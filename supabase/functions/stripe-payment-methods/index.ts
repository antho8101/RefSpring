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
    console.log('💳 STRIPE PAYMENT METHODS - Début traitement');

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

    console.log('👤 STRIPE PAYMENT METHODS - Utilisateur:', user.email);

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Handle different HTTP methods
    if (req.method === "GET") {
      return await handleGetPaymentMethods(stripe, user.email);
    } else if (req.method === "POST") {
      const body = await req.json();
      
      // Si aucune action spécifiée, c'est un GET via POST (pour compatibilité)
      if (!body || !body.action || body.action === undefined) {
        console.log('📋 POST sans action - Redirection vers GET');
        return await handleGetPaymentMethods(stripe, user.email);
      }
      
      return await handlePaymentMethodAction(stripe, body, user.email);
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error('❌ STRIPE PAYMENT METHODS - Erreur:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Internal server error"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function handleGetPaymentMethods(stripe: Stripe, userEmail: string) {
  console.log('📋 GET PAYMENT METHODS - Récupération pour:', userEmail);

  try {
    // Find customer by email
    const customers = await stripe.customers.list({
      email: userEmail,
      limit: 1
    });

    if (customers.data.length === 0) {
      console.log('👤 GET PAYMENT METHODS - Aucun client Stripe trouvé');
      return new Response(JSON.stringify({ paymentMethods: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customer = customers.data[0];
    console.log('👤 GET PAYMENT METHODS - Client trouvé:', customer.id);

    // Get payment methods for customer
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customer.id,
      type: 'card',
    });

    console.log('💳 GET PAYMENT METHODS - Méthodes trouvées:', paymentMethods.data.length);

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

    return new Response(JSON.stringify({ 
      paymentMethods: formattedMethods,
      customerId: customer.id 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error('❌ GET PAYMENT METHODS - Erreur:', error);
    throw error;
  }
}

async function handlePaymentMethodAction(stripe: Stripe, body: any, userEmail: string) {
  const { action, customerId, paymentMethodId } = body;

  console.log('⚙️ PAYMENT METHOD ACTION - Action:', action);

  if (action === 'delete') {
    // Delete/detach payment method
    if (!paymentMethodId) {
      return new Response(JSON.stringify({ error: "Payment method ID required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await stripe.paymentMethods.detach(paymentMethodId);
    console.log('✅ PAYMENT METHOD ACTION - Méthode supprimée');
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } else if (action === 'attach') {
    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    console.log('✅ PAYMENT METHOD ACTION - Méthode attachée');
    return new Response(JSON.stringify({ success: true }), {
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

    console.log('✅ PAYMENT METHOD ACTION - Méthode définie par défaut');
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }

  return new Response(JSON.stringify({ error: "Invalid action" }), {
    status: 400,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
