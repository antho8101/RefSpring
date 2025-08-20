
import { Button } from '@/components/ui/button';
import { CreateAffiliateDialog } from '@/components/CreateAffiliateDialog';
import { CampaignSettingsDialog } from '@/components/CampaignSettingsDialog';
import { BarChart3 } from 'lucide-react';
import { Campaign } from '@/types';
import { useNavigate } from 'react-router-dom';

interface CampaignActionsProps {
  campaign: Campaign;
  onCopyUrl: (id: string) => void;
}

export const CampaignActions = ({ campaign, onCopyUrl }: CampaignActionsProps) => {
  const navigate = useNavigate();

  const handleAdvancedStats = () => {
    navigate(`/campaign/${campaign.id}`);
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:space-x-2 sm:gap-0">
      <CreateAffiliateDialog campaignId={campaign.id} campaignName={campaign.name} />
      <Button
        variant="outline"
        size="sm"
        onClick={handleAdvancedStats}
        className="bg-slate-50 text-slate-700 border border-slate-200 rounded-xl justify-center"
      >
        <BarChart3 className="h-4 w-4 mr-1" />
        <span className="font-medium">Stats avancées</span>
      </Button>
      <CampaignSettingsDialog campaign={campaign} />
    </div>
  );
};
