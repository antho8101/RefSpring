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
    console.log('🎯 TRACK CONVERSION - Début traitement');

    // Initialize Supabase service client (no auth required for tracking)
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    if (req.method === "POST") {
      return await handleTrackConversion(supabaseService, req);
    } else if (req.method === "GET") {
      return await handleGetConversions(supabaseService, req);
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error('❌ TRACK CONVERSION - Erreur:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Internal server error"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function handleTrackConversion(supabase: any, req: Request) {
  console.log('📊 TRACK CONVERSION - Enregistrement nouvelle conversion');

  try {
    const body = await req.json();
    const { campaignId, affiliateId, amount, orderId, customerEmail } = body;

    // Validation des données requises
    if (!campaignId || !affiliateId || !amount) {
      return new Response(JSON.stringify({ 
        error: "Missing required fields: campaignId, affiliateId, amount" 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log('🎯 TRACK CONVERSION - Données:', { campaignId, affiliateId, amount, orderId });

    // Vérifier que la campagne et l'affilié existent
    const { data: affiliate, error: affiliateError } = await supabase
      .from('affiliates')
      .select(`
        id,
        name,
        commission_rate,
        campaign_id,
        user_id,
        campaigns!inner(id, name, is_active)
      `)
      .eq('id', affiliateId)
      .eq('campaign_id', campaignId)
      .eq('is_active', true)
      .single();

    if (affiliateError || !affiliate) {
      console.error('❌ TRACK CONVERSION - Affilié non trouvé:', affiliateError);
      return new Response(JSON.stringify({ error: "Affiliate or campaign not found or inactive" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Vérifier que la campagne est active
    if (!affiliate.campaigns.is_active) {
      return new Response(JSON.stringify({ error: "Campaign is not active" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Calculer la commission
    const commissionAmount = (parseFloat(amount) * affiliate.commission_rate) / 100;

    console.log('💰 TRACK CONVERSION - Commission calculée:', {
      amount,
      rate: affiliate.commission_rate,
      commission: commissionAmount
    });

    // Enregistrer la conversion
    const { data: conversion, error: conversionError } = await supabase
      .from('conversions')
      .insert({
        campaign_id: campaignId,
        affiliate_id: affiliateId,
        amount: parseFloat(amount),
        commission: commissionAmount,
        verified: false,
        status: 'pending',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (conversionError) {
      console.error('❌ TRACK CONVERSION - Erreur insertion conversion:', conversionError);
      throw conversionError;
    }

    console.log('✅ TRACK CONVERSION - Conversion enregistrée:', conversion.id);

    // Enregistrer un log d'audit
    await supabase
      .from('conversion_audit_logs')
      .insert({
        conversion_id: conversion.id,
        action: 'created',
        performed_by: 'system',
        new_value: {
          amount: conversion.amount,
          commission: conversion.commission,
          status: conversion.status
        },
        metadata: {
          order_id: orderId,
          customer_email: customerEmail,
          user_agent: req.headers.get('user-agent'),
          ip: req.headers.get('x-forwarded-for') || 'unknown'
        },
        created_at: new Date().toISOString(),
      });

    // Ajouter à la queue de vérification si le montant est élevé
    if (parseFloat(amount) > 1000) {
      await supabase
        .from('conversion_verification_queue')
        .insert({
          conversion_id: conversion.id,
          campaign_id: campaignId,
          affiliate_id: affiliateId,
          priority: parseFloat(amount) > 5000 ? 'high' : 'medium',
          metadata: {
            amount: conversion.amount,
            commission: conversion.commission,
            requires_manual_review: true
          },
          created_at: new Date().toISOString(),
        });

      console.log('🔍 TRACK CONVERSION - Ajouté à la queue de vérification');
    }

    return new Response(JSON.stringify({ 
      success: true,
      conversion: {
        id: conversion.id,
        amount: conversion.amount,
        commission: conversion.commission,
        status: conversion.status
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 201,
    });

  } catch (error) {
    console.error('❌ TRACK CONVERSION - Erreur:', error);
    throw error;
  }
}

async function handleGetConversions(supabase: any, req: Request) {
  console.log('📋 GET CONVERSIONS - Récupération conversions');

  try {
    // Parse query parameters
    const url = new URL(req.url);
    const campaignId = url.searchParams.get("campaignId");
    const affiliateId = url.searchParams.get("affiliateId");
    const status = url.searchParams.get("status");
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const offset = parseInt(url.searchParams.get("offset") || "0");

    // Build query
    let query = supabase
      .from('conversions')
      .select(`
        id,
        amount,
        commission,
        status,
        verified,
        created_at,
        updated_at,
        campaigns!inner(id, name),
        affiliates!inner(id, name, email)
      `);

    // Apply filters
    if (campaignId) {
      query = query.eq('campaign_id', campaignId);
    }
    if (affiliateId) {
      query = query.eq('affiliate_id', affiliateId);
    }
    if (status) {
      query = query.eq('status', status);
    }

    // Apply pagination and ordering
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: conversions, error, count } = await query;

    if (error) {
      console.error('❌ GET CONVERSIONS - Erreur requête:', error);
      throw error;
    }

    console.log('✅ GET CONVERSIONS - Conversions trouvées:', conversions?.length || 0);

    return new Response(JSON.stringify({ 
      conversions: conversions || [],
      total: count,
      limit,
      offset
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error('❌ GET CONVERSIONS - Erreur:', error);
    throw error;
  }
}