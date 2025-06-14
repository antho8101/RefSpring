
import { useStripePayment } from '@/hooks/useStripePayment';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { useCampaignFormState } from './useCampaignFormState';
import { useCampaignFormSubmission } from './useCampaignFormSubmission';
import { useCampaignCardSelection } from './useCampaignCardSelection';
import { useSuccessModal } from '@/contexts/SuccessModalContext';

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

  // State management - modale de succès via contexte global
  const {
    successModalData,
    showConfetti,
    isSuccessModalOpen,
    showSuccessModal: triggerSuccessModal,
    hideSuccessModal,
  } = useSuccessModal();

  console.log('🔍 CAMPAIGN FORM: État reçu du contexte SuccessModal:', {
    successModalData,
    isSuccessModalOpen,
    showConfetti
  });

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

  // Card selection logic avec le contexte global
  const { handleCardSelection, handleAddNewCard } = useCampaignCardSelection(
    pendingCampaignData,
    setLoading,
    setShowPaymentSelector,
    redirectToStripeForNewCard,
    triggerSuccessModal,
    activateResetProtection
  );

  const result = {
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
    
    // API pour la modale de succès via contexte
    successModalData,
    showConfetti,
    isSuccessModalOpen,
    hideSuccessModal,
  };

  console.log('🔍 CAMPAIGN FORM: États finaux retournés:', {
    'successModalData': result.successModalData,
    'isSuccessModalOpen': result.isSuccessModalOpen,
    'showConfetti': result.showConfetti
  });

  return result;
};
