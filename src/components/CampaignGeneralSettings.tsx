import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Pause } from 'lucide-react';
import { Campaign } from '@/types';
import { CriticalActionConfirmDialog } from '@/components/CriticalActionConfirmDialog';
import { PaymentMethodSelector } from '@/components/PaymentMethodSelector';
import { CampaignBasicFields } from '@/components/CampaignBasicFields';
import { CampaignStatusSection } from '@/components/CampaignStatusSection';
import { usePaymentVerification } from '@/hooks/usePaymentVerification';
import { useCriticalActionConfirm } from '@/hooks/useCriticalActionConfirm';
import { useCampaignFormHandlers } from '@/hooks/useCampaignFormHandlers';
import { useStripePayment } from '@/hooks/useStripePayment';

interface CampaignGeneralSettingsProps {
  campaign: Campaign;
  formData: {
    name: string;
    description: string;
    targetUrl: string;
    isActive: boolean;
    defaultCommissionRate: number;
  };
  initialTargetUrl: string;
  loading: boolean;
  onFormDataChange: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  onDeleteClick: () => void;
}

export const CampaignGeneralSettings = ({
  campaign,
  formData,
  initialTargetUrl,
  loading,
  onFormDataChange,
  onSubmit,
  onCancel,
}: CampaignGeneralSettingsProps) => {
  const {
    showPaymentSelector,
    setShowPaymentSelector,
    paymentMethods,
    paymentMethodsLoading,
    verifyPaymentForReactivation,
    handleCardSelection,
  } = usePaymentVerification();

  const { setupPaymentForCampaign } = useStripePayment();

  const {
    confirmDialog,
    showConfirmDialog,
    closeConfirmDialog,
  } = useCriticalActionConfirm();

  const {
    handleTargetUrlChange,
    handleCommissionRateChange,
    saveStatusChange,
  } = useCampaignFormHandlers(
    campaign,
    formData,
    initialTargetUrl,
    onFormDataChange,
    showConfirmDialog
  );

  const hasTargetUrlChanged = formData.targetUrl !== initialTargetUrl;
  const hasCommissionChanged = formData.defaultCommissionRate !== campaign.defaultCommissionRate;
  const hasStatusChanged = formData.isActive !== campaign.isActive;

  const handleStatusChange = async (isActive: boolean) => {
    if (!isActive && campaign.isActive) {
      // Désactivation : procédure normale
      showConfirmDialog(
        'Désactiver la campagne',
        'Cette action va désactiver tous les liens de tracking de la campagne. Les affiliés ne pourront plus générer de nouveaux clics ou conversions.',
        () => saveStatusChange(isActive),
        'Désactiver',
        'warning'
      );
    } else if (isActive && !campaign.isActive) {
      // Réactivation : VÉRIFIER LES CARTES D'ABORD !
      const canReactivate = await verifyPaymentForReactivation(campaign.id, formData, onFormDataChange);
      if (canReactivate) {
        saveStatusChange(isActive);
      }
    } else {
      // Pas de changement de statut
      saveStatusChange(isActive);
    }
  };

  const handleCardSelectionWrapper = async (cardId: string) => {
    await handleCardSelection(cardId, campaign.id, formData, onFormDataChange);
  };

  const handleAddNewCard = async () => {
    try {
      console.log('🔄 RÉACTIVATION: Redirection vers Stripe pour nouvelle carte');
      setShowPaymentSelector(false);
      
      // Stocker les données de réactivation pour le retour de Stripe
      const { secureStorage } = await import('@/utils/secureClientStorage');
      secureStorage.setCampaignData('campaignReactivationData', {
        campaignId: campaign.id,
        campaignName: campaign.name,
        timestamp: Date.now()
      }, 24);
      console.log('💾 Données de réactivation stockées pour campagne:', campaign.name);
      
      // Utiliser le système de redirection Stripe existant
      await setupPaymentForCampaign(campaign.id, campaign.name);
    } catch (error: any) {
      console.error('❌ Erreur redirection Stripe:', error);
      // Nettoyer les données si erreur
      const { secureStorage: secureStorageCleanup } = await import('@/utils/secureClientStorage');
      secureStorageCleanup.removeSecure('campaign_campaignReactivationData');
    }
  };

  return (
    <>
      <form onSubmit={onSubmit} className="space-y-8 h-full flex flex-col">
        <div className="flex-1 space-y-6">
          {/* Bandeau d'alerte pour campagne en pause */}
          {!formData.isActive && (
            <Alert className="border-orange-200 bg-orange-50">
              <Pause className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <strong>Campagne en pause</strong> - Les liens de tracking n'acceptent plus de nouveaux clics. 
                Activez la campagne pour reprendre le tracking des conversions.
              </AlertDescription>
            </Alert>
          )}

          <CampaignBasicFields
            formData={formData}
            hasCommissionChanged={hasCommissionChanged}
            hasTargetUrlChanged={hasTargetUrlChanged}
            onFormDataChange={onFormDataChange}
            onTargetUrlChange={handleTargetUrlChange}
            onCommissionRateChange={handleCommissionRateChange}
          />
          
          <CampaignStatusSection
            campaign={campaign}
            formData={formData}
            hasStatusChanged={hasStatusChanged}
            onStatusChange={handleStatusChange}
            paymentMethodsLoading={paymentMethodsLoading}
          />
        </div>

        <div className="flex justify-end pt-6 border-t">
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onCancel} className="rounded-xl">
              Annuler
            </Button>
            <Button type="submit" disabled={loading} className="rounded-xl">
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </div>
      </form>

      <CriticalActionConfirmDialog
        open={confirmDialog.open}
        onOpenChange={closeConfirmDialog}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmText={confirmDialog.confirmText}
        variant={confirmDialog.variant}
        onConfirm={confirmDialog.action}
      />

      <PaymentMethodSelector
        open={showPaymentSelector}
        onOpenChange={setShowPaymentSelector}
        paymentMethods={paymentMethods}
        onSelectCard={handleCardSelectionWrapper}
        onAddNewCard={handleAddNewCard}
        loading={paymentMethodsLoading}
      />
    </>
  );
};
