
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
    <div className="space-y-6">
      {/* Actions principales */}
      <div className="flex items-center space-x-2">
        <CreateAffiliateDialog campaignId={campaign.id} campaignName={campaign.name} />
        <CampaignSettingsDialog campaign={campaign} />
      </div>

      {/* Dashboard public - Section intégrée */}
      <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/40 border border-blue-200/60 rounded-xl p-5 space-y-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100/70 rounded-lg">
            <ExternalLink className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-blue-900 mb-1">
              Dashboard public pour vos affiliés
            </h4>
            <p className="text-xs text-blue-700/80 leading-relaxed">
              Partagez ce lien avec vos affiliés pour qu'ils puissent consulter leurs statistiques et générer leurs liens de tracking.
            </p>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Input 
              value={publicDashboardUrl}
              readOnly 
              className="font-mono text-xs bg-white/80 border-blue-200/60 focus:border-blue-300 text-slate-700"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCopyUrl}
              className="flex-1 border-blue-300/60 text-blue-700 hover:bg-blue-100/50 hover:border-blue-400 transition-all"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copier le lien
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleOpenDashboard}
              className="flex-1 border-blue-300/60 text-blue-700 hover:bg-blue-100/50 hover:border-blue-400 transition-all"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Ouvrir
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
