
import { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { Campaign } from '@/types';
import { CampaignDeletionDialog } from '@/components/CampaignDeletionDialog';
import { CampaignSettingsNavigation } from '@/components/CampaignSettingsNavigation';
import { CampaignSettingsHeader } from '@/components/campaign-settings/CampaignSettingsHeader';
import { CampaignSettingsTabContent } from '@/components/campaign-settings/CampaignSettingsTabContent';
import { useCampaignSettingsDialog } from '@/hooks/useCampaignSettingsDialog';

interface IntegrationStatus {
  hasCodeIntegration: boolean;
  hasPluginIntegration: boolean;
  pluginConfigs: Array<{
    id: string;
    type: 'wordpress' | 'shopify';
    domain: string;
    active: boolean;
  }>;
  activeIntegrationType: 'code' | 'plugin';
}

interface CampaignSettingsDialogProps {
  campaign: Campaign;
}

export const CampaignSettingsDialog = ({ campaign }: CampaignSettingsDialogProps) => {
  const [integrationStatus, setIntegrationStatus] = useState<IntegrationStatus | undefined>();
  
  const {
    open,
    setOpen,
    loading,
    deletionDialogOpen,
    setDeletionDialogOpen,
    initialTargetUrl,
    activeTab,
    setActiveTab,
    formData,
    setFormData,
    handleSubmit,
    handleDeleteCampaign,
    handleDeleteClick,
    handlePaymentMethodChange,
  } = useCampaignSettingsDialog(campaign);

  const handleIntegrationStatusChange = (status: IntegrationStatus) => {
    setIntegrationStatus(status);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="border-slate-300 rounded-xl">
            <Settings className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="w-[calc(100vw-60px)] h-[calc(100vh-60px)] max-w-6xl max-h-[90vh] p-0 bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="flex h-full min-h-0">
            {/* MENU GAUCHE - TAILLE FIXE */}
            <div className="w-80 h-full flex-shrink-0 overflow-hidden">
              <CampaignSettingsNavigation 
                activeTab={activeTab} 
                onTabChange={setActiveTab} 
                onDeleteClick={handleDeleteClick}
              />
            </div>

            {/* CONTENU DROITE - FLEX */}
            <div className="flex-1 h-full flex flex-col min-w-0 overflow-hidden">
              <div className="flex-shrink-0">
                <CampaignSettingsHeader 
                  activeTab={activeTab} 
                  integrationStatus={integrationStatus}
                />
              </div>

              <div className="flex-1 overflow-auto min-w-0 w-full max-w-full">
                <div className="p-8 w-full max-w-full">
                  <div className="max-w-full overflow-hidden">
                    <CampaignSettingsTabContent
                      activeTab={activeTab}
                      campaign={campaign}
                      formData={formData}
                      initialTargetUrl={initialTargetUrl}
                      loading={loading}
                      onFormDataChange={setFormData}
                      onSubmit={handleSubmit}
                      onCancel={() => setOpen(false)}
                      onDeleteClick={handleDeleteClick}
                      onPaymentMethodChange={handlePaymentMethodChange}
                      onIntegrationStatusChange={handleIntegrationStatusChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <CampaignDeletionDialog
        campaign={campaign}
        open={deletionDialogOpen}
        onOpenChange={setDeletionDialogOpen}
        onConfirmDeletion={handleDeleteCampaign}
      />
    </>
  );
};
