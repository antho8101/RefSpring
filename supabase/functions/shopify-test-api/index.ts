import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { shopDomain, accessToken } = await req.json();

    if (!shopDomain || !accessToken) {
      throw new Error('shopDomain et accessToken requis');
    }

    console.log(`Test API pour ${shopDomain}`);

    // Test simple : récupérer les infos de la boutique
    const response = await fetch(`https://${shopDomain}/admin/api/2024-01/shop.json`, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      }
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error(`Erreur API Shopify (${response.status}):`, responseData);
      
      let errorMessage = 'Accès API refusé';
      if (response.status === 401) {
        errorMessage = 'Token d\'accès invalide ou expiré';
      } else if (response.status === 403) {
        errorMessage = 'Permissions insuffisantes';
      } else if (response.status === 404) {
        errorMessage = 'Boutique non trouvée';
      }

      return new Response(
        JSON.stringify({ 
          success: false,
          error: errorMessage,
          details: responseData,
          status: response.status
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`API test réussi pour ${shopDomain}:`, responseData.shop?.name);

    return new Response(
      JSON.stringify({ 
        success: true,
        shopInfo: {
          name: responseData.shop?.name,
          domain: responseData.shop?.domain,
          email: responseData.shop?.email,
          plan: responseData.shop?.plan_name,
          currency: responseData.shop?.currency
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Erreur test API:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});