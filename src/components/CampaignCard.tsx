
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useAffiliates } from '@/hooks/useAffiliates';
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
