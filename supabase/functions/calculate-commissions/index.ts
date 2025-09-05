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
    console.log('💰 CALCULATE COMMISSIONS - Début calcul commissions');

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

    console.log('👤 CALCULATE COMMISSIONS - Utilisateur:', user.id);

    if (req.method === "POST") {
      return await handleCalculateCommissions(supabaseClient, req, user.id);
    } else if (req.method === "GET") {
      return await handleGetCommissionReport(supabaseClient, req, user.id);
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error('❌ CALCULATE COMMISSIONS - Erreur:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Internal server error"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function handleCalculateCommissions(supabase: any, req: Request, userId: string) {
  console.log('🧮 CALCULATE COMMISSIONS - Calcul pour utilisateur:', userId);

  try {
    const body = await req.json();
    const { campaignId, period, affiliateId } = body;

    // Build date filter
    let dateFilter = new Date();
    switch (period) {
      case 'week':
        dateFilter.setDate(dateFilter.getDate() - 7);
        break;
      case 'month':
        dateFilter.setMonth(dateFilter.getMonth() - 1);
        break;
      case 'quarter':
        dateFilter.setMonth(dateFilter.getMonth() - 3);
        break;
      case 'year':
        dateFilter.setFullYear(dateFilter.getFullYear() - 1);
        break;
      default:
        dateFilter.setDate(dateFilter.getDate() - 30); // Default to 30 days
    }

    console.log('📅 CALCULATE COMMISSIONS - Période:', period, 'depuis:', dateFilter);

    // Get conversions with filters
    let query = supabase
      .from('conversions')
      .select(`
        id,
        amount,
        commission,
        status,
        verified,
        created_at,
        affiliate_id,
        campaign_id,
        affiliates!inner(id, name, email, commission_rate),
        campaigns!inner(id, name, user_id)
      `)
      .eq('campaigns.user_id', userId)
      .gte('created_at', dateFilter.toISOString())
      .eq('verified', true)
      .eq('status', 'approved');

    if (campaignId) {
      query = query.eq('campaign_id', campaignId);
    }
    
    if (affiliateId) {
      query = query.eq('affiliate_id', affiliateId);
    }

    const { data: conversions, error } = await query;

    if (error) {
      console.error('❌ CALCULATE COMMISSIONS - Erreur requête conversions:', error);
      throw error;
    }

    console.log('📊 CALCULATE COMMISSIONS - Conversions trouvées:', conversions?.length || 0);

    // Calculate commission summary by affiliate
    const commissionSummary = new Map();
    let totalRevenue = 0;
    let totalCommissions = 0;

    conversions?.forEach(conversion => {
      const affiliateId = conversion.affiliate_id;
      totalRevenue += conversion.amount;
      totalCommissions += conversion.commission;

      if (!commissionSummary.has(affiliateId)) {
        commissionSummary.set(affiliateId, {
          affiliateId,
          affiliateName: conversion.affiliates.name,
          affiliateEmail: conversion.affiliates.email,
          conversions: 0,
          totalRevenue: 0,
          totalCommissions: 0,
          conversionDetails: [],
        });
      }

      const summary = commissionSummary.get(affiliateId);
      summary.conversions += 1;
      summary.totalRevenue += conversion.amount;
      summary.totalCommissions += conversion.commission;
      summary.conversionDetails.push({
        id: conversion.id,
        amount: conversion.amount,
        commission: conversion.commission,
        createdAt: conversion.created_at,
      });
    });

    // Convert Map to array
    const affiliateCommissions = Array.from(commissionSummary.values());

    // Calculate platform fees (assuming 5% platform fee)
    const platformFeeRate = 0.05;
    const platformFees = totalCommissions * platformFeeRate;
    const netCommissions = totalCommissions - platformFees;

    console.log('💰 CALCULATE COMMISSIONS - Résumé:', {
      totalRevenue,
      totalCommissions,
      platformFees,
      netCommissions,
      affiliatesCount: affiliateCommissions.length
    });

    return new Response(JSON.stringify({
      period,
      dateFilter: dateFilter.toISOString(),
      summary: {
        totalRevenue,
        totalCommissions,
        platformFees,
        netCommissions,
        affiliatesCount: affiliateCommissions.length,
        conversionsCount: conversions?.length || 0,
      },
      affiliateCommissions,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error('❌ CALCULATE COMMISSIONS - Erreur calcul:', error);
    throw error;
  }
}

async function handleGetCommissionReport(supabase: any, req: Request, userId: string) {
  console.log('📋 GET COMMISSION REPORT - Génération rapport pour:', userId);

  try {
    const url = new URL(req.url);
    const format = url.searchParams.get("format") || "json";
    const campaignId = url.searchParams.get("campaignId");
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");

    console.log('📅 GET COMMISSION REPORT - Paramètres:', { format, campaignId, startDate, endDate });

    // Build query for detailed commission report
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
        affiliate_id,
        campaign_id,
        affiliates!inner(id, name, email, commission_rate),
        campaigns!inner(id, name, user_id)
      `)
      .eq('campaigns.user_id', userId)
      .order('created_at', { ascending: false });

    if (campaignId) {
      query = query.eq('campaign_id', campaignId);
    }

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data: conversions, error } = await query;

    if (error) {
      console.error('❌ GET COMMISSION REPORT - Erreur requête:', error);
      throw error;
    }

    // Group by status
    const statusSummary = {
      pending: { count: 0, revenue: 0, commissions: 0 },
      approved: { count: 0, revenue: 0, commissions: 0 },
      rejected: { count: 0, revenue: 0, commissions: 0 },
    };

    conversions?.forEach(conversion => {
      const status = conversion.status;
      if (statusSummary[status]) {
        statusSummary[status].count += 1;
        statusSummary[status].revenue += conversion.amount;
        statusSummary[status].commissions += conversion.commission;
      }
    });

    const report = {
      generatedAt: new Date().toISOString(),
      filters: { campaignId, startDate, endDate },
      summary: {
        totalConversions: conversions?.length || 0,
        totalRevenue: conversions?.reduce((sum, c) => sum + c.amount, 0) || 0,
        totalCommissions: conversions?.reduce((sum, c) => sum + c.commission, 0) || 0,
        statusBreakdown: statusSummary,
      },
      conversions: conversions || [],
    };

    console.log('✅ GET COMMISSION REPORT - Rapport généré:', report.summary);

    return new Response(JSON.stringify(report), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error('❌ GET COMMISSION REPORT - Erreur:', error);
    throw error;
  }
}