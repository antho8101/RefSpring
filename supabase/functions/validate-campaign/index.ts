import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CampaignData {
  name: string;
  description: string;
  target_url: string;
  is_active: boolean;
  default_commission_rate: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    console.log('🔍 VALIDATION - Début validation campagne');

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
      return new Response(JSON.stringify({ error: "User not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const campaignData = await req.json() as CampaignData;
    console.log('🔍 VALIDATION - Données reçues:', { userId: user.id, campaignData });

    // Validation des données
    const errors: string[] = [];

    if (!campaignData.name || campaignData.name.trim().length < 3) {
      errors.push('Le nom de la campagne doit contenir au moins 3 caractères');
    }

    if (!campaignData.target_url || !isValidUrl(campaignData.target_url)) {
      errors.push('URL de destination invalide');
    }

    if (campaignData.default_commission_rate < 0 || campaignData.default_commission_rate > 100) {
      errors.push('Le taux de commission doit être entre 0 et 100%');
    }

    // Vérifier les domaines suspects
    if (campaignData.target_url && isSuspiciousDomain(campaignData.target_url)) {
      errors.push('Domaine non autorisé');
    }

    // Vérifier le nombre de campagnes existantes
    const { data: userCampaigns, error: campaignsError } = await supabaseClient
      .from('campaigns')
      .select('id')
      .eq('user_id', user.id);

    if (campaignsError) {
      console.error('❌ VALIDATION - Erreur requête campagnes:', campaignsError);
      throw new Error('Erreur lors de la vérification des campagnes existantes');
    }

    if (userCampaigns && userCampaigns.length >= 50) {
      errors.push('Limite de campagnes atteinte (50 max)');
    }

    if (errors.length > 0) {
      console.log('❌ VALIDATION - Erreurs trouvées:', errors);
      return new Response(JSON.stringify({ 
        valid: false, 
        errors: errors 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log('✅ VALIDATION - Campagne validée avec succès');
    
    return new Response(JSON.stringify({
      valid: true,
      sanitizedData: {
        name: campaignData.name.trim(),
        description: campaignData.description?.trim() || '',
        target_url: campaignData.target_url.trim(),
        is_active: Boolean(campaignData.is_active),
        default_commission_rate: Math.round(campaignData.default_commission_rate * 100) / 100,
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error('❌ VALIDATION - Erreur:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Validation error"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function isValidUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch {
    return false;
  }
}

function isSuspiciousDomain(url: string): boolean {
  try {
    const domain = new URL(url).hostname.toLowerCase();
    const blockedDomains = [
      'bit.ly',
      't.co', 
      'tinyurl.com',
      'goo.gl',
      'suspicious-site.com'
    ];
    
    return blockedDomains.some(blocked => domain.includes(blocked));
  } catch {
    return true;
  }
}