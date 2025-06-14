
import { useStripePayment } from '@/hooks/useStripePayment';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { useCampaignFormState } from './useCampaignFormState';
import { useCampaignFormSubmission } from './useCampaignFormSubmission';
import { useCampaignCardSelection } from './useCampaignCardSelection';

export type { CampaignFormData } from './useCampaignFormState';

export const useCampaignForm = () => {
  // State management
  const {
    loading,
    showPaymentSelector,
    pendingCampaignData,
    showConfetti,
    showSuccessModal,
    createdCampaign,
    formData,
    setLoading,
    setShowPaymentSelector,
    setPendingCampaignData,
    setShowConfetti,
    setShowSuccessModal,
    setCreatedCampaign,
    updateFormData,
    resetForm,
    triggerSuccessModal,
    releaseSuccessModalLock,
  } = useCampaignFormState();

  // External hooks
  const { loading: paymentLoading } = useStripePayment();
  const { paymentMethods, loading: paymentMethodsLoading } = usePaymentMethods();

  // Form submission logic avec nouveau flow
  const { handleSubmit, createCampaignWithExistingCard, redirectToStripeForNewCard } = useCampaignFormSubmission(
    formData,
    setPendingCampaignData,
    setShowPaymentSelector,
    setLoading
  );

  // Card selection logic avec nouveau flow
  const { handleCardSelection, handleAddNewCard } = useCampaignCardSelection(
    pendingCampaignData,
    setLoading,
    setShowConfetti,
    setCreatedCampaign,
    setShowSuccessModal,
    setShowPaymentSelector,
    redirectToStripeForNewCard, // Nouvelle méthode
    triggerSuccessModal
  );

  return {
    formData,
    loading,
    paymentLoading,
    showPaymentSelector,
    paymentMethods,
    paymentMethodsLoading,
    showConfetti,
    showSuccessModal,
    createdCampaign,
    updateFormData,
    resetForm,
    handleSubmit,
    handleCardSelection,
    handleAddNewCard,
    setShowPaymentSelector,
    setShowConfetti,
    setShowSuccessModal,
    triggerSuccessModal,
    releaseSuccessModalLock,
  };
};
