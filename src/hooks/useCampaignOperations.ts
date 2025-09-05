
import { useCallback } from 'react';
import { Campaign } from '@/types';
import { 
  createCampaignInSupabase as createCampaignInFirestore,
  updateCampaignInSupabase as updateCampaignInFirestore,
  finalizeCampaignInSupabase as finalizeCampaignInFirestore,
  deleteCampaignFromSupabase as deleteCampaignFromFirestore
} from '@/services/campaign/campaignOperationsSupabase';

export const useCampaignOperations = (userId: string | null) => {
  const createCampaign = useCallback(async (
    campaignData: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt' | 'userId'>
  ) => {
    if (!userId) throw new Error('User not authenticated');
    
    // Adapter les données pour Supabase
    const supabaseData = {
      name: campaignData.name,
      description: campaignData.description,
      target_url: campaignData.targetUrl,
      is_active: campaignData.isActive,
      default_commission_rate: campaignData.defaultCommissionRate || 0.10
    };
    
    return createCampaignInFirestore(supabaseData, userId);
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
