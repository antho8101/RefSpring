
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
      // CORRECTION CRITIQUE : Vérifier d'abord si l'auth est finie
      if (authLoading) {
        console.log('🔐 SECURITY - Auth still loading, cannot create campaign yet');
        throw new Error('Authentification en cours, veuillez patienter...');
      }
      
      if (!requireAuthentication('créer une campagne')) {
        return;
      }
      return operations.createCampaign(campaignData);
    },
    updateCampaign: async (id: string, updates: any) => {
      if (authLoading) {
        throw new Error('Authentification en cours, veuillez patienter...');
      }
      if (!requireAuthentication('modifier une campagne')) {
        return;
      }
      return operations.updateCampaign(id, updates);
    },
    finalizeCampaign: async (id: string, stripeData: any) => {
      if (authLoading) {
        throw new Error('Authentification en cours, veuillez patienter...');
      }
      if (!requireAuthentication('finaliser une campagne')) {
        return;
      }
      return operations.finalizeCampaign(id, stripeData);
    },
    deleteCampaign: async (id: string) => {
      if (authLoading) {
        throw new Error('Authentification en cours, veuillez patienter...');
      }
      if (!requireAuthentication('supprimer une campagne')) {
        return;
      }
      return operations.deleteCampaign(id);
    },
  };

  return {
    campaigns,
    loading,
    ...secureOperations,
  };
};
