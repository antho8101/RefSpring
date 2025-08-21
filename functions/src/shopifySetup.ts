import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Fonction pour configurer les webhooks Shopify lors de l'installation
export const setupShopifyWebhooks = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { shopDomain, accessToken, campaignId } = data;

  if (!shopDomain || !accessToken || !campaignId) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required parameters');
  }

  try {
    // Vérifier que la campagne appartient à l'utilisateur
    const campaignDoc = await admin.firestore()
      .collection('campaigns')
      .doc(campaignId)
      .get();

    if (!campaignDoc.exists || campaignDoc.data()?.userId !== context.auth.uid) {
      throw new functions.https.HttpsError('permission-denied', 'Campaign not found or access denied');
    }

    const shopName = shopDomain.replace('.myshopify.com', '');
    const webhookBaseUrl = 'https://refspring.com/api/shopify-webhooks';

    // Liste des webhooks à installer
    const webhooks = [
      {
        topic: 'orders/create',
        address: webhookBaseUrl,
        format: 'json'
      },
      {
        topic: 'orders/paid',
        address: webhookBaseUrl,
        format: 'json'
      },
      {
        topic: 'app/uninstalled',
        address: webhookBaseUrl,
        format: 'json'
      }
    ];

    const installedWebhooks = [];

    // Installer chaque webhook
    for (const webhook of webhooks) {
      try {
        const response = await fetch(`https://${shopName}.myshopify.com/admin/api/2023-10/webhooks.json`, {
          method: 'POST',
          headers: {
            'X-Shopify-Access-Token': accessToken,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ webhook })
        });

        if (response.ok) {
          const result = await response.json();
          installedWebhooks.push({
            topic: webhook.topic,
            id: result.webhook.id,
            address: result.webhook.address
          });
        } else {
          console.error(`Failed to install webhook ${webhook.topic}:`, await response.text());
        }
      } catch (error) {
        console.error(`Error installing webhook ${webhook.topic}:`, error);
      }
    }

    // Mettre à jour la configuration du plugin avec les webhooks installés
    const configQuery = await admin.firestore()
      .collection('plugin_configs')
      .where('domain', '==', shopDomain)
      .where('campaignId', '==', campaignId)
      .where('pluginType', '==', 'shopify')
      .get();

    if (!configQuery.empty) {
      await configQuery.docs[0].ref.update({
        'settings.webhooksInstalled': true,
        'settings.installedWebhooks': installedWebhooks,
        updatedAt: new Date()
      });
    }

    return {
      success: true,
      webhooksInstalled: installedWebhooks.length,
      details: installedWebhooks
    };

  } catch (error) {
    console.error('Setup webhooks error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to setup webhooks');
  }
});

// Fonction pour vérifier l'état de l'installation Shopify
export const checkShopifyInstallation = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { campaignId } = data;

  if (!campaignId) {
    throw new functions.https.HttpsError('invalid-argument', 'Campaign ID is required');
  }

  try {
    // Récupérer toutes les configurations Shopify pour cette campagne
    const configsQuery = await admin.firestore()
      .collection('plugin_configs')
      .where('campaignId', '==', campaignId)
      .where('pluginType', '==', 'shopify')
      .where('active', '==', true)
      .get();

    const installations = [];

    for (const doc of configsQuery.docs) {
      const config = doc.data();
      installations.push({
        id: doc.id,
        shopDomain: config.domain,
        installedAt: config.createdAt,
        settings: config.settings,
        shopInfo: config.shopInfo
      });
    }

    return {
      success: true,
      installationCount: installations.length,
      installations
    };

  } catch (error) {
    console.error('Check installation error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to check installation status');
  }
});