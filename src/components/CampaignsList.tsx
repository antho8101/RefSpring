
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useCampaigns } from '@/hooks/useCampaigns';
import { Eye, TrendingUp, LayoutGrid, List, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CampaignCard } from '@/components/CampaignCard';
import { CompactCampaignCard } from '@/components/CompactCampaignCard';
import { useState, useCallback, memo } from 'react';
import { CreateCampaignDialog } from '@/components/CreateCampaignDialog';

interface CampaignsListProps {
  onSuccessModalTrigger: (campaignId: string, campaignName: string) => void;
}

export const CampaignsList = memo(({ onSuccessModalTrigger }: CampaignsListProps) => {
  const { campaigns, loading } = useCampaigns();
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<'normal' | 'compact'>('normal');

  console.log('CampaignsList render - campaigns:', campaigns, 'loading:', loading);

  const copyTrackingUrl = useCallback((campaignId: string) => {
    const trackingUrl = `https://refspring.com/r/${campaignId}`;
    navigator.clipboard.writeText(trackingUrl);
    toast({
      title: "URL de tracking copiée",
      description: "Partagez cette URL avec vos affiliés pour qu'ils puissent tracker leurs conversions",
    });
  }, [toast]);

  const handleViewModeChange = useCallback((value: string | undefined) => {
    if (value) setViewMode(value as 'normal' | 'compact');
  }, []);

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
          <div className="mt-6">
            <CreateCampaignDialog onSuccessModalTrigger={onSuccessModalTrigger}>
              <Button 
                size="lg" 
                className="text-base lg:text-lg px-6 py-3 lg:px-8 lg:py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 border-0 text-white group relative overflow-hidden" 
                style={{
                  boxShadow: '0 10px 40px rgba(59, 130, 246, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.filter = 'drop-shadow(0 0 25px rgba(59, 130, 246, 0.6))';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.filter = 'none';
                }}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <Plus className="h-4 w-4 mr-2 relative z-10" />
                <span className="relative z-10">Lancer ma première campagne</span>
              </Button>
            </CreateCampaignDialog>
          </div>
        </CardContent>
      </Card>
    );
  }

  console.log('CampaignsList: rendering campaigns list');
  return (
    <div className="space-y-6">
      {/* Sélecteur de mode d'affichage */}
      {campaigns.length > 3 && (
        <div className="flex justify-end">
          <ToggleGroup 
            type="single" 
            value={viewMode} 
            onValueChange={handleViewModeChange}
            className="bg-white border border-slate-200 rounded-lg p-1"
          >
            <ToggleGroupItem value="normal" aria-label="Vue normale" className="data-[state=on]:bg-blue-100 data-[state=on]:text-blue-700">
              <LayoutGrid className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="compact" aria-label="Vue compacte" className="data-[state=on]:bg-blue-100 data-[state=on]:text-blue-700">
              <List className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      )}

      {/* Liste des campagnes */}
      <div className="space-y-4">
        {campaigns.map((campaign, index) => (
          <div 
            key={campaign.id} 
            className="animate-fade-in" 
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {viewMode === 'compact' ? (
              <CompactCampaignCard campaign={campaign} onCopyUrl={copyTrackingUrl} />
            ) : (
              <CampaignCard campaign={campaign} onCopyUrl={copyTrackingUrl} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
});

CampaignsList.displayName = 'CampaignsList';
