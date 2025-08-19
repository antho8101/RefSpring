
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { Campaign } from '@/types';
import { CampaignDeletionDialog } from '@/components/CampaignDeletionDialog';
import { CampaignSettingsNavigation } from '@/components/CampaignSettingsNavigation';
import { CampaignSettingsHeader } from '@/components/campaign-settings/CampaignSettingsHeader';
import { CampaignSettingsTabContent } from '@/components/campaign-settings/CampaignSettingsTabContent';
import { useCampaignSettingsDialog } from '@/hooks/useCampaignSettingsDialog';

interface CampaignSettingsDialogProps {
  campaign: Campaign;
}

export const CampaignSettingsDialog = ({ campaign }: CampaignSettingsDialogProps) => {
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

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="hover:scale-105 transition-all shadow-lg backdrop-blur-sm border-slate-300 rounded-2xl">
            <Settings className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="w-[calc(100vw-60px)] h-[calc(100vh-60px)] max-w-6xl max-h-[90vh] p-0 bg-white overflow-hidden">
          <div className="flex h-full">
            <CampaignSettingsNavigation 
              activeTab={activeTab} 
              onTabChange={setActiveTab} 
              onDeleteClick={handleDeleteClick}
            />

            <div className="flex-1 flex flex-col">
              <CampaignSettingsHeader activeTab={activeTab} />

              <div className="flex-1 p-8 overflow-auto">
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
                />
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
