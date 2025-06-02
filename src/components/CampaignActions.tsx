
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
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
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => onCopyUrl(campaign.id)}
        title="Copier l'URL de tracking pour vos affiliés"
        className="hover:scale-105 transition-all shadow-lg backdrop-blur-sm border-slate-300"
      >
        <Copy className="h-4 w-4" />
      </Button>
      
      <CampaignSettingsDialog campaign={campaign} />
    </div>
  );
};
