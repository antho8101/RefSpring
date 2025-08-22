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
    const { code, state, shop } = await req.json();
    
    if (!code || !state || !shop) {
      throw new Error('Paramètres OAuth manquants');
    }

    // Vérifier l'état OAuth
    const { data: oauthState, error: stateError } = await supabase
      .from('shopify_oauth_states')
      .select('*')
      .eq('state_token', state)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (stateError || !oauthState) {
      console.error('État OAuth invalide:', stateError);
      throw new Error('État OAuth invalide ou expiré');
    }

    const shopifyApiKey = Deno.env.get('SHOPIFY_API_KEY');
    const shopifyApiSecret = Deno.env.get('SHOPIFY_API_SECRET');
    
    if (!shopifyApiKey || !shopifyApiSecret) {
      throw new Error('Credentials Shopify non configurées');
    }

    // Échanger le code contre un access token
    const tokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: shopifyApiKey,
        client_secret: shopifyApiSecret,
        code: code
      })
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Erreur échange token:', errorData);
      throw new Error('Échec de l\'échange de token');
    }

    const tokenData = await tokenResponse.json();
    const { access_token, scope } = tokenData;

    if (!access_token) {
      throw new Error('Access token non reçu');
    }

    // Récupérer les informations de la boutique
    const shopResponse = await fetch(`https://${shop}/admin/api/2023-10/shop.json`, {
      headers: {
        'X-Shopify-Access-Token': access_token,
        'Content-Type': 'application/json'
      }
    });

    if (!shopResponse.ok) {
      console.error('Erreur récupération infos boutique');
      throw new Error('Impossible de récupérer les informations de la boutique');
    }

    const shopData = await shopResponse.json();
    const shopInfo = shopData.shop;

    // Sauvegarder l'intégration
    const { data: integration, error: integrationError } = await supabase
      .from('shopify_integrations')
      .upsert({
        user_id: oauthState.user_id,
        campaign_id: oauthState.campaign_id,
        shop_domain: shop,
        access_token: access_token,
        shop_info: {
          name: shopInfo.name,
          email: shopInfo.email,
          domain: shopInfo.domain,
          currency: shopInfo.currency,
          plan_name: shopInfo.plan_name,
          primary_location_id: shopInfo.primary_location_id
        },
        settings: {
          scriptsInstalled: false,
          webhooksInstalled: false,
          autoInject: true,
          scopes: scope?.split(',') || []
        }
      }, {
        onConflict: 'shop_domain,campaign_id'
      })
      .select()
      .single();

    if (integrationError) {
      console.error('Erreur sauvegarde intégration:', integrationError);
      throw new Error('Impossible de sauvegarder l\'intégration');
    }

    // Nettoyer l'état OAuth utilisé
    await supabase
      .from('shopify_oauth_states')
      .delete()
      .eq('state_token', state);

    console.log('Intégration Shopify créée avec succès:', integration.id);

    return new Response(
      JSON.stringify({
        success: true,
        integration: {
          id: integration.id,
          shopDomain: shop,
          shopInfo: integration.shop_info,
          active: integration.active
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Erreur callback Shopify:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erreur callback OAuth' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});