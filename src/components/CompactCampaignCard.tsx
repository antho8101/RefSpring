
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useAffiliates } from '@/hooks/useAffiliates';
import { useCampaignStats } from '@/hooks/useCampaignStats';
import { ChevronDown, ChevronRight, Users, MousePointer, DollarSign } from 'lucide-react';
import { useState } from 'react';
import { CampaignStats } from '@/components/CampaignStats';
import { AffiliatesList } from '@/components/AffiliatesList';
import { CampaignActions } from '@/components/CampaignActions';
import { Campaign } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useTrackingLinkGenerator } from '@/hooks/useTrackingLinkGenerator';

interface CompactCampaignCardProps {
  campaign: Campaign;
  onCopyUrl: (id: string) => void;
}

export const CompactCampaignCard = ({ campaign, onCopyUrl }: CompactCampaignCardProps) => {
  const { affiliates } = useAffiliates(campaign.id);
  const { stats, loading } = useCampaignStats(campaign.id);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAffiliatesOpen, setIsAffiliatesOpen] = useState(false);
  const { toast } = useToast();
  const { generateTrackingLink } = useTrackingLinkGenerator();

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

  return (
    <Card className="bg-gradient-to-br from-white to-slate-50/50 border-slate-200/50 shadow-md hover:shadow-lg transition-all backdrop-blur-sm">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-slate-50/50 transition-colors pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                {isExpanded ? 
                  <ChevronDown className="h-4 w-4 text-slate-500" /> : 
                  <ChevronRight className="h-4 w-4 text-slate-500" />
                }
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-3 text-lg">
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
                </div>
                
                {/* Statistiques compactes */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-green-600">
                    <Users className="h-3 w-3" />
                    <span className="font-medium">{affiliates.length}</span>
                  </div>
                  <div className="flex items-center gap-1 text-blue-600">
                    <MousePointer className="h-3 w-3" />
                    <span className="font-medium">{loading ? '...' : stats.totalClicks}</span>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-600">
                    <DollarSign className="h-3 w-3" />
                    <span className="font-medium">{loading ? '...' : `${stats.netRevenue.toFixed(0)}€`}</span>
                  </div>
                </div>
              </div>
              
              <div className="ml-4" onClick={(e) => e.stopPropagation()}>
                <CampaignActions campaign={campaign} onCopyUrl={onCopyUrl} />
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0">
            {/* Description */}
            <div className="mb-4 text-slate-600 text-sm bg-slate-50/50 p-3 rounded-lg">
              {campaign.description}
            </div>

            {/* Statistiques détaillées */}
            <CampaignStats campaign={campaign} affiliatesCount={affiliates.length} />

            {/* Section des affiliés */}
            <Collapsible open={isAffiliatesOpen} onOpenChange={setIsAffiliatesOpen}>
              <CollapsibleTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="w-full flex items-center justify-between p-3 hover:bg-slate-100/50 rounded-lg mt-4"
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
