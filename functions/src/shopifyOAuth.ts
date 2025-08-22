import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as cors from 'cors';
import { shopifyAppConfig } from './shopifyApp';

const corsHandler = cors({ origin: true });

interface ShopifyOAuthRequest {
  shop: string;
  campaignId: string;
  state: string;
}

interface ShopifyTokenExchange {
  shop: string;
  code: string;
  state: string;
  campaignId: string;
}

// Générer l'URL d'autorisation Shopify
export const shopifyAuthUrl = functions.https.onRequest((request, response) => {  
  return corsHandler(request, response, async () => {
    if (request.method !== 'POST') {
      return response.status(405).json({ error: 'Method not allowed' });
    }

    try {
      const { shop, campaignId, state }: ShopifyOAuthRequest = request.body;

      if (!shop || !campaignId || !state) {
        return response.status(400).json({ error: 'Missing required fields' });
      }

      // Validation du nom de shop Shopify
      const shopName = shop.replace('.myshopify.com', '');
      if (!/^[a-zA-Z0-9-]+$/.test(shopName)) {
        return response.status(400).json({ error: 'Invalid shop name' });
      }

      const config = await shopifyAppConfig('system');
      const scopes = 'read_orders,read_products,write_script_tags';
      const redirectUri = `${config.appUrl}/auth/shopify/callback`;

      const authUrl = `https://${shopName}.myshopify.com/admin/oauth/authorize?` +
        `client_id=${config.apiKey}&` +
        `scope=${scopes}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `state=${state}&` +
        `response_type=code`;

      response.json({
        success: true,
        authUrl,
        redirectUri
      });

    } catch (error) {
      console.error('Shopify auth URL error:', error);
      response.status(500).json({ error: 'Internal server error' });
    }
  });
});

// Échanger le code OAuth contre un access token
export const shopifyTokenExchange = functions.https.onRequest((request, response) => {
  return corsHandler(request, response, async () => {
    if (request.method !== 'POST') {
      return response.status(405).json({ error: 'Method not allowed' });
    }

    try {
      const { shop, code, state, campaignId }: ShopifyTokenExchange = request.body;

      if (!shop || !code || !state || !campaignId) {
        return response.status(400).json({ error: 'Missing required fields' });
      }

      const config = await shopifyAppConfig('system');
      const shopName = shop.replace('.myshopify.com', '');
      
      // Échanger le code contre un access token
      const tokenResponse = await fetch(`https://${shopName}.myshopify.com/admin/oauth/access_token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: config.apiKey,
          client_secret: config.apiSecret,
          code
        })
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to exchange code for token');
      }

      const tokenData = await tokenResponse.json();
      const { access_token } = tokenData;

      // Vérifier la validité du token en faisant un appel test
      const shopInfoResponse = await fetch(`https://${shopName}.myshopify.com/admin/api/2023-10/shop.json`, {
        headers: {
          'X-Shopify-Access-Token': access_token
        }
      });

      if (!shopInfoResponse.ok) {
        throw new Error('Invalid access token');
      }

      const shopInfo = await shopInfoResponse.json();

      // Stocker la configuration Shopify dans Firestore
      const shopifyDoc = await admin.firestore()
        .collection('plugin_configs')
        .add({
          pluginType: 'shopify',
          domain: shop,
          campaignId,
          accessToken: access_token,
          shopInfo: shopInfo.shop,
          createdAt: new Date(),
          updatedAt: new Date(),
          active: true,
          settings: {
            autoInject: true,
            trackingEnabled: true,
            scriptsInstalled: false
          }
        });

      // Installer automatiquement le script de tracking
      await installTrackingScript(shopName, access_token, campaignId);

      response.json({
        success: true,
        pluginId: shopifyDoc.id,
        shopInfo: shopInfo.shop,
        message: 'Shopify app connected successfully'
      });

    } catch (error) {
      console.error('Shopify token exchange error:', error);
      response.status(500).json({ 
        error: 'Failed to connect Shopify app',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
});

// Installer le script de tracking via l'API ScriptTag
async function installTrackingScript(shop: string, accessToken: string, campaignId: string) {
  try {
    const scriptTag = {
      script_tag: {
        event: 'onload',
        src: `https://refspring.com/tracking.js?campaign=${campaignId}`,
        display_scope: 'online_store'
      }
    };

    const response = await fetch(`https://${shop}.myshopify.com/admin/api/2023-10/script_tags.json`, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(scriptTag)
    });

    if (!response.ok) {
      console.error('Failed to install tracking script:', await response.text());
      return false;
    }

    const result = await response.json();
    console.log('Tracking script installed:', result.script_tag.id);

    // Mettre à jour le statut dans Firestore
    const configs = await admin.firestore()
      .collection('plugin_configs')
      .where('domain', '==', `${shop}.myshopify.com`)
      .where('campaignId', '==', campaignId)
      .get();

    if (!configs.empty) {
      await configs.docs[0].ref.update({
        'settings.scriptsInstalled': true,
        'settings.scriptTagId': result.script_tag.id,
        updatedAt: new Date()
      });
    }

    return true;
  } catch (error) {
    console.error('Error installing tracking script:', error);
    return false;
  }
}