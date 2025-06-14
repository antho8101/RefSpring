
import { useState } from 'react';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useStripePayment } from '@/hooks/useStripePayment';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface CampaignFormData {
  name: string;
  description: string;
  targetUrl: string;
  isActive: boolean;
}

export const useCampaignForm = () => {
  const [loading, setLoading] = useState(false);
  const [showPaymentSelector, setShowPaymentSelector] = useState(false);
  const [pendingCampaignData, setPendingCampaignData] = useState<CampaignFormData | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdCampaign, setCreatedCampaign] = useState<{ id: string; name: string } | null>(null);
  const [formData, setFormData] = useState<CampaignFormData>({
    name: '',
    description: '',
    targetUrl: '',
    isActive: true,
  });
  
  const { user } = useAuth();
  const { createCampaign } = useCampaigns();
  const { setupPaymentForCampaign, loading: paymentLoading } = useStripePayment();
  const { paymentMethods, loading: paymentMethodsLoading, refreshPaymentMethods } = usePaymentMethods();
  const { toast } = useToast();

  const updateFormData = (updates: Partial<CampaignFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', targetUrl: '', isActive: true });
    setPendingCampaignData(null);
    setShowPaymentSelector(false);
    setShowConfetti(false);
    setShowSuccessModal(false);
    setCreatedCampaign(null);
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
      console.log('💳 CRITICAL: Cartes disponibles (hook local):', paymentMethods.length);
      
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

  const handleCardSelection = async (cardId: string) => {
    if (!pendingCampaignData) return;
    
    try {
      setLoading(true);
      console.log('💳 🐛 DEBUG: Carte sélectionnée:', cardId);
      console.log('💳 🐛 DEBUG: Données de campagne à créer:', pendingCampaignData);
      
      // Créer la campagne directement finalisée avec la carte sélectionnée
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
      
      console.log('✅ 🐛 DEBUG: Campagne créée avec succès avec la carte existante. ID:', campaignId);
      
      // 🎉 Déclencher les confettis pour la création avec carte existante !
      console.log('🎉 🐛 DEBUG: Déclenchement des confettis...');
      setShowConfetti(true);
      
      // 📋 NOUVEAU : Afficher la modale avec les scripts d'intégration
      console.log('📋 🐛 DEBUG: Configuration de la modale de succès...');
      console.log('📋 🐛 DEBUG: createdCampaign sera défini avec:', { id: campaignId, name: pendingCampaignData.name });
      setCreatedCampaign({ id: campaignId, name: pendingCampaignData.name });
      
      console.log('📋 🐛 DEBUG: Affichage de la modale de succès...');
      setShowSuccessModal(true);
      
      console.log('📋 🐛 DEBUG: État après définition:', {
        showSuccessModal: true,
        createdCampaign: { id: campaignId, name: pendingCampaignData.name }
      });
      
      toast({
        title: "Campagne créée avec succès !",
        description: "Votre campagne est maintenant active avec la carte sélectionnée.",
      });
      
      // Fermer le sélecteur de paiement
      console.log('💳 🐛 DEBUG: Fermeture du sélecteur de paiement...');
      setShowPaymentSelector(false);
      
      // Retourner un signal pour fermer la modale principale
      console.log('💳 🐛 DEBUG: Retour du signal de succès...');
      return { success: true };
      
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

  // 📋 NOUVEAU : Fonction pour déclencher la modale après retour de Stripe
  const triggerSuccessModal = (campaignId: string, campaignName: string) => {
    setCreatedCampaign({ id: campaignId, name: campaignName });
    setShowSuccessModal(true);
    setShowConfetti(true);
  };

  return {
    formData,
    loading,
    paymentLoading,
    showPaymentSelector,
    paymentMethods,
    paymentMethodsLoading,
    showConfetti,
    showSuccessModal,
    createdCampaign,
    updateFormData,
    resetForm,
    handleSubmit,
    handleCardSelection,
    handleAddNewCard,
    setShowPaymentSelector,
    setShowConfetti,
    setShowSuccessModal,
    triggerSuccessModal,
  };
};
