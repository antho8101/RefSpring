
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { TrendingUp, Calendar, ExternalLink, Copy, HelpCircle } from 'lucide-react';
import { Campaign } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface CampaignInfoCardsProps {
  campaign: Campaign;
}

export const CampaignInfoCards = ({ campaign }: CampaignInfoCardsProps) => {
  const { toast } = useToast();

  // Génération de l'URL selon l'environnement
  const getPublicDashboardUrl = () => {
    const currentHostname = window.location.hostname;
    
    // En développement local ou prévisualisation Lovable
    if (currentHostname.includes('localhost') || currentHostname.includes('lovableproject.com')) {
      return `${window.location.origin}/r/${campaign.id}`;
    }
    
    // En production - toujours pointer vers refspring.com
    return `https://refspring.com/r/${campaign.id}`;
  };

  const publicDashboardUrl = getPublicDashboardUrl();

  const handleCopyUrl = async () => {
    try {
      // Méthode moderne avec navigator.clipboard
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(publicDashboardUrl);
        toast({
          title: "Lien copié !",
          description: "Le lien du dashboard public a été copié dans le presse-papiers",
        });
        return;
      }

      // Méthode de fallback pour navigateurs plus anciens ou contextes non-sécurisés
      const textArea = document.createElement('textarea');
      textArea.value = publicDashboardUrl;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (successful) {
        toast({
          title: "Lien copié !",
          description: "Le lien du dashboard public a été copié dans le presse-papiers",
        });
      } else {
        throw new Error('Fallback copy failed');
      }
    } catch (error) {
      console.error('Copy failed:', error);
      toast({
        title: "Copie impossible",
        description: "Sélectionnez et copiez le lien manuellement avec Ctrl+C",
        variant: "destructive",
      });
    }
  };

  const handleOpenDashboard = () => {
    window.open(publicDashboardUrl, '_blank');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-blue-50/50 p-4 rounded-xl">
        <div className="flex items-center gap-2 text-blue-600 mb-2">
          <TrendingUp className="h-4 w-4" />
          <span className="text-sm font-medium">URL Cible</span>
        </div>
        <p className="font-mono text-xs text-slate-600 truncate bg-white/70 px-2 py-1 rounded">
          {campaign.targetUrl}
        </p>
      </div>
      
      <div className="bg-purple-50/50 p-4 rounded-xl">
        <div className="flex items-center gap-2 text-purple-600 mb-2">
          <Calendar className="h-4 w-4" />
          <span className="text-sm font-medium">Créée le</span>
        </div>
        <p className="text-sm font-semibold text-slate-900">
          {new Date(campaign.createdAt).toLocaleDateString('fr-FR')}
        </p>
      </div>

      <div className="bg-blue-50/50 p-4 rounded-xl">
        <div className="flex items-center gap-2 text-blue-600 mb-2">
          <ExternalLink className="h-4 w-4" />
          <span className="text-sm font-medium">Dashboard public</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-3 w-3 text-blue-500/70 cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Partagez ce lien avec vos affiliés pour qu'ils puissent consulter leurs statistiques et accéder à leurs liens de tracking.</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="space-y-2">
          <Input 
            value={publicDashboardUrl}
            readOnly 
            className="font-mono text-xs bg-white/80 border-blue-200/60 focus:border-blue-300 text-slate-700"
          />
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleCopyUrl}
              className="border-blue-300/60 text-blue-700 hover:bg-blue-100/50 hover:border-blue-400 transition-all"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleOpenDashboard}
              className="border-blue-300/60 text-blue-700 hover:bg-blue-100/50 hover:border-blue-400 transition-all"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
