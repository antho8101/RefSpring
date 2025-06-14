
import { useCampaigns } from '@/hooks/useCampaigns';
import { useToast } from '@/hooks/use-toast';
import { CampaignFormData } from './useCampaignFormState';

export const useCampaignCardSelection = (
  pendingCampaignData: CampaignFormData | null,
  setLoading: (loading: boolean) => void,
  setShowPaymentSelector: (show: boolean) => void,
  redirectToStripeForNewCard: (data: CampaignFormData) => Promise<void>,
  triggerSuccessModal: (campaignId: string, campaignName: string) => void,
  activateResetProtection: () => void
) => {
  const { createCampaign } = useCampaigns();
  const { toast } = useToast();

  const handleCardSelection = async (cardId: string) => {
    if (!pendingCampaignData) {
      console.log('❌ CARD SELECTION: Pas de données de campagne en attente');
      return;
    }
    
    try {
      setLoading(true);
      console.log('💳 CARD SELECTION: Début création campagne avec carte:', cardId);
      console.log('💳 CARD SELECTION: Données campagne:', pendingCampaignData);
      
      // Activer la protection contre les resets
      activateResetProtection();
      
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
      
      console.log('✅ CARD SELECTION: Campagne créée avec ID:', campaignId);
      
      // Fermer le sélecteur de paiement
      setShowPaymentSelector(false);
      setLoading(false);
      
      // Attendre que les états se stabilisent
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Déclencher la modale de succès avec le nouveau système isolé
      console.log('🚀 CARD SELECTION: Déclenchement modale de succès isolée');
      triggerSuccessModal(campaignId, pendingCampaignData.name);
      
      toast({
        title: "Campagne créée avec succès !",
        description: "Votre campagne est maintenant active avec la carte sélectionnée.",
      });
      
      return { success: true, keepMainModalOpen: true };
      
    } catch (error: any) {
      console.error('❌ CARD SELECTION: Erreur création campagne:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer la campagne",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleAddNewCard = async () => {
    if (!pendingCampaignData) return;
    
    try {
      setLoading(true);
      console.log('💳 NOUVEAU FLOW: Ajout nouvelle carte → Redirection Stripe');
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
