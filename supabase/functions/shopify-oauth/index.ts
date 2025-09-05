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
    console.log('🛍️ SHOPIFY OAUTH - Début traitement');

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

    console.log('👤 SHOPIFY OAUTH - Utilisateur:', user.id);

    if (req.method === "POST") {
      return await handleCreateAuthUrl(req, user.id);
    } else if (req.method === "PUT") {
      return await handleTokenExchange(req, user.id);
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error('❌ SHOPIFY OAUTH - Erreur:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Internal server error"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function handleCreateAuthUrl(req: Request, userId: string) {
  console.log('🔗 SHOPIFY OAUTH - Génération URL d\'autorisation');

  try {
    const body = await req.json();
    const { shop, campaignId } = body;

    if (!shop || !campaignId) {
      return new Response(JSON.stringify({ error: "Shop and campaignId are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("SHOPIFY_API_KEY");
    if (!apiKey) {
      throw new Error("SHOPIFY_API_KEY not configured");
    }

    // Normalize shop domain
    const shopDomain = shop.includes('.') ? shop : `${shop}.myshopify.com`;

    // Generate state token for security
    const stateToken = crypto.randomUUID();

    // Store OAuth state in Supabase
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    await supabaseService
      .from('shopify_oauth_states')
      .insert({
        state_token: stateToken,
        user_id: userId,
        campaign_id: campaignId,
        shop_domain: shopDomain,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
      });

    // Build Shopify OAuth URL
    const scopes = [
      'read_orders',
      'read_products', 
      'read_customers',
      'write_script_tags',
      'read_themes',
      'write_themes'
    ].join(',');

    const redirectUri = `${req.headers.get("origin")}/shopify/callback`;

    const authUrl = new URL(`https://${shopDomain}/admin/oauth/authorize`);
    authUrl.searchParams.set('client_id', apiKey);
    authUrl.searchParams.set('scope', scopes);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('state', stateToken);
    authUrl.searchParams.set('grant_options[]', 'per-user');

    console.log('✅ SHOPIFY OAUTH - URL générée pour:', shopDomain);

    return new Response(JSON.stringify({ 
      authUrl: authUrl.toString(),
      stateToken,
      shopDomain 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error('❌ SHOPIFY OAUTH - Erreur génération URL:', error);
    throw error;
  }
}

async function handleTokenExchange(req: Request, userId: string) {
  console.log('🔄 SHOPIFY OAUTH - Échange de token');

  try {
    const body = await req.json();
    const { code, state, shop } = body;

    if (!code || !state || !shop) {
      return new Response(JSON.stringify({ error: "Code, state, and shop are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("SHOPIFY_API_KEY");
    const apiSecret = Deno.env.get("SHOPIFY_API_SECRET");

    if (!apiKey || !apiSecret) {
      throw new Error("Shopify API credentials not configured");
    }

    // Initialize Supabase service client
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Verify OAuth state
    const { data: oauthState, error: stateError } = await supabaseService
      .from('shopify_oauth_states')
      .select('*')
      .eq('state_token', state)
      .eq('user_id', userId)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (stateError || !oauthState) {
      console.error('❌ SHOPIFY OAUTH - État OAuth invalide ou expiré');
      return new Response(JSON.stringify({ error: "Invalid or expired OAuth state" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Exchange code for access token
    const tokenUrl = `https://${shop}/admin/oauth/access_token`;
    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: apiKey,
        client_secret: apiSecret,
        code: code,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('❌ SHOPIFY OAUTH - Erreur échange token:', errorText);
      throw new Error(`Token exchange failed: ${errorText}`);
    }

    const tokenData = await tokenResponse.json();
    console.log('✅ SHOPIFY OAUTH - Token obtenu pour:', shop);

    // Get shop info
    const shopInfoResponse = await fetch(`https://${shop}/admin/api/2023-10/shop.json`, {
      headers: {
        'X-Shopify-Access-Token': tokenData.access_token,
      },
    });

    let shopInfo = null;
    if (shopInfoResponse.ok) {
      const shopData = await shopInfoResponse.json();
      shopInfo = shopData.shop;
    }

    // Save Shopify integration
    const { data: integration, error: integrationError } = await supabaseService
      .from('shopify_integrations')
      .insert({
        user_id: userId,
        campaign_id: oauthState.campaign_id,
        shop_domain: shop,
        access_token: tokenData.access_token,
        shop_info: shopInfo,
        active: true,
        settings: {
          autoInject: true,
          scriptsInstalled: false,
          webhooksInstalled: false,
        },
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (integrationError) {
      console.error('❌ SHOPIFY OAUTH - Erreur sauvegarde intégration:', integrationError);
      throw integrationError;
    }

    // Clean up OAuth state
    await supabaseService
      .from('shopify_oauth_states')
      .delete()
      .eq('state_token', state);

    console.log('✅ SHOPIFY OAUTH - Intégration sauvegardée:', integration.id);

    return new Response(JSON.stringify({ 
      success: true,
      integration: {
        id: integration.id,
        shopDomain: integration.shop_domain,
        shopInfo: integration.shop_info,
        settings: integration.settings,
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 201,
    });

  } catch (error) {
    console.error('❌ SHOPIFY OAUTH - Erreur échange token:', error);
    throw error;
  }
}