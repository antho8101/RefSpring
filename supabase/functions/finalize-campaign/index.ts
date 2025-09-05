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
    console.log('🎯 FINALIZE CAMPAIGN - Début traitement');

    // Initialize Supabase client with service role for database writes
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: { persistSession: false }
      }
    );

    // Get authenticated user using anon key
    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseAuth.auth.getUser(token);
    const user = data.user;
    
    if (!user?.email) {
      throw new Error("User not authenticated");
    }

    console.log('👤 FINALIZE CAMPAIGN - Utilisateur:', user.email);

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    const { campaignData, cardId } = await req.json();

    console.log('📋 FINALIZE CAMPAIGN - Données reçues:', { 
      campaignName: campaignData.name,
      cardId: cardId?.substring(0, 8) + '...' 
    });

    // Validate required data
    if (!campaignData || !cardId) {
      return new Response(JSON.stringify({ 
        error: "Campaign data and card ID are required" 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Find customer by email
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1
    });

    if (customers.data.length === 0) {
      return new Response(JSON.stringify({ 
        error: "Stripe customer not found" 
      }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const customer = customers.data[0];
    console.log('👤 FINALIZE CAMPAIGN - Client Stripe trouvé:', customer.id);

    // Verify payment method exists and belongs to customer
    const paymentMethod = await stripe.paymentMethods.retrieve(cardId);
    
    if (paymentMethod.customer !== customer.id) {
      return new Response(JSON.stringify({ 
        error: "Payment method does not belong to customer" 
      }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log('💳 FINALIZE CAMPAIGN - Carte vérifiée:', paymentMethod.card?.last4);

    // Create campaign in database
    const { data: newCampaign, error: campaignError } = await supabaseClient
      .from('campaigns')
      .insert([
        {
          user_id: user.id,
          name: campaignData.name,
          description: campaignData.description,
          target_url: campaignData.targetUrl,
          default_commission_rate: campaignData.defaultCommissionRate || 0,
          stripe_customer_id: customer.id,
          stripe_payment_method_id: cardId,
          payment_configured: true,
          is_draft: false,
          is_active: true,
        }
      ])
      .select()
      .single();

    if (campaignError) {
      console.error('❌ FINALIZE CAMPAIGN - Erreur création campagne:', campaignError);
      throw new Error(`Failed to create campaign: ${campaignError.message}`);
    }

    console.log('✅ FINALIZE CAMPAIGN - Campagne créée:', newCampaign.id);

    return new Response(JSON.stringify({
      success: true,
      campaign: newCampaign,
      message: "Campaign finalized successfully"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error('❌ FINALIZE CAMPAIGN - Erreur:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Internal server error"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});