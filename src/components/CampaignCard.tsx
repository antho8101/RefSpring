
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useAffiliates } from '@/hooks/useAffiliates';
import { useToast } from '@/hooks/use-toast';
import { useTrackingLinkGenerator } from '@/hooks/useTrackingLinkGenerator';
import { Users, ChevronDown, ChevronRight, BarChart3 } from 'lucide-react';
import { useState } from 'react';
import { AffiliatesList } from '@/components/AffiliatesList';
import { CampaignActions } from '@/components/CampaignActions';
import { CampaignStats } from '@/components/CampaignStats';
import { CreateAffiliateDialog } from '@/components/CreateAffiliateDialog';
import { Campaign } from '@/types';
import { useNavigate } from 'react-router-dom';

interface CampaignCardProps {
  campaign: Campaign;
  onCopyUrl: (id: string) => void;
}

export const CampaignCard = ({ campaign, onCopyUrl }: CampaignCardProps) => {
  const { affiliates } = useAffiliates(campaign.id);
  const [isAffiliatesOpen, setIsAffiliatesOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const { toast } = useToast();
  const { generateTrackingLink } = useTrackingLinkGenerator();
  const navigate = useNavigate();

  // Fonction pour copier le lien de tracking d'un affilié - maintenant asynchrone
  const handleCopyTrackingLink = async (affiliateId: string) => {
    if (!campaign.targetUrl) {
      toast({
        title: "URL manquante",
        description: "Cette campagne n'a pas d'URL de destination configurée",
        variant: "destructive",
      });
      return;
    }

    try {
      toast({
        title: "Génération du lien...",
        description: "Création de votre lien court en cours",
      });

      const trackingLink = await generateTrackingLink(campaign.id, affiliateId, campaign.targetUrl);
      
      await navigator.clipboard.writeText(trackingLink);
      toast({
        title: "Lien de tracking copié !",
        description: "Le lien court a été copié dans le presse-papiers",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de copier le lien de tracking",
        variant: "destructive",
      });
    }
  };

  const handleAdvancedStats = () => {
    navigate(`/advanced-stats/${campaign.id}`);
  };

  return (
    <Card className="bg-gradient-to-br from-white to-slate-50/50 border-slate-200/50 shadow-md hover:shadow-lg transition-all backdrop-blur-sm group">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-3 cursor-pointer hover:bg-slate-50/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                {isExpanded ? 
                  <ChevronDown className="h-5 w-5 text-slate-500" /> : 
                  <ChevronRight className="h-5 w-5 text-slate-500" />
                }
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="flex items-center gap-2">
                      {campaign.name}
                      <Badge 
                        variant={campaign.isActive ? "default" : "secondary"}
                        className={campaign.isActive 
                          ? "bg-gradient-to-r from-green-500 to-green-600 text-white border-0 text-xs px-2 py-0.5" 
                          : "bg-slate-200 text-slate-600 text-xs px-2 py-0.5"
                        }
                      >
                        {campaign.isActive ? "Active" : "En pause"}
                      </Badge>
                    </div>
                  </CardTitle>
                  {isExpanded && (
                    <CardDescription className="text-slate-600 mt-1 text-sm leading-relaxed line-clamp-2">
                      {campaign.description}
                    </CardDescription>
                  )}
                </div>
              </div>
              <div className="ml-4 flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
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
                <CampaignActions campaign={campaign} onCopyUrl={onCopyUrl} />
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0">
            <CampaignStats campaign={campaign} affiliatesCount={affiliates.length} />

            {/* Section des affiliés */}
            <Collapsible open={isAffiliatesOpen} onOpenChange={setIsAffiliatesOpen}>
              <CollapsibleTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="w-full flex items-center justify-between p-2 hover:bg-slate-100/50 rounded-lg mt-3"
                >
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span className="font-medium text-sm">Affiliés ({affiliates.length})</span>
                  </div>
                  {isAffiliatesOpen ? 
                    <ChevronDown className="h-4 w-4" /> : 
                    <ChevronRight className="h-4 w-4" />
                  }
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <AffiliatesList 
                  campaignId={campaign.id}
                  onCopyTrackingLink={handleCopyTrackingLink}
                />
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
