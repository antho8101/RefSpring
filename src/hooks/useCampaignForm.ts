
import { useStripePayment } from '@/hooks/useStripePayment';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { useCampaignFormState } from './useCampaignFormState';
import { useCampaignFormSubmission } from './useCampaignFormSubmission';
import { useCampaignCardSelection } from './useCampaignCardSelection';

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

  // Fonction vide pour la compatibilité
  const dummyTriggerSuccessModal = (campaignId: string, campaignName: string) => {
    console.log('🔄 DUMMY: triggerSuccessModal appelé avec:', campaignId, campaignName);
  };

  // Card selection logic
  const { handleCardSelection, handleAddNewCard } = useCampaignCardSelection(
    pendingCampaignData,
    setLoading,
    setShowPaymentSelector,
    redirectToStripeForNewCard,
    dummyTriggerSuccessModal,
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
