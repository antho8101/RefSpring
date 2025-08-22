import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as crypto from "crypto";
import { shopifyAppConfig } from "./shopifyApp";

// Types pour les webhooks Shopify
interface ShopifyWebhookData {
  shop_domain: string;
  [key: string]: any;
}

interface ShopifyOrder {
  id: number;
  total_price: string;
  currency: string;
  customer: {
    id: number;
    email: string;
  };
  line_items: Array<{
    product_id: number;
    variant_id: number;
    quantity: number;
    price: string;
  }>;
}

// Vérifier la signature du webhook Shopify
function verifyShopifyWebhook(body: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(body);
  const calculatedSignature = hmac.digest("base64");
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(calculatedSignature)
  );
}

// Webhook pour les commandes Shopify
export const shopifyOrderWebhook = functions.https.onRequest(async (request, response) => {
  if (request.method !== "POST") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const config = await shopifyAppConfig("system");
    const signature = request.headers["x-shopify-hmac-sha256"] as string;
    const body = JSON.stringify(request.body);

    // Vérifier la signature webhook
    if (!verifyShopifyWebhook(body, signature, config.webhookSecret)) {
      console.error("Invalid webhook signature");
      response.status(401).json({ error: "Unauthorized" });
      return;
    }

    const webhookData: ShopifyWebhookData = request.body;
    const order = webhookData as any;

    console.log("Shopify order webhook received:", {
      orderId: order.id,
      shop: webhookData.shop_domain,
      totalPrice: order.total_price,
      currency: order.currency
    });

    // Traiter la commande pour les conversions d'affiliation
    await processShopifyOrder(order, webhookData.shop_domain);

    response.status(200).json({ success: true });
  } catch (error) {
    console.error("Shopify webhook error:", error);
    response.status(500).json({ error: "Internal server error" });
  }
});

// Traiter une commande Shopify pour les conversions
async function processShopifyOrder(order: any, shopDomain: string) {
  try {
    const db = admin.firestore();

    // Chercher la campagne associée à ce shop
    const shopifyInstallQuery = await db.collection("shopify_installations")
      .where("shop", "==", shopDomain.replace(".myshopify.com", ""))
      .limit(1)
      .get();

    if (shopifyInstallQuery.empty) {
      console.log("No campaign found for shop:", shopDomain);
      return;
    }

    const campaignId = shopifyInstallQuery.docs[0].data().campaignId;

    // Chercher les clics récents qui pourraient être liés à cette commande
    const recentClicksQuery = await db.collection("clicks")
      .where("campaignId", "==", campaignId)
      .where("timestamp", ">=", new Date(Date.now() - 24 * 60 * 60 * 1000)) // 24h
      .orderBy("timestamp", "desc")
      .limit(100)
      .get();

    // Essayer de faire correspondre la commande avec un clic d'affilié
    let matchedAffiliate = null;

    for (const clickDoc of recentClicksQuery.docs) {
      const clickData = clickDoc.data();
      
      // Logique de correspondance (à améliorer selon vos besoins)
      // Par exemple, correspondance par email ou par IP
      if (order.customer && order.customer.email && clickData.userEmail === order.customer.email) {
        matchedAffiliate = clickData.affiliateId;
        break;
      }
    }

    if (matchedAffiliate) {
      // Créer une conversion
      const conversionData = {
        campaignId,
        affiliateId: matchedAffiliate,
        orderId: order.id.toString(),
        shopDomain,
        amount: parseFloat(order.total_price),
        currency: order.currency,
        customerEmail: order.customer?.email,
        lineItems: order.line_items || [],
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        source: "shopify_webhook",
        status: "pending_validation"
      };

      await db.collection("conversions").add(conversionData);

      // Mettre à jour les statistiques de l'affilié
      await updateAffiliateStats(matchedAffiliate, campaignId, parseFloat(order.total_price));

      console.log("Conversion created:", {
        campaignId,
        affiliateId: matchedAffiliate,
        orderId: order.id,
        amount: order.total_price
      });
    } else {
      console.log("No matching affiliate found for order:", order.id);
    }

  } catch (error) {
    console.error("Error processing Shopify order:", error);
  }
}

// Mettre à jour les statistiques de l'affilié
async function updateAffiliateStats(affiliateId: string, campaignId: string, amount: number) {
  try {
    const db = admin.firestore();
    const statsRef = db.collection("affiliate_stats").doc(`${campaignId}_${affiliateId}`);

    await statsRef.set({
      affiliateId,
      campaignId,
      totalConversions: admin.firestore.FieldValue.increment(1),
      totalRevenue: admin.firestore.FieldValue.increment(amount),
      lastConversion: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

  } catch (error) {
    console.error("Error updating affiliate stats:", error);
  }
}

// Webhook pour l'installation/désinstallation de l'app
export const shopifyAppWebhook = functions.https.onRequest(async (request, response) => {
  if (request.method !== "POST") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const config = await shopifyAppConfig("system");
    const signature = request.headers["x-shopify-hmac-sha256"] as string;
    const body = JSON.stringify(request.body);
    const topic = request.headers["x-shopify-topic"] as string;

    // Vérifier la signature
    if (!verifyShopifyWebhook(body, signature, config.webhookSecret)) {
      response.status(401).json({ error: "Unauthorized" });
      return;
    }

    const webhookData: ShopifyWebhookData = request.body;

    switch (topic) {
    case "app/uninstalled":
      await handleAppUninstall(webhookData.shop_domain);
      break;
    default:
      console.log("Unhandled webhook topic:", topic);
    }

    response.status(200).json({ success: true });
  } catch (error) {
    console.error("Shopify app webhook error:", error);
    response.status(500).json({ error: "Internal server error" });
  }
});

// Gérer la désinstallation de l'app
async function handleAppUninstall(shopDomain: string) {
  try {
    const db = admin.firestore();
    const shopName = shopDomain.replace(".myshopify.com", "");

    // Chercher et supprimer toutes les installations pour ce shop
    const installationsQuery = await db.collection("shopify_installations")
      .where("shop", "==", shopName)
      .get();

    const deletePromises = installationsQuery.docs.map(doc => doc.ref.delete());
    await Promise.all(deletePromises);

    console.log("App uninstalled for shop:", shopName);

  } catch (error) {
    console.error("Error handling app uninstall:", error);
  }
}