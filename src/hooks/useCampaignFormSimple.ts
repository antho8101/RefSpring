
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCampaigns } from '@/hooks/useCampaigns';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { useToast } from '@/hooks/use-toast';

export interface CampaignFormData {
  name: string;
  description: string;
  targetUrl: string;
  isActive: boolean;
}

export const useCampaignFormSimple = () => {
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showPaymentSelector, setShowPaymentSelector] = useState(false);
  const [createdCampaign, setCreatedCampaign] = useState<{ id: string; name: string } | null>(null);
  const [formData, setFormData] = useState<CampaignFormData>({
    name: '',
    description: '',
    targetUrl: '',
    isActive: true,
  });

  const { user } = useAuth();
  const { createCampaign } = useCampaigns();
  const { paymentMethods, refreshPaymentMethods } = usePaymentMethods();
  const { toast } = useToast();

  const updateFormData = (updates: Partial<CampaignFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', targetUrl: '', isActive: true });
    setShowSuccessModal(false);
    setCreatedCampaign(null);
    setShowPaymentSelector(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('🚀 SIMPLE: Début création campagne...');
      
      if (!formData.name) {
        throw new Error('Le nom de la campagne est requis');
      }
      
      if (!formData.targetUrl) {
        throw new Error('L\'URL de destination est requise');
      }

      // Vérifier les cartes disponibles
      await refreshPaymentMethods();
      
      if (paymentMethods.length === 0) {
        throw new Error('Aucune carte de paiement disponible');
      }

      if (paymentMethods.length === 1) {
        // Une seule carte disponible, l'utiliser directement
        console.log('💳 SIMPLE: Utilisation carte unique:', paymentMethods[0].id);
        
        const campaignId = await createCampaign({
          name: formData.name,
          description: formData.description,
          targetUrl: formData.targetUrl,
          isActive: formData.isActive,
          isDraft: false,
          paymentConfigured: true,
          defaultCommissionRate: 10,
          stripePaymentMethodId: paymentMethods[0].id,
        });

        console.log('✅ SIMPLE: Campagne créée avec ID:', campaignId);

        // Déclencher la modale de succès
        setCreatedCampaign({ id: campaignId, name: formData.name });
        setShowSuccessModal(true);

        toast({
          title: "Campagne créée avec succès !",
          description: "Votre campagne est maintenant active.",
        });
      } else {
        // Plusieurs cartes disponibles, afficher le sélecteur
        console.log('💳 SIMPLE: Plusieurs cartes disponibles, affichage sélecteur');
        setShowPaymentSelector(true);
      }

    } catch (error: any) {
      console.error('❌ SIMPLE: Erreur création campagne:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer la campagne",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCardSelection = async (cardId: string) => {
    setLoading(true);
    try {
      console.log('💳 SIMPLE: Carte sélectionnée:', cardId);
      
      const campaignId = await createCampaign({
        name: formData.name,
        description: formData.description,
        targetUrl: formData.targetUrl,
        isActive: formData.isActive,
        isDraft: false,
        paymentConfigured: true,
        defaultCommissionRate: 10,
        stripePaymentMethodId: cardId,
      });
      
      console.log('✅ SIMPLE: Campagne créée avec carte sélectionnée:', campaignId);
      
      // Fermer le sélecteur et ouvrir la modale de succès
      setShowPaymentSelector(false);
      setCreatedCampaign({ id: campaignId, name: formData.name });
      setShowSuccessModal(true);
      
      toast({
        title: "Campagne créée avec succès !",
        description: "Votre campagne est maintenant active avec la carte sélectionnée.",
      });
      
    } catch (error: any) {
      console.error('❌ SIMPLE: Erreur création avec carte sélectionnée:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer la campagne",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    setCreatedCampaign(null);
    resetForm();
  };

  return {
    formData,
    loading,
    showSuccessModal,
    showPaymentSelector,
    createdCampaign,
    paymentMethods,
    updateFormData,
    resetForm,
    handleSubmit,
    handleCardSelection,
    handleSuccessModalClose,
    setShowPaymentSelector,
  };
};
