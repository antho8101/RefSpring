
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
    if (!pendingCampaignData) {
      console.log('❌ CARD SELECTION: Pas de données de campagne en attente');
      return;
    }
    
    try {
      setLoading(true);
      console.log('💳 CARD SELECTION: Début création campagne avec carte:', cardId);
      console.log('💳 CARD SELECTION: Données campagne:', pendingCampaignData);
      
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
      
      console.log('✅ CARD SELECTION: Campagne créée avec ID:', campaignId);
      
      // 🔥 CORRECTION CRITIQUE: Fermer le sélecteur AVANT tout le reste
      setShowPaymentSelector(false);
      console.log('🔄 CARD SELECTION: Sélecteur fermé');
      
      // 🔥 CORRECTION: Arrêter le loading AVANT de déclencher la modale de succès
      setLoading(false);
      console.log('⏹️ CARD SELECTION: Loading arrêté');
      
      // 🔥 CORRECTION: Attendre un peu plus pour que tous les états se stabilisent
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // 🔥 CORRECTION: Déclencher la modale de succès en dernier
      console.log('🎉 CARD SELECTION: DÉCLENCHEMENT triggerSuccessModal avec:', { campaignId, name: pendingCampaignData.name });
      triggerSuccessModal(campaignId, pendingCampaignData.name);
      
      // 🔥 CORRECTION: Vérification retardée pour s'assurer que les états tiennent
      setTimeout(() => {
        console.log('🔍 CARD SELECTION: Vérification états après 1s - ILS DOIVENT ÊTRE MAINTENUS !');
      }, 1000);
      
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
