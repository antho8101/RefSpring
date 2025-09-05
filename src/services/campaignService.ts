
// Re-export all campaign service functionality from Supabase
export { type CampaignSummary } from './campaign/types';
import { type CampaignSummary } from './campaign/types';
export { 
  createCampaignInSupabase as createCampaignInFirestore, 
  updateCampaignInSupabase as updateCampaignInFirestore, 
  finalizeCampaignInSupabase as finalizeCampaignInFirestore,
  deleteCampaignFromSupabase as deleteCampaignFromFirestore
} from './campaign/campaignOperationsSupabase';

// Legacy compatibility - redirect to Supabase versions
export const campaignService = {
  getCampaigns: async (userId: string): Promise<CampaignSummary[]> => {
    const { supabase } = await import('@/integrations/supabase/client');
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Mapper les champs Supabase vers le format CampaignSummary
    return (data || []).map(campaign => ({
      id: campaign.id,
      name: campaign.name,
      isActive: campaign.is_active, // Mapping is_active -> isActive
      paymentMethodId: campaign.stripe_payment_method_id // Mapping stripe_payment_method_id -> paymentMethodId
    }));
  }
};
