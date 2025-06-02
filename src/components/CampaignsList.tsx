
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useAffiliates } from '@/hooks/useAffiliates';
import { Settings, Users, Eye, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const CampaignsList = () => {
  const { campaigns, loading } = useCampaigns();
  const { toast } = useToast();

  const copyTrackingUrl = (campaignId: string) => {
    const trackingUrl = `https://refspring.com/r/${campaignId}`;
    navigator.clipboard.writeText(trackingUrl);
    toast({
      title: "URL copiée",
      description: "L'URL de tracking a été copiée dans le presse-papiers",
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Eye className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Aucune campagne</h3>
          <p className="text-muted-foreground text-center">
            Créez votre première campagne pour commencer à gérer vos affiliés.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {campaigns.map((campaign) => (
        <CampaignCard key={campaign.id} campaign={campaign} onCopyUrl={copyTrackingUrl} />
      ))}
    </div>
  );
};

interface CampaignCardProps {
  campaign: any;
  onCopyUrl: (id: string) => void;
}

const CampaignCard = ({ campaign, onCopyUrl }: CampaignCardProps) => {
  const { affiliates } = useAffiliates(campaign.id);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {campaign.name}
              <Badge variant={campaign.isActive ? "default" : "secondary"}>
                {campaign.isActive ? "Active" : "Inactive"}
              </Badge>
            </CardTitle>
            <CardDescription>{campaign.description}</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => onCopyUrl(campaign.id)}>
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">URL:</span>
            <p className="font-mono text-xs truncate">{campaign.targetUrl}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Affiliés:</span>
            <p className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {affiliates.length}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Créée le:</span>
            <p>{new Date(campaign.createdAt).toLocaleDateString('fr-FR')}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
