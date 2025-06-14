
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
    setFormData({ name: '', description: '', targetUrl: '', isActive: true });
    setPendingCampaignData(null);
    setShowPaymentSelector(false);
    setShowConfetti(false);
    setShowSuccessModal(false);
    setCreatedCampaign(null);
  };

  const triggerSuccessModal = (campaignId: string, campaignName: string) => {
    setCreatedCampaign({ id: campaignId, name: campaignName });
    setShowSuccessModal(true);
    setShowConfetti(true);
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
