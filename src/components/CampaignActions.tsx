
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
        className="bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border-2 border-blue-300 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 rounded-xl justify-center transition-all duration-300 relative overflow-hidden group"
      >
        <BarChart3 className="h-4 w-4 mr-1 group-hover:scale-110 transition-transform duration-300" />
        <span className="font-medium">Stats avancées</span>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-100/20 to-purple-100/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
      </Button>
      <CampaignSettingsDialog campaign={campaign} />
    </div>
  );
};
