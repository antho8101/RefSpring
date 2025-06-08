
import * as admin from 'firebase-admin';
import { validateCampaignData } from './validateCampaignData';
import { processStripeWebhook } from './processStripeWebhook';
import { validateTracking } from './validateTracking';
import { calculateCommissions } from './calculateCommissions';
import { antifraudCheck } from './antifraudCheck';

// Initialize Firebase Admin
admin.initializeApp();

// Export all functions
export { 
  validateCampaignData,
  processStripeWebhook,
  validateTracking,
  calculateCommissions,
  antifraudCheck
};
