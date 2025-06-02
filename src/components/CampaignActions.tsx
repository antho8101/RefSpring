
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
    navigate(`/advanced-stats/${campaign.id}`);
  };

  return (
    <div className="flex items-center space-x-2">
      <CreateAffiliateDialog campaignId={campaign.id} campaignName={campaign.name} />
      <Button
        variant="outline"
        size="sm"
        onClick={handleAdvancedStats}
        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
      >
        <BarChart3 className="h-4 w-4 mr-1" />
        Stats avancées
      </Button>
      <CampaignSettingsDialog campaign={campaign} />
    </div>
  );
};
