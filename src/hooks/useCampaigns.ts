
import { useAuth } from '@/hooks/useAuth';
import { useCampaignData } from '@/hooks/useCampaignData';
import { useCampaignOperations } from '@/hooks/useCampaignOperations';
import { useAuthGuard } from '@/hooks/useAuthGuard';

export const useCampaigns = () => {
  const { user, loading: authLoading } = useAuth();
  const { requireAuthentication } = useAuthGuard();
  
  // Vérification de sécurité avant toute opération
  const secureUserId = (() => {
    if (!authLoading && !user?.uid) {
      console.log('🔐 SECURITY - useCampaigns called without authentication');
      return null;
    }
    return user?.uid || null;
  })();

  const { campaigns, loading } = useCampaignData(secureUserId, authLoading);
  const operations = useCampaignOperations(secureUserId);

  // Wrapper sécurisé pour les opérations
  const secureOperations = {
    createCampaign: async (campaignData: any) => {
      requireAuthentication('créer une campagne');
      return operations.createCampaign(campaignData);
    },
    updateCampaign: async (id: string, updates: any) => {
      requireAuthentication('modifier une campagne');
      return operations.updateCampaign(id, updates);
    },
    finalizeCampaign: async (id: string, stripeData: any) => {
      requireAuthentication('finaliser une campagne');
      return operations.finalizeCampaign(id, stripeData);
    },
    deleteCampaign: async (id: string) => {
      requireAuthentication('supprimer une campagne');
      return operations.deleteCampaign(id);
    },
  };

  return {
    campaigns,
    loading,
    ...secureOperations,
  };
};
