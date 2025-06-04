
import { useCallback } from 'react';
import { Campaign } from '@/types';
import { 
  createCampaignInFirestore,
  updateCampaignInFirestore,
  finalizeCampaignInFirestore,
  deleteCampaignFromFirestore
} from '@/services/campaignService';

export const useCampaignOperations = (userId: string | null) => {
  const createCampaign = useCallback(async (
    campaignData: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt' | 'userId'>
  ) => {
    if (!userId) throw new Error('User not authenticated');
    return createCampaignInFirestore(campaignData, userId);
  }, [userId]);

  const updateCampaign = useCallback(async (id: string, updates: Partial<Campaign>) => {
    return updateCampaignInFirestore(id, updates);
  }, []);

  const finalizeCampaign = useCallback(async (
    id: string, 
    stripeData: { customerId: string; setupIntentId: string }
  ) => {
    return finalizeCampaignInFirestore(id, stripeData);
  }, []);

  const deleteCampaign = useCallback(async (id: string) => {
    if (!userId) throw new Error('User not authenticated');
    return deleteCampaignFromFirestore(id, userId);
  }, [userId]);

  return {
    createCampaign,
    updateCampaign,
    finalizeCampaign,
    deleteCampaign,
  };
};
