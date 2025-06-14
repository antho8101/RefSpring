
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
  const { refreshPaymentMethods } = usePaymentMethods();
  const { toast } = useToast();

  const createCampaignWithPayment = async (campaignData: CampaignFormData) => {
    console.log('🎯 Création de la campagne avec paiement...');
    
    // Créer la campagne
    const campaignId = await createCampaign({
      ...campaignData,
      isDraft: true, // Créer en draft d'abord
      paymentConfigured: false,
      defaultCommissionRate: 10,
    });
    
    console.log('✅ Campagne créée:', campaignId);
    
    try {
      // Rediriger vers Stripe pour la configuration de paiement
      await setupPaymentForCampaign(campaignId, campaignData.name);
      console.log('✅ Redirection vers Stripe en cours...');
    } catch (error) {
      console.error('❌ Erreur lors de la redirection vers Stripe:', error);
      toast({
        title: "Erreur",
        description: "Impossible de vous rediriger vers Stripe. Veuillez réessayer.",
        variant: "destructive",
      });
      setLoading(false);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('🎯 Début du processus de création de campagne...');
      
      if (!formData.name) {
        throw new Error('Le nom de la campagne est requis');
      }
      
      if (!formData.targetUrl) {
        throw new Error('L\'URL de destination est requise');
      }

      // **CORRECTION CRITIQUE** : Récupérer les données fraîches directement
      console.log('🔄 CRITICAL: Vérification des cartes avant création...');
      await refreshPaymentMethods();
      
      // Attendre un délai plus long pour s'assurer de la synchronisation
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // **NOUVEAU** : Faire un deuxième appel pour obtenir les données les plus récentes
      const freshCardsResponse = await fetch('/api/stripe/get-payment-methods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userEmail: user?.email }),
      });
      
      const freshCardsData = await freshCardsResponse.json();
      const freshCardsCount = freshCardsData.paymentMethods?.length || 0;
      
      console.log('💳 CRITICAL: Cartes disponibles (données fraîches directes):', freshCardsCount);
      
      if (freshCardsCount > 0) {
        console.log('💳 Cartes existantes trouvées, affichage du sélecteur');
        setPendingCampaignData(formData);
        setShowPaymentSelector(true);
        setLoading(false);
        return;
      }

      console.log('💳 Aucune carte trouvée, redirection vers Stripe...');
      // Pas de cartes existantes, créer la campagne et rediriger vers Stripe
      await createCampaignWithPayment(formData);
      
    } catch (error: any) {
      console.error('❌ Erreur création campagne:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer la campagne",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return {
    handleSubmit,
    createCampaignWithPayment,
  };
};
