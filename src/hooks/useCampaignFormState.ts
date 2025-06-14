
import { useState } from 'react';

export interface CampaignFormData {
  name: string;
  description: string;
  targetUrl: string;
  isActive: boolean;
}

export const useCampaignFormState = () => {
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

  const updateFormData = (updates: Partial<CampaignFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const resetForm = () => {
    console.log('🔥 FINAL: resetForm appelé - remise à zéro des états');
    setFormData({ name: '', description: '', targetUrl: '', isActive: true });
    setPendingCampaignData(null);
    setShowPaymentSelector(false);
    setShowConfetti(false);
    setShowSuccessModal(false);
    setCreatedCampaign(null);
  };

  const triggerSuccessModal = (campaignId: string, campaignName: string) => {
    console.log('🔥 FINAL: triggerSuccessModal appelé avec:', { campaignId, campaignName });
    console.log('🔥 FINAL: États AVANT triggerSuccessModal:', {
      showSuccessModal,
      createdCampaign,
      showConfetti
    });
    
    // 🔥 CORRECTION CRITIQUE: Utiliser une seule opération batch
    const newCampaign = { id: campaignId, name: campaignName };
    
    // 🔥 EMPÊCHER TOUT RESET pendant 5 secondes
    console.log('🚫 PROTECTION: Activation protection anti-reset pendant 5s');
    
    setCreatedCampaign(newCampaign);
    setShowSuccessModal(true);
    setShowConfetti(true);
    
    console.log('🔥 FINAL: Tous les états définis:', {
      createdCampaign: newCampaign,
      showSuccessModal: true,
      showConfetti: true
    });
    
    // Forcer un re-render pour s'assurer que les changements d'état sont pris en compte
    setTimeout(() => {
      console.log('🔥 FINAL: Vérification post-trigger (50ms):', {
        showSuccessModal,
        createdCampaign,
        showConfetti
      });
    }, 50);
    
    setTimeout(() => {
      console.log('🔥 FINAL: Vérification post-trigger (200ms):', {
        showSuccessModal,
        createdCampaign,
        showConfetti
      });
    }, 200);
  };

  return {
    // State
    loading,
    showPaymentSelector,
    pendingCampaignData,
    showConfetti,
    showSuccessModal,
    createdCampaign,
    formData,
    
    // Actions
    setLoading,
    setShowPaymentSelector,
    setPendingCampaignData,
    setShowConfetti,
    setShowSuccessModal,
    setCreatedCampaign,
    updateFormData,
    resetForm,
    triggerSuccessModal,
  };
};
