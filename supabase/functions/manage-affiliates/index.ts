import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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
    console.log('👥 MANAGE AFFILIATES - Début traitement');

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
    
    if (!user) {
      throw new Error("User not authenticated");
    }

    console.log('👤 MANAGE AFFILIATES - Utilisateur:', user.id);

    // Handle different HTTP methods
    if (req.method === "GET") {
      return await handleGetAffiliates(supabaseClient, user.id);
    } else if (req.method === "POST") {
      const body = await req.json();
      return await handleCreateAffiliate(supabaseClient, body, user.id);
    } else if (req.method === "PUT") {
      const body = await req.json();
      return await handleUpdateAffiliate(supabaseClient, body, user.id);
    } else if (req.method === "DELETE") {
      const url = new URL(req.url);
      const affiliateId = url.searchParams.get("id");
      return await handleDeleteAffiliate(supabaseClient, affiliateId, user.id);
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error('❌ MANAGE AFFILIATES - Erreur:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Internal server error"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function handleGetAffiliates(supabase: any, userId: string) {
  console.log('📋 GET AFFILIATES - Récupération pour:', userId);

  try {
    const { data: affiliates, error } = await supabase
      .from('affiliates')
      .select(`
        id,
        name,
        email,
        campaign_id,
        commission_rate,
        tracking_code,
        is_active,
        stripe_account_id,
        stripe_account_status,
        created_at,
        updated_at
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ GET AFFILIATES - Erreur requête:', error);
      throw error;
    }

    console.log('✅ GET AFFILIATES - Affiliés trouvés:', affiliates?.length || 0);

    return new Response(JSON.stringify({ affiliates: affiliates || [] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error('❌ GET AFFILIATES - Erreur:', error);
    throw error;
  }
}

async function handleCreateAffiliate(supabase: any, body: any, userId: string) {
  const { name, email, campaignId, commissionRate } = body;

  console.log('➕ CREATE AFFILIATE - Données:', { name, email, campaignId, commissionRate });

  // Validation
  if (!name || !email || !campaignId) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Generate unique tracking code
  const trackingCode = generateTrackingCode(name);

  try {
    // Verify campaign belongs to user
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('id')
      .eq('id', campaignId)
      .eq('user_id', userId)
      .single();

    if (campaignError || !campaign) {
      return new Response(JSON.stringify({ error: "Campaign not found or not authorized" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create affiliate
    const { data: affiliate, error } = await supabase
      .from('affiliates')
      .insert({
        user_id: userId,
        campaign_id: campaignId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        commission_rate: commissionRate || 10.00,
        tracking_code: trackingCode,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('❌ CREATE AFFILIATE - Erreur insertion:', error);
      throw error;
    }

    console.log('✅ CREATE AFFILIATE - Affilié créé:', affiliate.id);

    return new Response(JSON.stringify({ affiliate }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 201,
    });

  } catch (error) {
    console.error('❌ CREATE AFFILIATE - Erreur:', error);
    throw error;
  }
}

async function handleUpdateAffiliate(supabase: any, body: any, userId: string) {
  const { id, name, email, commissionRate, isActive } = body;

  console.log('✏️ UPDATE AFFILIATE - ID:', id);

  if (!id) {
    return new Response(JSON.stringify({ error: "Affiliate ID required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const updateData: any = { updated_at: new Date().toISOString() };
    
    if (name !== undefined) updateData.name = name.trim();
    if (email !== undefined) updateData.email = email.trim().toLowerCase();
    if (commissionRate !== undefined) updateData.commission_rate = commissionRate;
    if (isActive !== undefined) updateData.is_active = isActive;

    const { data: affiliate, error } = await supabase
      .from('affiliates')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('❌ UPDATE AFFILIATE - Erreur:', error);
      throw error;
    }

    if (!affiliate) {
      return new Response(JSON.stringify({ error: "Affiliate not found or not authorized" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log('✅ UPDATE AFFILIATE - Affilié mis à jour:', affiliate.id);

    return new Response(JSON.stringify({ affiliate }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error('❌ UPDATE AFFILIATE - Erreur:', error);
    throw error;
  }
}

async function handleDeleteAffiliate(supabase: any, affiliateId: string | null, userId: string) {
  console.log('🗑️ DELETE AFFILIATE - ID:', affiliateId);

  if (!affiliateId) {
    return new Response(JSON.stringify({ error: "Affiliate ID required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { error } = await supabase
      .from('affiliates')
      .delete()
      .eq('id', affiliateId)
      .eq('user_id', userId);

    if (error) {
      console.error('❌ DELETE AFFILIATE - Erreur:', error);
      throw error;
    }

    console.log('✅ DELETE AFFILIATE - Affilié supprimé:', affiliateId);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error('❌ DELETE AFFILIATE - Erreur:', error);
    throw error;
  }
}

function generateTrackingCode(name: string): string {
  const sanitized = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 6);
  return `${sanitized.substring(0, 6)}_${timestamp}_${random}`;
}