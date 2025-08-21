import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as crypto from 'crypto';
import { shopifyAppConfig, ShopifyWebhookData, ShopifyOrder } from './shopifyApp';

// Vérifier la signature webhook Shopify
function verifyShopifyWebhook(body: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(body, 'utf8');
  const computedHash = hmac.digest('base64');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'base64'),
    Buffer.from(computedHash, 'base64')
  );
}

// Webhook pour les commandes Shopify
export const shopifyOrderWebhook = functions.https.onRequest(async (request, response) => {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const config = shopifyAppConfig();
    const signature = request.headers['x-shopify-hmac-sha256'] as string;
    const body = JSON.stringify(request.body);

    // Vérifier la signature webhook
    if (!verifyShopifyWebhook(body, signature, config.webhookSecret)) {
      console.error('Invalid webhook signature');
      return response.status(401).json({ error: 'Unauthorized' });
    }

    const webhookData: ShopifyWebhookData = request.body;
    const order: ShopifyOrder = webhookData;

    console.log('Shopify order webhook received:', {
      orderId: order.id,
      shop: webhookData.shop_domain,
      total: order.total_price
    });

    // Traiter la conversion
    await processShopifyConversion(order, webhookData.shop_domain);

    response.json({ success: true });

  } catch (error) {
    console.error('Shopify webhook error:', error);
    response.status(500).json({ error: 'Internal server error' });
  }
});

// Traiter une conversion Shopify
async function processShopifyConversion(order: ShopifyOrder, shopDomain: string) {
  try {
    // Trouver la configuration du plugin pour ce shop
    const configQuery = await admin.firestore()
      .collection('plugin_configs')
      .where('domain', '==', shopDomain)
      .where('pluginType', '==', 'shopify')
      .where('active', '==', true)
      .get();

    if (configQuery.empty) {
      console.log('No active Shopify config found for shop:', shopDomain);
      return;
    }

    const config = configQuery.docs[0].data();
    const campaignId = config.campaignId;

    // Vérifier s'il y a un tracking affiliate pour cette commande
    // On peut utiliser les cookies ou des paramètres UTM pour identifier l'affilié
    const affiliateId = await findAffiliateForOrder(order, campaignId);

    if (!affiliateId) {
      console.log('No affiliate tracking found for order:', order.id);
      return;
    }

    // Calculer la commission
    const totalAmount = parseFloat(order.total_price);
    const campaign = await admin.firestore()
      .collection('campaigns')
      .doc(campaignId)
      .get();

    if (!campaign.exists) {
      console.error('Campaign not found:', campaignId);
      return;
    }

    const campaignData = campaign.data()!;
    const commissionRate = campaignData.commissionRate || 0;
    const commissionAmount = (totalAmount * commissionRate) / 100;

    // Enregistrer la conversion
    const conversion = {
      campaignId,
      affiliateId,
      orderId: order.id.toString(),
      orderTotal: totalAmount,
      commissionAmount,
      currency: order.currency,
      platform: 'shopify',
      shopDomain,
      customerEmail: order.customer?.email || '',
      createdAt: new Date(),
      status: 'pending',
      orderData: {
        lineItems: order.line_items,
        customerId: order.customer?.id
      }
    };

    await admin.firestore()
      .collection('conversions')
      .add(conversion);

    // Mettre à jour les statistiques de l'affilié
    await updateAffiliateStats(affiliateId, campaignId, commissionAmount);

    console.log('Shopify conversion processed:', {
      orderId: order.id,
      affiliateId,
      commissionAmount,
      campaignId
    });

  } catch (error) {
    console.error('Error processing Shopify conversion:', error);
  }
}

// Trouver l'affilié associé à une commande
async function findAffiliateForOrder(order: ShopifyOrder, campaignId: string): Promise<string | null> {
  try {
    // Ici on peut implémenter différentes stratégies :
    // 1. Vérifier les notes de commande pour des codes affiliate
    // 2. Utiliser l'email du client pour trouver des liens de tracking récents
    // 3. Vérifier les attributs personnalisés de la commande
    
    // Pour l'instant, on utilise une approche simple basée sur l'email
    if (!order.customer?.email) {
      return null;
    }

    // Chercher des clics récents pour cet email/campagne (dans les dernières 30 jours)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentClicks = await admin.firestore()
      .collection('tracking_clicks')
      .where('campaignId', '==', campaignId)
      .where('customerEmail', '==', order.customer.email)
      .where('timestamp', '>=', thirtyDaysAgo)
      .orderBy('timestamp', 'desc')
      .limit(1)
      .get();

    if (!recentClicks.empty) {
      return recentClicks.docs[0].data().affiliateId;
    }

    return null;
  } catch (error) {
    console.error('Error finding affiliate for order:', error);
    return null;
  }
}

// Mettre à jour les statistiques de l'affilié
async function updateAffiliateStats(affiliateId: string, campaignId: string, commissionAmount: number) {
  try {
    const affiliateRef = admin.firestore()
      .collection('affiliates')
      .doc(affiliateId);

    await admin.firestore().runTransaction(async (transaction) => {
      const affiliateDoc = await transaction.get(affiliateRef);
      
      if (affiliateDoc.exists) {
        const currentStats = affiliateDoc.data()!.stats || {};
        const campaignStats = currentStats[campaignId] || {
          clicks: 0,
          conversions: 0,
          totalCommissions: 0
        };

        transaction.update(affiliateRef, {
          [`stats.${campaignId}.conversions`]: campaignStats.conversions + 1,
          [`stats.${campaignId}.totalCommissions`]: campaignStats.totalCommissions + commissionAmount,
          lastConversion: new Date()
        });
      }
    });

  } catch (error) {
    console.error('Error updating affiliate stats:', error);
  }
}

// Webhook pour l'installation/désinstallation de l'app
export const shopifyAppWebhook = functions.https.onRequest(async (request, response) => {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const config = shopifyAppConfig();
    const signature = request.headers['x-shopify-hmac-sha256'] as string;
    const body = JSON.stringify(request.body);
    const topic = request.headers['x-shopify-topic'] as string;

    // Vérifier la signature
    if (!verifyShopifyWebhook(body, signature, config.webhookSecret)) {
      return response.status(401).json({ error: 'Unauthorized' });
    }

    const webhookData: ShopifyWebhookData = request.body;

    switch (topic) {
      case 'app/uninstalled':
        await handleAppUninstall(webhookData.shop_domain);
        break;
      default:
        console.log('Unhandled webhook topic:', topic);
    }

    response.json({ success: true });

  } catch (error) {
    console.error('Shopify app webhook error:', error);
    response.status(500).json({ error: 'Internal server error' });
  }
});

// Gérer la désinstallation de l'app
async function handleAppUninstall(shopDomain: string) {
  try {
    // Désactiver toutes les configurations pour ce shop
    const configs = await admin.firestore()
      .collection('plugin_configs')
      .where('domain', '==', shopDomain)
      .where('pluginType', '==', 'shopify')
      .get();

    const batch = admin.firestore().batch();
    configs.forEach(doc => {
      batch.update(doc.ref, {
        active: false,
        uninstalledAt: new Date()
      });
    });

    await batch.commit();
    console.log('App uninstalled for shop:', shopDomain);

  } catch (error) {
    console.error('Error handling app uninstall:', error);
  }
}