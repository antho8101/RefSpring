
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useAffiliates } from '@/hooks/useAffiliates';
import { useToast } from '@/hooks/use-toast';
import { Users, ChevronDown, ChevronRight, Copy, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { AffiliatesList } from '@/components/AffiliatesList';
import { CampaignActions } from '@/components/CampaignActions';
import { CampaignStats } from '@/components/CampaignStats';
import { Campaign } from '@/types';

interface CampaignCardProps {
  campaign: Campaign;
  onCopyUrl: (id: string) => void;
}

export const CampaignCard = ({ campaign, onCopyUrl }: CampaignCardProps) => {
  const { affiliates } = useAffiliates(campaign.id);
  const [isAffiliatesOpen, setIsAffiliatesOpen] = useState(false);
  const { toast } = useToast();
  
  const publicDashboardUrl = `${window.location.origin}/r/${campaign.id}`;

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
    <Card className="bg-gradient-to-br from-white to-slate-50/50 border-slate-200/50 shadow-xl hover:shadow-2xl transition-all hover:scale-[1.02] backdrop-blur-sm group">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="flex items-center gap-2">
                {campaign.name}
                <Badge 
                  variant={campaign.isActive ? "default" : "secondary"}
                  className={campaign.isActive 
                    ? "bg-gradient-to-r from-green-500 to-green-600 text-white border-0" 
                    : "bg-slate-200 text-slate-600"
                  }
                >
                  {campaign.isActive ? "Active" : "En pause"}
                </Badge>
              </div>
            </CardTitle>
            <CardDescription className="text-slate-600 mt-2 leading-relaxed">
              {campaign.description}
            </CardDescription>
          </div>
          <CampaignActions campaign={campaign} onCopyUrl={onCopyUrl} />
        </div>

        {/* Dashboard public - Section repositionnée */}
        <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/40 border border-blue-200/60 rounded-xl p-4 space-y-3 shadow-sm mt-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100/70 rounded-lg">
              <ExternalLink className="h-4 w-4 text-blue-600" />
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
          
          <div className="space-y-2">
            <Input 
              value={publicDashboardUrl}
              readOnly 
              className="font-mono text-xs bg-white/80 border-blue-200/60 focus:border-blue-300 text-slate-700"
            />
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
      </CardHeader>
      <CardContent>
        <CampaignStats campaign={campaign} affiliatesCount={affiliates.length} />

        {/* Section des affiliés */}
        <Collapsible open={isAffiliatesOpen} onOpenChange={setIsAffiliatesOpen}>
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              className="w-full flex items-center justify-between p-3 hover:bg-slate-100/50 rounded-lg"
            >
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="font-medium">Affiliés de cette campagne ({affiliates.length})</span>
              </div>
              {isAffiliatesOpen ? 
                <ChevronDown className="h-4 w-4" /> : 
                <ChevronRight className="h-4 w-4" />
              }
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4">
            <AffiliatesList campaignId={campaign.id} />
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};
