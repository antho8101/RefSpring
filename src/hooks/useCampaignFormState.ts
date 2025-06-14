
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
    
    setCreatedCampaign({ id: campaignId, name: campaignName });
    console.log('🔥 FINAL: setCreatedCampaign appelé avec:', { id: campaignId, name: campaignName });
    
    setShowSuccessModal(true);
    console.log('🔥 FINAL: setShowSuccessModal appelé avec: true');
    
    setShowConfetti(true);
    console.log('🔥 FINAL: setShowConfetti appelé avec: true');
    
    console.log('🔥 FINAL: triggerSuccessModal terminé - tous les setters appelés');
    
    // Forcer un re-render pour s'assurer que les changements d'état sont pris en compte
    setTimeout(() => {
      console.log('🔥 FINAL: Vérification post-trigger:', {
        showSuccessModal,
        createdCampaign,
        showConfetti
      });
    }, 50);
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

