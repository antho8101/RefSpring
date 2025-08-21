
import { useAuth } from '@/hooks/useAuth';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useStripePayment } from '@/hooks/useStripePayment';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { useToast } from '@/hooks/use-toast';
import { CampaignFormData } from './useCampaignFormState';
import { functions } from '@/lib/firebase';
import { httpsCallable } from 'firebase/functions';

export const useCampaignFormSubmission = (
  formData: CampaignFormData,
  setPendingCampaignData: (data: CampaignFormData | null) => void,
  setShowPaymentSelector: (show: boolean) => void,
  setLoading: (loading: boolean) => void
) => {
  const { user } = useAuth();
  const { createCampaign } = useCampaigns();
  const { setupPaymentForCampaign } = useStripePayment();
  const { refreshPaymentMethods } = usePaymentMethods();
  const { toast } = useToast();

  const redirectToStripeForNewCard = async (campaignData: CampaignFormData) => {
    console.log('🎯 NOUVEAU FLOW: Redirection vers Stripe SANS créer la campagne');
    
    try {
      // Stocker les données de campagne dans localStorage pour après validation Stripe
      localStorage.setItem('pendingCampaignData', JSON.stringify(campaignData));
      console.log('💾 Données campagne stockées dans localStorage');
      
      // Stocker aussi dans le state pour le flow normal
      setPendingCampaignData(campaignData);
      
      // Rediriger vers Stripe avec un ID temporaire
      await setupPaymentForCampaign('temp_new_campaign', campaignData.name);
      console.log('✅ Redirection vers Stripe en cours (campagne PAS ENCORE créée)...');
    } catch (error) {
      console.error('❌ Erreur lors de la redirection vers Stripe:', error);
      localStorage.removeItem('pendingCampaignData');
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
    console.log('🎯 Création campagne avec carte existante validée:', cardId);
    
    // Créer la campagne directement finalisée car la carte est déjà validée
    const campaignId = await createCampaign({
      ...campaignData,
      isDraft: false,
      paymentConfigured: true,
      defaultCommissionRate: 10,
      stripePaymentMethodId: cardId,
    });
    
    console.log('✅ Campagne créée et finalisée:', campaignId);
    return campaignId;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('🎯 FLOW CORRIGÉ: Validation AVANT création de campagne...');
      
      if (!formData.name) {
        throw new Error('Le nom de la campagne est requis');
      }
      
      if (!formData.targetUrl) {
        throw new Error('L\'URL de destination est requise');
      }

      // Vérifier les cartes disponibles
      console.log('🔄 Vérification des cartes existantes...');
      await refreshPaymentMethods();
      
      // Attendre pour s'assurer de la synchronisation
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Récupérer les données fraîches via Firebase
      const getPaymentMethods = httpsCallable(functions, 'stripeGetPaymentMethods');
      const freshCardsResponse = await getPaymentMethods({ userEmail: user?.email });
      const freshCardsData = freshCardsResponse.data as { paymentMethods?: any[] };
      
      const availableCards = freshCardsData.paymentMethods || [];
      
      console.log('💳 Cartes disponibles:', availableCards.length);
      
      if (availableCards.length === 0) {
        console.log('💳 FLOW CORRIGÉ: Aucune carte → Redirection Stripe (PAS de création campagne)');
        await redirectToStripeForNewCard(formData);
        return;
      }

      // 🔥 CORRECTION: TOUJOURS afficher le sélecteur, même avec une seule carte
      console.log('💳 FLOW CORRIGÉ: Cartes disponibles → TOUJOURS afficher le sélecteur');
      setPendingCampaignData(formData);
      setShowPaymentSelector(true);
      setLoading(false);
      
    } catch (error: any) {
      console.error('❌ Erreur dans le flow corrigé:', error);
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
