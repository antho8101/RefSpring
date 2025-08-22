import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as cors from "cors";
import { shopifyAppConfig } from "./shopifyApp";

// Configuration CORS
const corsHandler = cors({
  origin: true,
  credentials: true,
});

// Types pour les requêtes OAuth
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
export const shopifyAuthUrl = functions.https.onRequest(async (request, response) => {
  return corsHandler(request, response, async () => {
    if (request.method !== "POST") {
      response.status(405).json({ error: "Method not allowed" });
      return;
    }

    try {
      const { shop, campaignId, state }: ShopifyOAuthRequest = request.body;

      if (!shop || !campaignId || !state) {
        response.status(400).json({ error: "Missing required fields" });
        return;
      }

      // Validation du nom de shop Shopify
      const shopName = shop.replace(".myshopify.com", "");
      if (!/^[a-zA-Z0-9-]+$/.test(shopName)) {
        response.status(400).json({ error: "Invalid shop name" });
        return;
      }

      const config = await shopifyAppConfig("system");
      const scopes = "read_orders,read_products,write_script_tags";
      const redirectUri = `${config.appUrl}/auth/shopify/callback`;

      const authUrl = `https://${shopName}.myshopify.com/admin/oauth/authorize?` +
        `client_id=${config.apiKey}&` +
        `scope=${scopes}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `state=${state}&` +
        `response_type=code`;

      console.log("Shopify auth URL generated:", { shop: shopName, campaignId });

      response.json({ success: true, authUrl });
    } catch (error) {
      console.error("Shopify auth URL error:", error);
      response.status(500).json({ error: "Internal server error" });
    }
  });
});

// Échanger le code OAuth contre un access token
export const shopifyTokenExchange = functions.https.onRequest(async (request, response) => {
  return corsHandler(request, response, async () => {
    if (request.method !== "POST") {
      response.status(405).json({ error: "Method not allowed" });
      return;
    }

    try {
      const { shop, code, state, campaignId }: ShopifyTokenExchange = request.body;

      if (!shop || !code || !state || !campaignId) {
        response.status(400).json({ error: "Missing required fields" });
        return;
      }

      const config = await shopifyAppConfig("system");
      const shopName = shop.replace(".myshopify.com", "");
      
      // Échanger le code contre un access token
      const tokenResponse = await fetch(`https://${shopName}.myshopify.com/admin/oauth/access_token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: config.apiKey,
          client_secret: config.apiSecret,
          code
        })
      });

      if (!tokenResponse.ok) {
        throw new Error(`Token exchange failed: ${tokenResponse.status}`);
      }

      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;

      if (!accessToken) {
        throw new Error("No access token received");
      }

      // Stocker la configuration Shopify dans Firestore
      const db = admin.firestore();
      const shopifyData = {
        shop: shopName,
        accessToken,
        campaignId,
        state,
        installedAt: admin.firestore.FieldValue.serverTimestamp(),
        scopes: "read_orders,read_products,write_script_tags"
      };

      await db.collection("shopify_installations").doc(campaignId).set(shopifyData);

      // Installer le script de tracking sur le shop
      await installTrackingScript(shopName, accessToken, campaignId);

      console.log("Shopify app installed successfully:", { shop: shopName, campaignId });

      response.json({ 
        success: true, 
        message: "App installed successfully",
        shopName
      });

    } catch (error) {
      console.error("Shopify token exchange error:", error);
      response.status(500).json({ error: "Internal server error" });
    }
  });
});

// Installer le script de tracking sur le shop Shopify
async function installTrackingScript(shop: string, accessToken: string, campaignId: string) {
  try {
    const scriptTag = {
      script_tag: {
        event: "onload",
        src: `https://your-domain.com/tracking.js?campaign=${campaignId}`,
        display_scope: "all"
      }
    };

    const response = await fetch(`https://${shop}.myshopify.com/admin/api/2023-10/script_tags.json`, {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(scriptTag)
    });

    if (!response.ok) {
      throw new Error(`Script installation failed: ${response.status}`);
    }

    const result = await response.json();
    console.log("Tracking script installed:", result.script_tag.id);

    // Sauvegarder l'ID du script pour pouvoir le supprimer plus tard
    const db = admin.firestore();
    await db.collection("shopify_installations").doc(campaignId).update({
      scriptTagId: result.script_tag.id
    });

  } catch (error) {
    console.error("Error installing tracking script:", error);
    throw error;
  }
}

// Supprimer l'installation Shopify
export const shopifyUninstall = functions.https.onRequest(async (request, response) => {
  return corsHandler(request, response, async () => {
    if (request.method !== "POST") {
      response.status(405).json({ error: "Method not allowed" });
      return;
    }

    try {
      const { campaignId } = request.body;

      if (!campaignId) {
        response.status(400).json({ error: "Campaign ID required" });
        return;
      }

      const db = admin.firestore();
      const installDoc = await db.collection("shopify_installations").doc(campaignId).get();

      if (!installDoc.exists) {
        response.status(404).json({ error: "Installation not found" });
        return;
      }

      const installData = installDoc.data()!;
      
      // Supprimer le script de tracking
      if (installData.scriptTagId && installData.accessToken && installData.shop) {
        await removeTrackingScript(installData.shop, installData.accessToken, installData.scriptTagId);
      }

      // Supprimer la configuration de Firestore
      await installDoc.ref.delete();

      console.log("Shopify app uninstalled:", { campaignId, shop: installData.shop });

      response.json({ success: true, message: "App uninstalled successfully" });

    } catch (error) {
      console.error("Shopify uninstall error:", error);
      response.status(500).json({ error: "Internal server error" });
    }
  });
});

// Supprimer le script de tracking
async function removeTrackingScript(shop: string, accessToken: string, scriptTagId: string) {
  try {
    const response = await fetch(`https://${shop}.myshopify.com/admin/api/2023-10/script_tags/${scriptTagId}.json`, {
      method: "DELETE",
      headers: {
        "X-Shopify-Access-Token": accessToken,
      }
    });

    if (!response.ok) {
      console.error(`Failed to remove script tag: ${response.status}`);
    } else {
      console.log("Tracking script removed successfully");
    }

  } catch (error) {
    console.error("Error removing tracking script:", error);
  }
}