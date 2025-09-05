
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
    
    if (!user?.uid) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour créer une campagne",
        variant: "destructive",
      });
      return;
    }

    if (!formData.name.trim() || !formData.targetUrl.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      console.log('🚀 SIMPLE: Création campagne avec:', formData);
      
      // Créer la campagne directement dans Supabase
      const { data: campaign, error } = await supabase
        .from('campaigns')
        .insert({
          name: formData.name,
          description: formData.description || '',
          target_url: formData.targetUrl,
          is_active: formData.isActive,
          user_id: user.uid,
          is_draft: false,
          payment_configured: true,
          default_commission_rate: 0.10
        })
        .select()
        .single();

      if (error) {
        console.error('❌ SIMPLE: Erreur création campagne:', error);
        throw new Error('Erreur lors de la création de la campagne');
      }

      console.log('✅ SIMPLE: Campagne créée:', campaign);
      
      // Déclencher la modale de succès
      setCreatedCampaign({ id: campaign.id, name: campaign.name });
      setShowSuccessModal(true);
      
      toast({
        title: "Campagne créée avec succès !",
        description: "Votre campagne est maintenant active.",
      });
      
    } catch (error: any) {
      console.error('❌ SIMPLE: Erreur inattendue:', error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur inattendue s'est produite",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCardSelection = async (cardId: string) => {
    console.log('💳 SIMPLE: Sélection carte (simplifié):', cardId);
    setShowPaymentSelector(false);
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
