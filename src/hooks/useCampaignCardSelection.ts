

import { useCampaigns } from '@/hooks/useCampaigns';
import { useToast } from '@/hooks/use-toast';
import { CampaignFormData } from './useCampaignFormState';

export const useCampaignCardSelection = (
  pendingCampaignData: CampaignFormData | null,
  setLoading: (loading: boolean) => void,
  setShowConfetti: (show: boolean) => void,
  setCreatedCampaign: (campaign: { id: string; name: string } | null) => void,
  setShowSuccessModal: (show: boolean) => void,
  setShowPaymentSelector: (show: boolean) => void,
  createCampaignWithPayment: (data: CampaignFormData) => Promise<void>,
  triggerSuccessModal: (campaignId: string, campaignName: string) => void
) => {
  const { createCampaign } = useCampaigns();
  const { toast } = useToast();

  const handleCardSelection = async (cardId: string) => {
    if (!pendingCampaignData) return;
    
    try {
      setLoading(true);
      console.log('💳 🔥 FINAL: Carte sélectionnée:', cardId);
      
      // Créer la campagne
      const campaignId = await createCampaign({
        name: pendingCampaignData.name,
        description: pendingCampaignData.description,
        targetUrl: pendingCampaignData.targetUrl,
        isActive: pendingCampaignData.isActive,
        isDraft: false,
        paymentConfigured: true,
        defaultCommissionRate: 10,
        stripePaymentMethodId: cardId,
      });
      
      console.log('🔥 FINAL: Campagne créée avec ID:', campaignId);
      
      // ÉTAPE 1: Fermer immédiatement le sélecteur
      setShowPaymentSelector(false);
      
      console.log('🔥 FINAL: AVANT triggerSuccessModal - campaignId:', campaignId, 'campaignName:', pendingCampaignData.name);
      
      // ÉTAPE 2: Déclencher la modale de succès via triggerSuccessModal
      console.log('🔥 FINAL: Appel de triggerSuccessModal...');
      triggerSuccessModal(campaignId, pendingCampaignData.name);
      console.log('🔥 FINAL: triggerSuccessModal appelé - en cours...');
      
      // Attendre un peu pour s'assurer que les états sont définis
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('🔥 FINAL: Après délai - États devraient être définis maintenant');
      
      toast({
        title: "Campagne créée avec succès !",
        description: "Votre campagne est maintenant active avec la carte sélectionnée.",
      });
      
      // Retourner un signal de succès AVEC instruction de garder la modale principale ouverte
      return { success: true, keepMainModalOpen: true };
      
    } catch (error: any) {
      console.error('❌ 🔥 FINAL: Erreur création campagne:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer la campagne",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewCard = async () => {
    if (!pendingCampaignData) return;
    
    try {
      setLoading(true);
      await createCampaignWithPayment(pendingCampaignData);
    } catch (error: any) {
      console.error('❌ Erreur ajout nouvelle carte:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'ajouter une nouvelle carte",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return {
    handleCardSelection,
    handleAddNewCard,
  };
};

