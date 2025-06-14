
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
  redirectToStripeForNewCard: (data: CampaignFormData) => Promise<void>,
  triggerSuccessModal: (campaignId: string, campaignName: string) => void
) => {
  const { createCampaign } = useCampaigns();
  const { toast } = useToast();

  const handleCardSelection = async (cardId: string) => {
    if (!pendingCampaignData) return;
    
    try {
      setLoading(true);
      console.log('💳 NOUVEAU FLOW: Création campagne MAINTENANT avec carte sélectionnée:', cardId);
      
      // Créer la campagne directement finalisée car la carte est validée
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
      
      console.log('✅ NOUVEAU FLOW: Campagne créée APRÈS sélection carte:', campaignId);
      
      // Fermer le sélecteur
      setShowPaymentSelector(false);
      
      // Déclencher la modale de succès
      triggerSuccessModal(campaignId, pendingCampaignData.name);
      
      toast({
        title: "Campagne créée avec succès !",
        description: "Votre campagne est maintenant active avec la carte sélectionnée.",
      });
      
      return { success: true, keepMainModalOpen: true };
      
    } catch (error: any) {
      console.error('❌ NOUVEAU FLOW: Erreur création campagne:', error);
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
      console.log('💳 NOUVEAU FLOW: Ajout nouvelle carte → Redirection Stripe (PAS de création campagne)');
      await redirectToStripeForNewCard(pendingCampaignData);
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
