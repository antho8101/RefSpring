
import { useStripePayment } from '@/hooks/useStripePayment';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { useCampaignFormState } from './useCampaignFormState';
import { useCampaignFormSubmission } from './useCampaignFormSubmission';
import { useCampaignCardSelection } from './useCampaignCardSelection';
import { useSuccessModalState } from './useSuccessModalState';

export type { CampaignFormData } from './useCampaignFormState';

export const useCampaignForm = () => {
  // State management - formulaire normal
  const {
    loading,
    showPaymentSelector,
    pendingCampaignData,
    formData,
    setLoading,
    setShowPaymentSelector,
    setPendingCampaignData,
    updateFormData,
    resetForm,
    activateResetProtection,
  } = useCampaignFormState();

  // 🔥 CORRECTION CRITIQUE: Utiliser le vrai hook au lieu de la fonction dummy
  const { showSuccessModal } = useSuccessModalState();

  // External hooks
  const { loading: paymentLoading } = useStripePayment();
  const { paymentMethods, loading: paymentMethodsLoading } = usePaymentMethods();

  // Form submission logic
  const { handleSubmit, redirectToStripeForNewCard } = useCampaignFormSubmission(
    formData,
    setPendingCampaignData,
    setShowPaymentSelector,
    setLoading
  );

  // Card selection logic - 🔥 MAINTENANT AVEC LA VRAIE FONCTION
  const { handleCardSelection, handleAddNewCard } = useCampaignCardSelection(
    pendingCampaignData,
    setLoading,
    setShowPaymentSelector,
    redirectToStripeForNewCard,
    showSuccessModal, // 🔥 VRAIE FONCTION au lieu de dummyTriggerSuccessModal
    activateResetProtection
  );

  return {
    formData,
    loading,
    paymentLoading,
    showPaymentSelector,
    paymentMethods,
    paymentMethodsLoading,
    updateFormData,
    resetForm,
    handleSubmit,
    handleCardSelection,
    handleAddNewCard,
    setShowPaymentSelector,
  };
};
