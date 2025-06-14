
// Re-export all campaign service functionality from the modular files
export { type CampaignSummary } from './campaign/types';
export { getCampaigns } from './campaign/campaignQueries';
export { 
  createCampaignInFirestore, 
  updateCampaignInFirestore, 
  finalizeCampaignInFirestore 
} from './campaign/campaignOperations';
export { 
  deleteCampaignCascade, 
  deleteCampaignFromFirestore 
} from './campaign/campaignDeletion';

// Create a unified service object for backward compatibility
export const campaignService = {
  getCampaigns: (userId: string) => import('./campaign/campaignQueries').then(m => m.getCampaigns(userId))
};
