
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

      // **ÉTAPE CRITIQUE** : Rafraîchir les cartes avant de décider
      console.log('🔄 CRITICAL: Vérification des cartes avant création...');
      await refreshPaymentMethods();
      
      // Attendre un petit délai pour s'assurer que les données sont synchronisées
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('💳 CRITICAL: Cartes disponibles après refresh:', paymentMethods.length);
      
      if (paymentMethods.length > 0) {
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
      console.log('💳 Carte sélectionnée:', cardId);
      console.log('📝 Données de campagne à créer:', pendingCampaignData);
      
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
      
      console.log('✅ Campagne créée avec succès avec la carte existante. ID:', campaignId);
      
      // 🎉 Déclencher les confettis pour la création avec carte existante !
      setShowConfetti(true);
      
      toast({
        title: "Campagne créée avec succès !",
        description: "Votre campagne est maintenant active avec la carte sélectionnée.",
      });
      
      // Réinitialiser et fermer toutes les modales
      resetForm();
      
      // Retourner un signal pour fermer la modale principale
      return { success: true };
      
    } catch (error: any) {
      console.error('❌ Erreur création campagne avec carte:', error);
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
    formData,
    loading,
    paymentLoading,
    showPaymentSelector,
    paymentMethods,
    paymentMethodsLoading,
    showConfetti,
    updateFormData,
    resetForm,
    handleSubmit,
    handleCardSelection,
    handleAddNewCard,
    setShowPaymentSelector,
    setShowConfetti,
  };
};
