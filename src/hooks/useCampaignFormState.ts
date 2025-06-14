
import { useState, useRef } from 'react';

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
  const [formData, setFormData] = useState<CampaignFormData>({
    name: '',
    description: '',
    targetUrl: '',
    isActive: true,
  });

  // Suppression de toute la logique de success modal - maintenant gérée par useSuccessModalState
  const resetProtectionRef = useRef(false);

  const updateFormData = (updates: Partial<CampaignFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const resetForm = () => {
    if (resetProtectionRef.current) {
      console.log('🚫 PROTECTION: Reset bloqué car protection active');
      return;
    }
    
    console.log('🔄 FORM: Reset du formulaire autorisé');
    setFormData({ name: '', description: '', targetUrl: '', isActive: true });
    setPendingCampaignData(null);
    setShowPaymentSelector(false);
  };

  const activateResetProtection = () => {
    console.log('🔒 FORM: Activation protection reset pour 5s');
    resetProtectionRef.current = true;
    
    setTimeout(() => {
      console.log('🔓 FORM: Libération protection reset');
      resetProtectionRef.current = false;
    }, 5000);
  };

  return {
    // State
    loading,
    showPaymentSelector,
    pendingCampaignData,
    formData,
    
    // Actions
    setLoading,
    setShowPaymentSelector,
    setPendingCampaignData,
    updateFormData,
    resetForm,
    activateResetProtection,
  };
};
