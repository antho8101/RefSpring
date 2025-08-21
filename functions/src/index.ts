
import * as admin from 'firebase-admin';
import { validateCampaignData } from './validateCampaignData';
import { processStripeWebhook } from './processStripeWebhook';
import { validateTracking } from './validateTracking';
import { calculateCommissions } from './calculateCommissions';
import { antifraudCheck } from './antifraudCheck';
import { wordpressConfig, shopifyInstall, generatePluginApiKey } from './pluginAPI';
import { stripeGetPaymentMethods } from './stripeGetPaymentMethods';
import { stripeDeletePaymentMethod } from './stripeDeletePaymentMethod';
import { stripeSetDefaultPaymentMethod } from './stripeSetDefaultPaymentMethod';

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
  stripeGetPaymentMethods,
  stripeDeletePaymentMethod,
  stripeSetDefaultPaymentMethod
};
