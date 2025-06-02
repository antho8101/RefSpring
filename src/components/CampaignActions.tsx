
import { Button } from '@/components/ui/button';
import { CreateAffiliateDialog } from '@/components/CreateAffiliateDialog';
import { CampaignSettingsDialog } from '@/components/CampaignSettingsDialog';
import { Campaign } from '@/types';

interface CampaignActionsProps {
  campaign: Campaign;
  onCopyUrl: (id: string) => void;
}

export const CampaignActions = ({ campaign, onCopyUrl }: CampaignActionsProps) => {
  return (
    <div className="flex items-center space-x-2">
      <CreateAffiliateDialog campaignId={campaign.id} campaignName={campaign.name} />
      <CampaignSettingsDialog campaign={campaign} />
    </div>
  );
};
