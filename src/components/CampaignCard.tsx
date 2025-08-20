
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
import { Users, ChevronDown, ChevronRight } from 'lucide-react';
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
  const [isExpanded, setIsExpanded] = useState(true);
  const { toast } = useToast();
  const { generateTrackingLink } = useTrackingLinkGenerator();

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

  return (
    <Card className="bg-white rounded-xl border border-slate-200 min-w-0 overflow-hidden">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className="py-4 cursor-pointer min-w-0">
            <div className="flex items-center justify-between min-w-0">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {isExpanded ? 
                  <ChevronDown className="h-5 w-5 text-slate-500 flex-shrink-0" /> : 
                  <ChevronRight className="h-5 w-5 text-slate-500 flex-shrink-0" />
                }
                <div className="flex-1 min-w-0">
                  <CardTitle className="flex items-center gap-2 text-lg min-w-0">
                    <div className="flex items-center gap-2 min-w-0 flex-wrap">
                      <span className="truncate">{campaign.name}</span>
                       <Badge 
                         variant={campaign.isActive ? "default" : "secondary"}
                         className={`${campaign.isActive 
                           ? "bg-green-500 text-white border-0" 
                           : "bg-slate-200 text-slate-600"
                         } text-xs px-2 py-0.5 flex-shrink-0`}
                       >
                         {campaign.isActive ? "Active" : "En pause"}
                       </Badge>
                    </div>
                  </CardTitle>
                  <CardDescription className="text-slate-600 mt-1 text-sm leading-relaxed line-clamp-2">
                    {campaign.description}
                  </CardDescription>
                  <div className="text-xs text-slate-500 mt-1">
                    Créée le {new Date(campaign.createdAt).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              </div>
              <div className="ml-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                <CampaignActions campaign={campaign} onCopyUrl={onCopyUrl} />
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0 min-w-0">
            <CampaignStats campaign={campaign} affiliatesCount={affiliates.length} />

            {/* Section des affiliés */}
            <Collapsible open={isAffiliatesOpen} onOpenChange={setIsAffiliatesOpen}>
              <CollapsibleTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="w-full flex items-center justify-between p-2 hover:bg-slate-100/50 rounded-xl mt-3 min-w-0"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Users className="h-4 w-4 flex-shrink-0" />
                    <span className="font-medium text-sm truncate">Affiliés ({affiliates.length})</span>
                  </div>
                  {isAffiliatesOpen ? 
                    <ChevronDown className="h-4 w-4 flex-shrink-0" /> : 
                    <ChevronRight className="h-4 w-4 flex-shrink-0" />
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
