
import { useAuth } from '@/hooks/useAuth';
import { useCampaignsSupabase } from '@/hooks/useCampaignsSupabase';
import { useAuthGuard } from '@/hooks/useAuthGuard';

export const useCampaigns = () => {
  const { user, loading: authLoading } = useAuth();
  const { requireAuthentication } = useAuthGuard();
  
  // Use the new Supabase-based hook
  const {
    campaigns,
    loading,
    createCampaign,
    updateCampaign,
    finalizeCampaign,
    deleteCampaign,
    refreshCampaigns
  } = useCampaignsSupabase();

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
      return createCampaign(campaignData);
    },
    updateCampaign: async (id: string, updates: any) => {
      if (authLoading) {
        throw new Error('Authentification en cours, veuillez patienter...');
      }
      if (!requireAuthentication('modifier une campagne')) {
        return;
      }
      return updateCampaign(id, updates);
    },
    finalizeCampaign: async (id: string, stripeData: any) => {
      if (authLoading) {
        throw new Error('Authentification en cours, veuillez patienter...');
      }
      if (!requireAuthentication('finaliser une campagne')) {
        return;
      }
      return finalizeCampaign(id, stripeData);
    },
    deleteCampaign: async (id: string) => {
      if (authLoading) {
        throw new Error('Authentification en cours, veuillez patienter...');
      }
      if (!requireAuthentication('supprimer une campagne')) {
        return;
      }
      return deleteCampaign(id);
    },
  };

  return {
    campaigns,
    loading,
    refreshCampaigns,
    ...secureOperations,
  };
};
