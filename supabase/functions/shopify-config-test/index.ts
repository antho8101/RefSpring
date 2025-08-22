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
    const shopifyApiKey = Deno.env.get('SHOPIFY_API_KEY');
    const shopifyApiSecret = Deno.env.get('SHOPIFY_API_SECRET');

    console.log('Test configuration Shopify:');
    console.log('- API Key configurée:', !!shopifyApiKey);
    console.log('- API Secret configurée:', !!shopifyApiSecret);

    if (shopifyApiKey) {
      console.log('- API Key (tronquée):', shopifyApiKey.substring(0, 8) + '...');
    }

    return new Response(
      JSON.stringify({ 
        apiKeyConfigured: !!shopifyApiKey,
        apiSecretConfigured: !!shopifyApiSecret,
        allConfigured: !!(shopifyApiKey && shopifyApiSecret),
        apiKeyPreview: shopifyApiKey ? shopifyApiKey.substring(0, 8) + '...' : null
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Erreur test configuration:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        apiKeyConfigured: false,
        apiSecretConfigured: false,
        allConfigured: false
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});