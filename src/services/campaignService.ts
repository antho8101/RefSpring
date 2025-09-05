
// Re-export all campaign service functionality from Supabase
export { type CampaignSummary } from './campaign/types';
export { 
  createCampaignInSupabase as createCampaignInFirestore, 
  updateCampaignInSupabase as updateCampaignInFirestore, 
  finalizeCampaignInSupabase as finalizeCampaignInFirestore,
  deleteCampaignFromSupabase as deleteCampaignFromFirestore
} from './campaign/campaignOperationsSupabase';

// Legacy compatibility - redirect to Supabase versions
export const campaignService = {
  getCampaigns: async (userId: string) => {
    const { supabase } = await import('@/integrations/supabase/client');
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }
};
