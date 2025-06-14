
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

  // State management - modale de succès isolée
  const {
    successModalData,
    showConfetti,
    isSuccessModalOpen,
    showSuccessModal: triggerSuccessModal,
    hideSuccessModal,
  } = useSuccessModalState();

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

  // Card selection logic avec la nouvelle modale de succès
  const { handleCardSelection, handleAddNewCard } = useCampaignCardSelection(
    pendingCampaignData,
    setLoading,
    setShowPaymentSelector,
    redirectToStripeForNewCard,
    triggerSuccessModal,
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
    
    // Nouvelle API pour la modale de succès
    successModalData,
    showConfetti,
    isSuccessModalOpen,
    hideSuccessModal,
  };
};
