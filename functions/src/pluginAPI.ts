import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as cors from "cors";

// Configuration CORS
const corsHandler = cors({
  origin: true,
  credentials: true,
});

// Types pour les requêtes
interface WordPressConfigRequest {
  campaignId: string;
  domain: string;
}

interface ShopifyInstallRequest {
  campaignId: string;
  shopDomain: string;
}

// API pour la configuration WordPress
export const wordpressConfig = functions.https.onRequest((request, response) => {
  return corsHandler(request, response, async () => {
    if (request.method !== "POST") {
      response.status(405).json({ error: "Method not allowed" });
      return;
    }

    try {
      const { campaignId, domain }: WordPressConfigRequest = request.body;

      if (!campaignId || !domain) {
        response.status(400).json({ error: "Missing required fields" });
        return;
      }

      // Valider le domaine
      const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;
      if (!domainRegex.test(domain)) {
        response.status(400).json({ error: "Invalid domain format" });
        return;
      }

      // Générer le script de tracking WordPress
      const trackingScript = generateWordPressTrackingScript(campaignId, domain);

      // Sauvegarder la configuration
      const db = admin.firestore();
      const configData = {
        campaignId,
        domain,
        platform: "wordpress",
        trackingScript,
        installedAt: admin.firestore.FieldValue.serverTimestamp(),
        status: "active"
      };

      await db.collection("plugin_configurations").doc(campaignId).set(configData);

      console.log("WordPress config generated:", { campaignId, domain });

      response.json({
        success: true,
        trackingScript,
        instructions: [
          "1. Copiez le code PHP ci-dessous",
          "2. Ajoutez-le dans le fichier functions.php de votre thème WordPress",
          "3. Ou utilisez un plugin comme 'Code Snippets' pour l'ajouter",
          "4. Le tracking sera automatiquement activé sur toutes les pages"
        ]
      });

    } catch (error) {
      console.error("WordPress config error:", error);
      response.status(500).json({ error: "Internal server error" });
    }
  });
});

// API pour l'installation Shopify (redirige vers le processus OAuth)
export const shopifyInstall = functions.https.onRequest((request, response) => {
  return corsHandler(request, response, async () => {
    if (request.method !== "POST") {
      response.status(405).json({ error: "Method not allowed" });
      return;
    }

    try {
      const { campaignId, shopDomain }: ShopifyInstallRequest = request.body;

      if (!campaignId || !shopDomain) {
        response.status(400).json({ error: "Missing required fields" });
        return;
      }

      // Valider le domaine Shopify
      const shopName = shopDomain.replace(".myshopify.com", "");
      if (!/^[a-zA-Z0-9-]+$/.test(shopName)) {
        response.status(400).json({ error: "Invalid Shopify domain" });
        return;
      }

      // Générer un state unique pour la sécurité OAuth
      const state = admin.firestore().collection("temp").doc().id;

      // Sauvegarder temporairement les données de la requête
      const db = admin.firestore();
      await db.collection("shopify_oauth_states").doc(state).set({
        campaignId,
        shopDomain,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
      });

      // Retourner les informations pour rediriger vers OAuth
      response.json({
        success: true,
        redirectData: {
          shop: shopName,
          campaignId,
          state
        },
        instructions: [
          "Utilisez ces données pour initier le processus OAuth Shopify",
          "Appelez l'endpoint shopifyAuthUrl avec ces paramètres"
        ]
      });

    } catch (error) {
      console.error("Shopify install error:", error);
      response.status(500).json({ error: "Internal server error" });
    }
  });
});

// API pour obtenir le statut d'une installation
export const getInstallationStatus = functions.https.onRequest((request, response) => {
  return corsHandler(request, response, async () => {
    if (request.method !== "GET") {
      response.status(405).json({ error: "Method not allowed" });
      return;
    }

    try {
      const campaignId = request.query.campaignId as string;

      if (!campaignId) {
        response.status(400).json({ error: "Campaign ID required" });
        return;
      }

      const db = admin.firestore();

      // Vérifier les installations WordPress
      const wordpressDoc = await db.collection("plugin_configurations").doc(campaignId).get();
      
      // Vérifier les installations Shopify
      const shopifyDoc = await db.collection("shopify_installations").doc(campaignId).get();

      const installations = {
        wordpress: wordpressDoc.exists ? wordpressDoc.data() : null,
        shopify: shopifyDoc.exists ? shopifyDoc.data() : null
      };

      response.json({
        success: true,
        installations,
        hasActiveInstallations: wordpressDoc.exists || shopifyDoc.exists
      });

    } catch (error) {
      console.error("Get installation status error:", error);
      response.status(500).json({ error: "Internal server error" });
    }
  });
});

// Fonction utilitaire pour générer le script WordPress
function generateWordPressTrackingScript(campaignId: string, _domain: string): string {
  return `<?php
// RefSpring Tracking Script for WordPress
function refspring_add_tracking_script() {
    $campaign_id = '${campaignId}';
    ?>
    <script>
    (function() {
        // RefSpring Tracking Code
        window.refspring = window.refspring || {};
        window.refspring.campaignId = '<?php echo esc_js($campaign_id); ?>';
        
        // Track page views
        function trackPageView() {
            const data = {
                campaignId: window.refspring.campaignId,
                page: window.location.pathname,
                referrer: document.referrer,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent
            };
            
            // Send tracking data
            fetch('https://your-functions-url/trackPageView', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            }).catch(console.error);
        }
        
        // Track conversions
        function trackConversion(value, currency = 'USD') {
            const data = {
                campaignId: window.refspring.campaignId,
                value: value,
                currency: currency,
                page: window.location.pathname,
                timestamp: new Date().toISOString()
            };
            
            fetch('https://your-functions-url/trackConversion', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            }).catch(console.error);
        }
        
        // Initialize tracking
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', trackPageView);
        } else {
            trackPageView();
        }
        
        // Make trackConversion available globally
        window.refspring.trackConversion = trackConversion;
    })();
    </script>
    <?php
}
add_action('wp_footer', 'refspring_add_tracking_script');

// Hook into WooCommerce order completion (if WooCommerce is active)
if (class_exists('WooCommerce')) {
    function refspring_track_woocommerce_conversion($order_id) {
        $order = wc_get_order($order_id);
        $total = $order->get_total();
        $currency = $order->get_currency();
        ?>
        <script>
        if (window.refspring && window.refspring.trackConversion) {
            window.refspring.trackConversion(<?php echo esc_js($total); ?>, '<?php echo esc_js($currency); ?>');
        }
        </script>
        <?php
    }
    add_action('woocommerce_thankyou', 'refspring_track_woocommerce_conversion');
}
?>`;
}