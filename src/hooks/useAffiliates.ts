import { useAffiliatesSupabase } from '@/hooks/useAffiliatesSupabase';

export const useAffiliates = (campaignId?: string) => {
  // Use the new Supabase-based hook
  return useAffiliatesSupabase(campaignId);
};
