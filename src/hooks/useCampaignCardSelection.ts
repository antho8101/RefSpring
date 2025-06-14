
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
      console.log('💳 🐛 DEBUG: Carte sélectionnée:', cardId);
      console.log('💳 🐛 DEBUG: Données de campagne à créer:', pendingCampaignData);
      
      // 🔧 CORRECTION : Créer la campagne directement finalisée avec la carte sélectionnée
      const campaignId = await createCampaign({
        name: pendingCampaignData.name,
        description: pendingCampaignData.description,
        targetUrl: pendingCampaignData.targetUrl,
        isActive: pendingCampaignData.isActive,
        isDraft: false, // ✅ Campagne finalisée
        paymentConfigured: true, // ✅ Paiement configuré
        defaultCommissionRate: 10,
        stripePaymentMethodId: cardId, // ✅ Carte associée
      });
      
      console.log('✅ 🐛 DEBUG: Campagne créée avec succès avec la carte existante. ID:', campaignId);
      
      // 🎉 ÉTAPE 1 : Fermer le sélecteur de paiement EN PREMIER
      console.log('💳 🐛 DEBUG: Fermeture du sélecteur de paiement...');
      setShowPaymentSelector(false);
      
      // 🎉 ÉTAPE 2 : Attendre un peu pour que la fermeture soit effective
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 🎉 ÉTAPE 3 : Définir les données de la campagne créée
      console.log('📋 🐛 DEBUG: Définition des données de campagne créée...');
      setCreatedCampaign({ id: campaignId, name: pendingCampaignData.name });
      
      // 🎉 ÉTAPE 4 : Attendre encore un peu
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // 🎉 ÉTAPE 5 : Déclencher les confettis ET la modale de succès
      console.log('🎉 🐛 DEBUG: Déclenchement des confettis...');
      setShowConfetti(true);
      
      console.log('📋 🐛 DEBUG: Affichage de la modale de succès...');
      setShowSuccessModal(true);
      
      // 🎉 ÉTAPE 6 : Attendre que la modale soit bien affichée
      await new Promise(resolve => setTimeout(resolve, 100));
      
      toast({
        title: "Campagne créée avec succès !",
        description: "Votre campagne est maintenant active avec la carte sélectionnée.",
      });
      
      // 🚨 CORRECTION CRITIQUE : Retourner le signal pour garder la modale principale ouverte
      console.log('💳 🐛 DEBUG: Retour du signal de succès AVEC modale principale ouverte...');
      return { success: true, keepMainModalOpen: true };
      
    } catch (error: any) {
      console.error('❌ 🐛 DEBUG: Erreur création campagne avec carte:', error);
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
