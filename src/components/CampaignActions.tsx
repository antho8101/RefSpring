
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
        className="relative overflow-hidden bg-gradient-to-r from-blue-50 via-white to-purple-50 text-blue-700 border-2 border-blue-200/70 hover:border-blue-300 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 before:absolute before:inset-0 before:bg-gradient-to-r before:from-blue-100/20 before:via-transparent before:to-purple-100/20 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300 after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white/10 after:to-transparent after:opacity-0 hover:after:opacity-100 after:transition-opacity after:duration-500"
        style={{
          boxShadow: '0 0 20px rgba(59, 130, 246, 0.1), 0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        }}
      >
        <BarChart3 className="h-4 w-4 mr-1 relative z-10" />
        <span className="relative z-10 font-medium">Stats avancées</span>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/5 via-purple-400/5 to-blue-400/5 opacity-0 hover:opacity-100 transition-opacity duration-300" />
      </Button>
      <CampaignSettingsDialog campaign={campaign} />
    </div>
  );
};
