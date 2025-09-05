import { useAuth } from '@/hooks/useAuth';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useStripePayment } from '@/hooks/useStripePayment';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { useToast } from '@/hooks/use-toast';
import { CampaignFormData } from './useCampaignFormState';

export const useCampaignFormSubmission = (
  formData: CampaignFormData,
  setPendingCampaignData: (data: CampaignFormData | null) => void,
  setShowPaymentSelector: (show: boolean) => void,
  setLoading: (loading: boolean) => void
) => {
  const { user } = useAuth();
  const { createCampaign } = useCampaigns();
  const { setupPaymentForCampaign } = useStripePayment();
  const { refreshPaymentMethods, paymentMethods } = usePaymentMethods();
  const { toast } = useToast();

  const redirectToStripeForNewCard = async (campaignData: CampaignFormData) => {
    console.log('🎯 SUPABASE: Redirection vers Stripe SANS créer la campagne');
    
    try {
      // Store campaign data securely
      import('@/utils/secureClientStorage').then(({ secureStorage }) => {
        secureStorage.setCampaignData('pendingCampaignData', campaignData, 2);
        console.log('🔒 Campaign data stored securely');
      });
      
      setPendingCampaignData(campaignData);
      
      // Rediriger vers Stripe avec un ID temporaire
      await setupPaymentForCampaign('temp_new_campaign', campaignData.name);
      console.log('✅ Redirection vers Stripe en cours (campagne PAS ENCORE créée)...');
    } catch (error) {
      console.error('❌ Erreur lors de la redirection vers Stripe:', error);
      import('@/utils/secureClientStorage').then(({ secureStorage }) => {
        secureStorage.removeSecure('campaign_pendingCampaignData');
      });
      setPendingCampaignData(null);
      toast({
        title: "Erreur",
        description: "Impossible de vous rediriger vers Stripe. Veuillez réessayer.",
        variant: "destructive",
      });
      setLoading(false);
      throw error;
    }
  };

  const createCampaignWithExistingCard = async (campaignData: CampaignFormData, cardId: string) => {
    console.log('🎯 SUPABASE: Création campagne avec carte existante validée:', cardId);
    
    try {
      // Utiliser la nouvelle Edge Function Supabase pour finaliser la campagne
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { data, error } = await supabase.functions.invoke('finalize-campaign', {
        body: { 
          campaignData: {
            ...campaignData,
            defaultCommissionRate: 10
          },
          cardId 
        }
      });
      
      if (error) {
        throw new Error(error.message || 'Failed to create campaign');
      }
      
      console.log('✅ SUPABASE: Campagne créée et finalisée:', data.campaign.id);
      return data.campaign.id;
    } catch (error) {
      console.error('❌ SUPABASE: Erreur création campagne:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('🎯 SUPABASE: Validation AVANT création de campagne...');
      
      if (!formData.name || !formData.targetUrl) {
        throw new Error('Le nom et l\'URL de la campagne sont requis');
      }

      // Vérifier les cartes disponibles via Supabase
      console.log('🔄 SUPABASE: Vérification des cartes existantes...');
      await refreshPaymentMethods();
      
      console.log('💳 Cartes disponibles:', paymentMethods.length);
      
      if (paymentMethods.length === 0) {
        console.log('💳 SUPABASE: Aucune carte → Redirection Stripe');
        await redirectToStripeForNewCard(formData);
        return;
      }

      // Afficher le sélecteur de cartes
      console.log('💳 SUPABASE: Cartes disponibles → Afficher le sélecteur');
      setPendingCampaignData(formData);
      setShowPaymentSelector(true);
      setLoading(false);
      
    } catch (error: any) {
      console.error('❌ SUPABASE: Erreur dans le flow:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de traiter la demande",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return {
    handleSubmit,
    createCampaignWithExistingCard,
    redirectToStripeForNewCard,
  };
};