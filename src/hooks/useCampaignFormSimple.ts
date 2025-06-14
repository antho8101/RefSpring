
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
  const [createdCampaign, setCreatedCampaign] = useState<{ id: string; name: string } | null>(null);
  const [formData, setFormData] = useState<CampaignFormData>({
    name: '',
    description: '',
    targetUrl: '',
    isActive: true,
  });

  const { user } = useAuth();
  const { createCampaign } = useCampaigns();
  const { paymentMethods } = usePaymentMethods();
  const { toast } = useToast();

  const updateFormData = (updates: Partial<CampaignFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', targetUrl: '', isActive: true });
    setShowSuccessModal(false);
    setCreatedCampaign(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('🚀 SIMPLE: Création directe de campagne...');
      
      if (!formData.name) {
        throw new Error('Le nom de la campagne est requis');
      }
      
      if (!formData.targetUrl) {
        throw new Error('L\'URL de destination est requise');
      }

      // Prendre la première carte disponible
      const firstCard = paymentMethods[0];
      if (!firstCard) {
        throw new Error('Aucune carte de paiement disponible');
      }

      console.log('💳 SIMPLE: Utilisation de la carte:', firstCard.id);

      // Créer la campagne directement
      const campaignId = await createCampaign({
        name: formData.name,
        description: formData.description,
        targetUrl: formData.targetUrl,
        isActive: formData.isActive,
        isDraft: false,
        paymentConfigured: true,
        defaultCommissionRate: 10,
        stripePaymentMethodId: firstCard.id,
      });

      console.log('✅ SIMPLE: Campagne créée avec ID:', campaignId);

      // Déclencher immédiatement la modale de succès
      setCreatedCampaign({ id: campaignId, name: formData.name });
      setShowSuccessModal(true);

      console.log('🎉 SIMPLE: Modale de succès déclenchée');

      toast({
        title: "Campagne créée avec succès !",
        description: "Votre campagne est maintenant active.",
      });

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

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    setCreatedCampaign(null);
    resetForm();
  };

  return {
    formData,
    loading,
    showSuccessModal,
    createdCampaign,
    updateFormData,
    resetForm,
    handleSubmit,
    handleSuccessModalClose,
  };
};
