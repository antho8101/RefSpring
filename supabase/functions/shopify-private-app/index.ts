import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { shopDomain, accessToken, campaignId, userId } = await req.json()

    console.log('Tentative de connexion à Shopify:', { shopDomain, campaignId, userId })

    // Valider le token en appelant l'API Shopify
    const shopifyResponse = await fetch(`https://${shopDomain}/admin/api/2023-10/shop.json`, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json'
      }
    });

    if (!shopifyResponse.ok) {
      console.error('Token Shopify invalide:', shopifyResponse.status)
      return new Response(
        JSON.stringify({ 
          error: 'Token invalide ou boutique inaccessible',
          status: shopifyResponse.status 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const shopInfo = await shopifyResponse.json()
    console.log('Informations boutique récupérées:', shopInfo.shop.name)

    // Sauvegarder l'intégration dans la base de données
    const { data, error } = await supabase
      .from('shopify_integrations')
      .upsert({
        user_id: userId,
        campaign_id: campaignId,
        shop_domain: shopDomain,
        access_token: accessToken,
        active: true,
        shop_info: {
          name: shopInfo.shop.name,
          email: shopInfo.shop.email,
          plan_name: shopInfo.shop.plan_name,
          currency: shopInfo.shop.currency
        },
        settings: {
          scriptsInstalled: false,
          webhooksInstalled: false,
          autoInject: true
        }
      }, {
        onConflict: 'user_id,campaign_id,shop_domain'
      })
      .select()
      .single()

    if (error) {
      console.error('Erreur sauvegarde intégration:', error)
      return new Response(
        JSON.stringify({ error: 'Erreur lors de la sauvegarde' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Intégration Shopify sauvegardée:', data.id)

    return new Response(
      JSON.stringify({ 
        success: true,
        integration: data,
        shopInfo: shopInfo.shop
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Erreur edge function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})