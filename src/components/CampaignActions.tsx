
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, ExternalLink } from 'lucide-react';
import { CreateAffiliateDialog } from '@/components/CreateAffiliateDialog';
import { CampaignSettingsDialog } from '@/components/CampaignSettingsDialog';
import { useToast } from '@/hooks/use-toast';
import { Campaign } from '@/types';

interface CampaignActionsProps {
  campaign: Campaign;
  onCopyUrl: (id: string) => void;
}

export const CampaignActions = ({ campaign, onCopyUrl }: CampaignActionsProps) => {
  const { toast } = useToast();
  const publicDashboardUrl = `${window.location.origin}/r/${campaign.id}`;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(publicDashboardUrl);
      toast({
        title: "Lien copié !",
        description: "Le lien du dashboard public a été copié dans le presse-papiers",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de copier le lien",
        variant: "destructive",
      });
    }
  };

  const handleOpenDashboard = () => {
    window.open(publicDashboardUrl, '_blank');
  };

  return (
    <div className="space-y-4">
      {/* Actions principales */}
      <div className="flex items-center space-x-2">
        <CreateAffiliateDialog campaignId={campaign.id} campaignName={campaign.name} />
        <CampaignSettingsDialog campaign={campaign} />
      </div>

      {/* Dashboard public */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-2">
          <ExternalLink className="h-4 w-4 text-blue-600" />
          <Label className="text-sm font-medium text-blue-900">
            Dashboard public pour les affiliés
          </Label>
        </div>
        <p className="text-xs text-blue-700">
          Partagez ce lien avec vos affiliés pour qu'ils puissent consulter leurs statistiques et générer leurs liens de tracking.
        </p>
        <div className="flex items-center gap-2">
          <Input 
            value={publicDashboardUrl}
            readOnly 
            className="font-mono text-xs bg-white border-blue-300"
          />
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCopyUrl}
            className="shrink-0 border-blue-300 text-blue-700 hover:bg-blue-100"
          >
            <Copy className="h-4 w-4 mr-1" />
            Copier
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleOpenDashboard}
            className="shrink-0 border-blue-300 text-blue-700 hover:bg-blue-100"
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            Ouvrir
          </Button>
        </div>
      </div>
    </div>
  );
};
