
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
  const [showConfetti, setShowConfetti] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdCampaign, setCreatedCampaign] = useState<{ id: string; name: string } | null>(null);
  const [formData, setFormData] = useState<CampaignFormData>({
    name: '',
    description: '',
    targetUrl: '',
    isActive: true,
  });

  // 🔥 PROTECTION ABSOLUE contre les resets non désirés
  const successModalLockRef = useRef(false);
  const resetProtectionRef = useRef(false);

  const updateFormData = (updates: Partial<CampaignFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  // 🔥 VERSION SÉCURISÉE du reset qui respecte la protection
  const resetForm = () => {
    if (resetProtectionRef.current) {
      console.log('🚫 PROTECTION: Reset bloqué car protection active');
      return;
    }
    
    if (successModalLockRef.current) {
      console.log('🚫 PROTECTION: Reset bloqué car modale de succès active');
      return;
    }

    console.log('🔥 FINAL: resetForm appelé - remise à zéro des états (AUTORISÉ)');
    setFormData({ name: '', description: '', targetUrl: '', isActive: true });
    setPendingCampaignData(null);
    setShowPaymentSelector(false);
    setShowConfetti(false);
    setShowSuccessModal(false);
    setCreatedCampaign(null);
  };

  // 🔥 VERSION ULTRA SÉCURISÉE du déclenchement de la modale
  const triggerSuccessModal = (campaignId: string, campaignName: string) => {
    console.log('🔥 FINAL: triggerSuccessModal appelé avec:', { campaignId, campaignName });
    
    // 🔥 VERROUS ABSOLUS
    successModalLockRef.current = true;
    resetProtectionRef.current = true;
    
    console.log('🔒 PROTECTION: Verrous activés - plus aucun reset possible');
    
    const newCampaign = { id: campaignId, name: campaignName };
    
    // 🔥 FORCER les états de manière synchrone
    setCreatedCampaign(newCampaign);
    setShowSuccessModal(true);
    setShowConfetti(true);
    
    console.log('🔥 FINAL: États forcés:', {
      createdCampaign: newCampaign,
      showSuccessModal: true,
      showConfetti: true
    });

    // 🔥 VÉRIFICATIONS RETARDÉES avec protection maintenue
    setTimeout(() => {
      console.log('🔥 PROTECTION: Vérification 50ms avec verrous maintenus');
    }, 50);
    
    setTimeout(() => {
      console.log('🔥 PROTECTION: Vérification 200ms avec verrous maintenus');
    }, 200);
    
    // 🔥 MAINTENIR la protection pendant 10 secondes (augmenté)
    setTimeout(() => {
      console.log('🔓 PROTECTION: Verrous libérés après 10s');
      resetProtectionRef.current = false;
      // NE PAS libérer successModalLockRef ici - seulement quand la modale se ferme
    }, 10000);
  };

  // 🔥 FONCTION pour libérer le verrou quand la modale se ferme
  const releaseSuccessModalLock = () => {
    console.log('🔓 PROTECTION: Libération du verrou de modale de succès');
    successModalLockRef.current = false;
    resetProtectionRef.current = false;
  };

  // 🔥 SETTERS PROTÉGÉS
  const protectedSetShowSuccessModal = (value: boolean) => {
    if (!value && successModalLockRef.current) {
      // Permettre seulement si on ferme explicitement via releaseSuccessModalLock
      console.log('🚫 PROTECTION: Tentative de fermeture modale bloquée');
      return;
    }
    setShowSuccessModal(value);
  };

  const protectedSetCreatedCampaign = (value: { id: string; name: string } | null) => {
    if (value === null && successModalLockRef.current) {
      console.log('🚫 PROTECTION: Tentative de reset createdCampaign bloquée');
      return;
    }
    setCreatedCampaign(value);
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
    
    // Actions (certaines protégées)
    setLoading,
    setShowPaymentSelector,
    setPendingCampaignData,
    setShowConfetti,
    setShowSuccessModal: protectedSetShowSuccessModal,
    setCreatedCampaign: protectedSetCreatedCampaign,
    updateFormData,
    resetForm,
    triggerSuccessModal,
    releaseSuccessModalLock,
  };
};
