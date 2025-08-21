import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as cors from 'cors';

const corsHandler = cors({ origin: true });

// Interface pour la configuration des plugins
interface PluginConfig {
  pluginType: 'wordpress' | 'shopify';
  domain: string;
  apiKey?: string;
  campaignId: string;
  userId: string;
  settings: {
    autoInject?: boolean;
    trackingEnabled?: boolean;
    commissionRate?: number;
  };
}

// Interface pour l'installation Shopify
interface ShopifyInstall {
  shop: string;
  code: string;
  state: string;
  campaignId: string;
}

// API pour la configuration WordPress
export const wordpressConfig = functions.https.onRequest((request, response) => {
  corsHandler(request, response, async () => {
    if (request.method !== 'POST') {
      return response.status(405).json({ error: 'Method not allowed' });
    }

    try {
      const config: PluginConfig = request.body;
      
      // Validation
      if (!config.domain || !config.campaignId || !config.userId) {
        return response.status(400).json({ error: 'Missing required fields' });
      }

      // Vérifier que la campagne existe et appartient à l'utilisateur
      const campaignDoc = await admin.firestore()
        .collection('campaigns')
        .doc(config.campaignId)
        .get();

      if (!campaignDoc.exists || campaignDoc.data()?.userId !== config.userId) {
        return response.status(403).json({ error: 'Campaign not found or access denied' });
      }

      // Stocker la configuration du plugin
      const pluginDoc = await admin.firestore()
        .collection('plugin_configs')
        .add({
          ...config,
          pluginType: 'wordpress',
          createdAt: new Date(),
          updatedAt: new Date(),
          active: true
        });

      // Générer le script de tracking personnalisé
      const trackingScript = generateWordPressTrackingScript(config.campaignId, config.domain);

      response.json({
        success: true,
        pluginId: pluginDoc.id,
        trackingScript,
        message: 'WordPress plugin configured successfully'
      });

    } catch (error) {
      console.error('WordPress config error:', error);
      response.status(500).json({ error: 'Internal server error' });
    }
  });
});

// API pour l'installation Shopify
export const shopifyInstall = functions.https.onRequest((request, response) => {
  corsHandler(request, response, async () => {
    if (request.method !== 'POST') {
      return response.status(405).json({ error: 'Method not allowed' });
    }

    try {
      const installData: ShopifyInstall = request.body;
      
      // Validation
      if (!installData.shop || !installData.code || !installData.campaignId) {
        return response.status(400).json({ error: 'Missing required fields' });
      }

      // Échanger le code OAuth contre un access token (simulation)
      // En réalité, on ferait un appel à l'API Shopify
      const accessToken = 'simulated_access_token_' + Date.now();

      // Stocker la configuration Shopify
      const shopifyDoc = await admin.firestore()
        .collection('plugin_configs')
        .add({
          pluginType: 'shopify',
          domain: installData.shop,
          campaignId: installData.campaignId,
          accessToken,
          createdAt: new Date(),
          updatedAt: new Date(),
          active: true,
          settings: {
            autoInject: true,
            trackingEnabled: true
          }
        });

      response.json({
        success: true,
        pluginId: shopifyDoc.id,
        message: 'Shopify app installed successfully'
      });

    } catch (error) {
      console.error('Shopify install error:', error);
      response.status(500).json({ error: 'Internal server error' });
    }
  });
});

// API pour générer les clés API des plugins
export const generatePluginApiKey = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { campaignId } = data;
  
  if (!campaignId) {
    throw new functions.https.HttpsError('invalid-argument', 'Campaign ID is required');
  }

  // Vérifier que la campagne appartient à l'utilisateur
  const campaignDoc = await admin.firestore()
    .collection('campaigns')
    .doc(campaignId)
    .get();

  if (!campaignDoc.exists || campaignDoc.data()?.userId !== context.auth.uid) {
    throw new functions.https.HttpsError('permission-denied', 'Campaign not found or access denied');
  }

  // Générer une clé API unique
  const apiKey = 'rsp_' + Buffer.from(campaignId + '_' + Date.now()).toString('base64');

  // Stocker la clé API
  await admin.firestore()
    .collection('plugin_api_keys')
    .doc(apiKey)
    .set({
      campaignId,
      userId: context.auth.uid,
      createdAt: new Date(),
      lastUsed: null,
      active: true
    });

  return { apiKey };
});

// Fonction utilitaire pour générer le script WordPress
function generateWordPressTrackingScript(campaignId: string, domain: string): string {
  return `<?php
// RefSpring Tracking Script for WordPress
function refspring_add_tracking_script() {
    $campaign_id = '${campaignId}';
    $script_url = 'https://refspring.com/tracking.js';
    
    echo '<script data-campaign="' . $campaign_id . '" src="' . $script_url . '"></script>';
}
add_action('wp_head', 'refspring_add_tracking_script');

// Hook pour WooCommerce conversions
function refspring_woocommerce_conversion($order_id) {
    $order = wc_get_order($order_id);
    $total = $order->get_total();
    
    echo '<script>
        if (window.RefSpring) {
            window.RefSpring.trackConversion(' . $total . ');
        }
    </script>';
}
add_action('woocommerce_thankyou', 'refspring_woocommerce_conversion');
?>`;
}