import * as functions from 'firebase-functions';

// Configuration de l'app Shopify
export interface ShopifyAppConfig {
  apiKey: string;
  apiSecret: string;
  scopes: string[];
  appUrl: string;
  webhookSecret: string;
}

// Récupérer la configuration de l'app Shopify
export function shopifyAppConfig(): ShopifyAppConfig {
  // En production, ces valeurs doivent être dans les secrets Firebase
  // Pour le développement, on peut utiliser des variables d'environnement
  const config = functions.config();
  
  return {
    apiKey: config.shopify?.api_key || process.env.SHOPIFY_API_KEY || '',
    apiSecret: config.shopify?.api_secret || process.env.SHOPIFY_API_SECRET || '',
    scopes: ['read_orders', 'read_products', 'write_script_tags', 'read_customers'],
    appUrl: config.app?.url || process.env.APP_URL || 'https://refspring.com',
    webhookSecret: config.shopify?.webhook_secret || process.env.SHOPIFY_WEBHOOK_SECRET || ''
  };
}

// Valider la configuration de l'app
export function validateShopifyConfig(): boolean {
  const config = shopifyAppConfig();
  
  if (!config.apiKey || !config.apiSecret) {
    console.error('Shopify API credentials not configured');
    return false;
  }
  
  return true;
}

// Générer un state sécurisé pour OAuth
export function generateOAuthState(campaignId: string, userId: string): string {
  const timestamp = Date.now().toString();
  const data = `${campaignId}:${userId}:${timestamp}`;
  return Buffer.from(data).toString('base64');
}

// Valider et décoder le state OAuth
export function validateOAuthState(state: string): { campaignId: string; userId: string; timestamp: number } | null {
  try {
    const decoded = Buffer.from(state, 'base64').toString();
    const parts = decoded.split(':');
    
    if (parts.length !== 3) {
      return null;
    }
    
    const [campaignId, userId, timestampStr] = parts;
    const timestamp = parseInt(timestampStr);
    
    // Vérifier que le state n'est pas trop ancien (30 minutes max)
    const maxAge = 30 * 60 * 1000; // 30 minutes
    if (Date.now() - timestamp > maxAge) {
      console.error('OAuth state expired');
      return null;
    }
    
    return { campaignId, userId, timestamp };
  } catch (error) {
    console.error('Invalid OAuth state:', error);
    return null;
  }
}

// Types pour les objets Shopify
export interface ShopifyOrder {
  id: number;
  total_price: string;
  currency: string;
  customer: {
    id: number;
    email: string;
  };
  line_items: Array<{
    id: number;
    title: string;
    quantity: number;
    price: string;
  }>;
  created_at: string;
}

export interface ShopifyWebhookData {
  shop_domain: string;
  order?: ShopifyOrder;
  [key: string]: any;
}