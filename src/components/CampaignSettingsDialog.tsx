import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useToast } from '@/hooks/use-toast';
import { Campaign } from '@/types';
import { CampaignDeletionDialog } from '@/components/CampaignDeletionDialog';
import { AffiliatesManagementTable } from '@/components/AffiliatesManagementTable';
import { CampaignSettingsNavigation } from '@/components/CampaignSettingsNavigation';
import { CampaignGeneralSettings } from '@/components/CampaignGeneralSettings';
import { CampaignPaymentSettings } from '@/components/CampaignPaymentSettings';
import { CampaignIntegrationSettings } from '@/components/CampaignIntegrationSettings';
import { CreateAffiliateDialog } from '@/components/CreateAffiliateDialog';

interface CampaignSettingsDialogProps {
  campaign: Campaign;
}

export const CampaignSettingsDialog = ({ campaign }: CampaignSettingsDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deletionDialogOpen, setDeletionDialogOpen] = useState(false);
  const [initialTargetUrl, setInitialTargetUrl] = useState(campaign.targetUrl || '');
  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState({
    name: campaign.name,
    description: campaign.description || '',
    targetUrl: campaign.targetUrl || '',
    isActive: campaign.isActive,
    defaultCommissionRate: campaign.defaultCommissionRate,
  });

  const { updateCampaign, deleteCampaign } = useCampaigns();
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      const targetUrl = campaign.targetUrl || '';
      setInitialTargetUrl(targetUrl);
      setFormData({
        name: campaign.name,
        description: campaign.description || '',
        targetUrl,
        isActive: campaign.isActive,
        defaultCommissionRate: campaign.defaultCommissionRate,
      });
    }
  }, [open, campaign]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateCampaign(campaign.id, formData);
      toast({
        title: "Campagne mise à jour",
        description: "Les modifications ont été enregistrées avec succès.",
      });
      setOpen(false);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour la campagne",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCampaign = async () => {
    try {
      await deleteCampaign(campaign.id);
      console.log('✅ Campagne supprimée avec succès:', campaign.id);
    } catch (error) {
      console.error('❌ Erreur suppression campagne:', error);
      throw error;
    }
  };

  const handleDeleteClick = () => {
    setOpen(false);
    setDeletionDialogOpen(true);
  };

  const handlePaymentMethodChange = () => {
    toast({
      title: "Fonctionnalité en développement",
      description: "Le changement de méthode de paiement sera bientôt disponible.",
    });
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'general':
        return 'Paramètres généraux';
      case 'integration':
        return 'Intégration';
      case 'payment':
        return 'Méthode de paiement';
      case 'affiliates':
        return 'Gestion des affiliés';
      default:
        return 'Paramètres';
    }
  };

  const getTabDescription = () => {
    switch (activeTab) {
      case 'general':
        return 'Configurez les informations de base de votre campagne';
      case 'integration':
        return 'Scripts à intégrer sur votre site marchand';
      case 'payment':
        return 'Gérez votre méthode de paiement pour les commissions';
      case 'affiliates':
        return 'Gérez tous les affiliés de cette campagne';
      default:
        return '';
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <CampaignGeneralSettings
            campaign={campaign}
            formData={formData}
            initialTargetUrl={initialTargetUrl}
            loading={loading}
            onFormDataChange={setFormData}
            onSubmit={handleSubmit}
            onCancel={() => setOpen(false)}
            onDeleteClick={handleDeleteClick}
          />
        );
      case 'integration':
        return <CampaignIntegrationSettings campaign={campaign} />;
      case 'payment':
        return (
          <CampaignPaymentSettings
            campaign={campaign}
            onPaymentMethodChange={handlePaymentMethodChange}
          />
        );
      case 'affiliates':
        return (
          <div className="space-y-6">
            <div className="flex justify-end">
              <CreateAffiliateDialog campaignId={campaign.id} campaignName={campaign.name} />
            </div>
            <AffiliatesManagementTable campaignId={campaign.id} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="hover:scale-105 transition-all shadow-lg backdrop-blur-sm border-slate-300 rounded-2xl">
            <Settings className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="w-[calc(100vw-60px)] h-[calc(100vh-60px)] max-w-none max-h-none p-0 bg-white overflow-hidden">
          <div className="flex h-full">
            <CampaignSettingsNavigation 
              activeTab={activeTab} 
              onTabChange={setActiveTab} 
            />

            <div className="flex-1 flex flex-col">
              <div className="p-8 border-b bg-white">
                <h3 className="text-2xl font-semibold text-slate-900">{getTabTitle()}</h3>
                <p className="text-slate-600 mt-2">{getTabDescription()}</p>
              </div>

              <div className="flex-1 p-8 overflow-auto">
                {renderTabContent()}
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
