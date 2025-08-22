import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-shopify-topic, x-shopify-hmac-sha256, x-shopify-shop-domain',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const topic = req.headers.get('x-shopify-topic');
    const shopDomain = req.headers.get('x-shopify-shop-domain');
    const hmac = req.headers.get('x-shopify-hmac-sha256');
    
    if (!topic || !shopDomain) {
      throw new Error('Headers Shopify manquants');
    }

    const body = await req.text();
    let webhookData;
    
    try {
      webhookData = JSON.parse(body);
    } catch {
      webhookData = body;
    }

    console.log(`Webhook reçu: ${topic} de ${shopDomain}`);

    // Vérifier l'intégration existe
    const { data: integration, error: integrationError } = await supabase
      .from('shopify_integrations')
      .select('*')
      .eq('shop_domain', shopDomain)
      .eq('active', true)
      .single();

    if (integrationError || !integration) {
      console.error('Intégration non trouvée:', shopDomain);
      throw new Error('Intégration Shopify non trouvée');
    }

    // Traiter selon le type de webhook  
    switch (topic) {
      case 'orders/create':
      case 'orders/updated':
      case 'orders/paid':
        await handleOrderWebhook(webhookData, integration, topic);
        break;
        
      case 'app/uninstalled':
        await handleUninstallWebhook(integration);
        break;
        
      default:
        console.log(`Webhook non traité: ${topic}`);
    }

    return new Response(
      JSON.stringify({ success: true, processed: topic }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erreur traitement webhook:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function handleOrderWebhook(orderData: any, integration: any, topic: string) {
  try {
    console.log(`Traitement commande ${orderData.id} pour ${integration.shop_domain}`);
    
    // Extraire les données importantes de la commande
    const orderInfo = {
      order_id: orderData.id?.toString(),
      order_number: orderData.order_number,
      total_price: parseFloat(orderData.total_price || '0'),
      currency: orderData.currency,
      customer_email: orderData.email,
      customer_id: orderData.customer?.id?.toString(),
      created_at: orderData.created_at,
      financial_status: orderData.financial_status,
      fulfillment_status: orderData.fulfillment_status,
      source_name: orderData.source_name,
      line_items: orderData.line_items?.map((item: any) => ({
        product_id: item.product_id,
        variant_id: item.variant_id,
        title: item.title,
        quantity: item.quantity,
        price: item.price
      })) || []
    };

    // TODO: Ici on pourrait traiter l'affiliation si des paramètres de tracking sont présents
    // Par exemple, chercher des custom attributes ou des landing_site_ref pour identifier l'affilié
    
    console.log(`Commande ${orderInfo.order_id} traitée avec succès`);
    
  } catch (error) {
    console.error('Erreur traitement commande:', error);
    throw error;
  }
}

async function handleUninstallWebhook(integration: any) {
  try {
    // Désactiver l'intégration
    const { error } = await supabase
      .from('shopify_integrations')
      .update({ active: false })
      .eq('id', integration.id);

    if (error) {
      console.error('Erreur désactivation intégration:', error);
      throw error;
    }

    console.log(`Intégration ${integration.shop_domain} désactivée suite à désinstallation`);
    
  } catch (error) {
    console.error('Erreur traitement désinstallation:', error);
    throw error;
  }
}