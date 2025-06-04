
import { useAuth } from '@/hooks/useAuth';
import { useCampaignData } from '@/hooks/useCampaignData';
import { useCampaignOperations } from '@/hooks/useCampaignOperations';

export const useCampaigns = () => {
  const { user, loading: authLoading } = useAuth();
  const { campaigns, loading } = useCampaignData(user?.uid || null, authLoading);
  const operations = useCampaignOperations(user?.uid || null);

  return {
    campaigns,
    loading,
    ...operations,
  };
};
