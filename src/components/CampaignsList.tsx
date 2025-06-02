
import { Card, CardContent } from '@/components/ui/card';
import { useCampaigns } from '@/hooks/useCampaigns';
import { Eye, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CampaignCard } from '@/components/CampaignCard';

export const CampaignsList = () => {
  const { campaigns, loading } = useCampaigns();
  const { toast } = useToast();

  console.log('CampaignsList render - campaigns:', campaigns, 'loading:', loading);

  const copyTrackingUrl = (campaignId: string) => {
    const trackingUrl = `https://refspring.com/r/${campaignId}`;
    navigator.clipboard.writeText(trackingUrl);
    toast({
      title: "URL de tracking copiée",
      description: "Partagez cette URL avec vos affiliés pour qu'ils puissent tracker leurs conversions",
    });
  };

  if (loading) {
    console.log('CampaignsList: showing loading state');
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse bg-gradient-to-br from-white to-slate-50/50 border-slate-200/50 shadow-lg">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (campaigns.length === 0) {
    console.log('CampaignsList: showing empty state');
    return (
      <Card className="bg-gradient-to-br from-white to-slate-50/50 border-slate-200/50 shadow-xl backdrop-blur-sm">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="p-4 bg-blue-100 rounded-full mb-6">
            <Eye className="h-12 w-12 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-3">Aucune campagne</h3>
          <p className="text-slate-600 text-center max-w-md leading-relaxed">
            Créez votre première campagne pour commencer à gérer vos affiliés et générer des revenus.
          </p>
          <div className="mt-6 flex items-center gap-2 text-sm text-slate-500">
            <TrendingUp className="h-4 w-4" />
            <span>Prêt à transformer votre business</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  console.log('CampaignsList: rendering campaigns list');
  return (
    <div className="space-y-6">
      {campaigns.map((campaign, index) => (
        <div 
          key={campaign.id} 
          className="animate-fade-in" 
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <CampaignCard campaign={campaign} onCopyUrl={copyTrackingUrl} />
        </div>
      ))}
    </div>
  );
};
