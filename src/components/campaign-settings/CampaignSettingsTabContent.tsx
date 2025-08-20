
import { Campaign } from '@/types';
import { CampaignGeneralSettings } from '@/components/CampaignGeneralSettings';
import { CampaignIntegrationSettings } from '@/components/CampaignIntegrationSettings';
import { CampaignPaymentSettings } from '@/components/CampaignPaymentSettings';
import { AffiliatesManagementTable } from '@/components/AffiliatesManagementTable';
import { CreateAffiliateDialog } from '@/components/CreateAffiliateDialog';

interface CampaignSettingsTabContentProps {
  activeTab: string;
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
  onPaymentMethodChange: () => void;
}

export const CampaignSettingsTabContent = ({
  activeTab,
  campaign,
  formData,
  initialTargetUrl,
  loading,
  onFormDataChange,
  onSubmit,
  onCancel,
  onDeleteClick,
  onPaymentMethodChange,
}: CampaignSettingsTabContentProps) => {
  switch (activeTab) {
    case 'general':
      return (
        <CampaignGeneralSettings
          campaign={campaign}
          formData={formData}
          initialTargetUrl={initialTargetUrl}
          loading={loading}
          onFormDataChange={onFormDataChange}
          onSubmit={onSubmit}
          onCancel={onCancel}
          onDeleteClick={onDeleteClick}
        />
      );
    case 'integration':
      return <CampaignIntegrationSettings campaign={campaign} />;
    case 'payment':
      return (
        <CampaignPaymentSettings
          campaign={campaign}
          onPaymentMethodChange={onPaymentMethodChange}
        />
      );
    case 'affiliates':
      return (
        <div className="space-y-6 max-w-full overflow-hidden">
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
