
import { useState } from 'react';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useStripePayment } from '@/hooks/useStripePayment';
import { useToast } from '@/hooks/use-toast';

export interface CampaignFormData {
  name: string;
  description: string;
  targetUrl: string;
  isActive: boolean;
}

export const useCampaignForm = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CampaignFormData>({
    name: '',
    description: '',
    targetUrl: '',
    isActive: true,
  });
  
  const { createCampaign } = useCampaigns();
  const { setupPaymentForCampaign, loading: paymentLoading } = useStripePayment();
  const { toast } = useToast();

  const updateFormData = (updates: Partial<CampaignFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', targetUrl: '', isActive: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('🎯 Création de la campagne en mode draft...');
      
      if (!formData.name) {
        throw new Error('Le nom de la campagne est requis');
      }
      
      if (!formData.targetUrl) {
        throw new Error('L\'URL de destination est requise');
      }
      
      // Créer la campagne en mode draft
      const campaignId = await createCampaign({
        ...formData,
        isDraft: true,
        paymentConfigured: false,
        defaultCommissionRate: 10, // Valeur par défaut de 10%
      });
      
      console.log('✅ Campagne draft créée:', campaignId);
      
      // Rediriger vers Stripe pour la configuration de paiement
      const setupData = await setupPaymentForCampaign(campaignId, formData.name);
      console.log('✅ Redirection vers la page de paiement:', setupData.checkoutUrl);
      
      // Rediriger l'utilisateur vers la page de paiement
      window.location.href = setupData.checkoutUrl;
      
      return setupData;
    } catch (error: any) {
      console.error('❌ Erreur création campagne:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer la campagne",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    loading,
    paymentLoading,
    updateFormData,
    resetForm,
    handleSubmit,
  };
};
