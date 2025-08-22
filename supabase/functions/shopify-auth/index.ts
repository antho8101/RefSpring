import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { shop, campaignId, userId } = await req.json();
    
    if (!shop || !campaignId || !userId) {
      throw new Error('Paramètres manquants: shop, campaignId, userId requis');
    }

    const shopifyApiKey = Deno.env.get('SHOPIFY_API_KEY');
    if (!shopifyApiKey) {
      throw new Error('Clé API Shopify non configurée');
    }

    // Nettoyer le nom de boutique
    const shopDomain = shop.includes('.myshopify.com') ? shop : `${shop}.myshopify.com`;
    
    // Générer un token d'état sécurisé
    const stateToken = crypto.randomUUID();
    
    // Stocker l'état OAuth en base
    const { error: stateError } = await supabase
      .from('shopify_oauth_states')
      .insert({
        state_token: stateToken,
        user_id: userId,
        campaign_id: campaignId,
        shop_domain: shopDomain
      });

    if (stateError) {
      console.error('Erreur sauvegarde état OAuth:', stateError);
      throw new Error('Impossible de créer l\'état OAuth');
    }

    // Construire l'URL d'autorisation Shopify
    const scopes = [
      'read_orders',
      'write_orders',
      'read_customers', 
      'write_customers',
      'read_products',
      'write_script_tags',
      'write_themes'
    ].join(',');

    const redirectUri = `${req.headers.get('origin')}/shopify/callback`;
    
    const authUrl = new URL(`https://${shopDomain}/admin/oauth/authorize`);
    authUrl.searchParams.set('client_id', shopifyApiKey);
    authUrl.searchParams.set('scope', scopes);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('state', stateToken);

    console.log('URL d\'autorisation générée:', authUrl.toString());

    return new Response(
      JSON.stringify({ 
        authUrl: authUrl.toString(),
        state: stateToken,
        shopDomain 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Erreur génération URL OAuth:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erreur interne du serveur' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});