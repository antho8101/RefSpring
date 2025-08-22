
import * as admin from "firebase-admin";
import { validateCampaignData } from "./validateCampaignData";
import { processStripeWebhook } from "./processStripeWebhook";
import { validateTracking } from "./validateTracking";
import { calculateCommissions } from "./calculateCommissions";
import { antifraudCheck } from "./antifraudCheck";
import { wordpressConfig, shopifyInstall, generatePluginApiKey } from "./pluginAPI";
import { shopifyAuthUrl, shopifyTokenExchange } from "./shopifyOAuth";
import { shopifyOrderWebhook, shopifyAppWebhook } from "./shopifyWebhooks";
import { setupShopifyWebhooks, checkShopifyInstallation } from "./shopifySetup";
import { stripeGetPaymentMethods } from "./stripeGetPaymentMethods";
import { stripeDeletePaymentMethod } from "./stripeDeletePaymentMethod";
import { stripeSetDefaultPaymentMethod } from "./stripeSetDefaultPaymentMethod";
import { stripeCreateSetup } from "./stripeCreateSetup";
import { stripeCheckSetup } from "./stripeCheckSetup";
import { stripeCreateConnectAccount, stripeCreateAccountLink, stripeCreateTransfer } from "./stripeConnectAccount";
import { stripeCreateInvoice } from "./stripeInvoice";

// Initialize Firebase Admin
admin.initializeApp();

// Export all functions
export { 
  validateCampaignData,
  processStripeWebhook,
  validateTracking,
  calculateCommissions,
  antifraudCheck,
  wordpressConfig,
  shopifyInstall,
  generatePluginApiKey,
  shopifyAuthUrl,
  shopifyTokenExchange,
  shopifyOrderWebhook,
  shopifyAppWebhook,
  setupShopifyWebhooks,
  checkShopifyInstallation,
  stripeGetPaymentMethods,
  stripeDeletePaymentMethod,
  stripeSetDefaultPaymentMethod,
  stripeCreateSetup,
  stripeCheckSetup,
  stripeCreateConnectAccount,
  stripeCreateAccountLink,
  stripeCreateTransfer,
  stripeCreateInvoice
};
