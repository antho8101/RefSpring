
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useCampaigns } from '@/hooks/useCampaigns';
import { Eye, TrendingUp, LayoutGrid, List, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CampaignCard } from '@/components/CampaignCard';
import { CompactCampaignCard } from '@/components/CompactCampaignCard';
import { useState, useCallback, memo } from 'react';
import { CreateCampaignDialogSimple } from '@/components/CreateCampaignDialogSimple';
import Logger from '@/utils/logger';

interface CampaignsListProps {
  onSuccessModalTrigger: (campaignId: string, campaignName: string) => void;
}

export const CampaignsList = memo(({ onSuccessModalTrigger }: CampaignsListProps) => {
  const { campaigns, loading } = useCampaigns();
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<'normal' | 'compact'>('normal');

  Logger.debug('CampaignsList render - campaigns:', campaigns.length, 'loading:', loading);

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
    Logger.debug('CampaignsList: showing loading state');
    return (
      <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="animate-pulse bg-gradient-to-br from-white to-slate-50 border-slate-200 rounded-2xl">
          <CardHeader>
            <div className="h-6 bg-slate-200 rounded-xl w-1/4"></div>
            <div className="h-4 bg-slate-200 rounded-xl w-1/2 mt-2"></div>
          </CardHeader>
          <CardContent>
            <div className="h-4 bg-slate-200 rounded-xl w-3/4"></div>
          </CardContent>
        </Card>
      ))}
      </div>
    );
  }

  if (campaigns.length === 0) {
    Logger.debug('CampaignsList: showing empty state');
    return (
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-slate-200 rounded-2xl">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="p-6 bg-blue-600 rounded-3xl mb-6">
            <Eye className="h-12 w-12 text-white" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-3">Aucune campagne</h3>
          <p className="text-slate-600 text-center max-w-md leading-relaxed">
            Créez votre première campagne pour commencer à gérer vos affiliés et générer des revenus.
          </p>
          <div className="mt-6">
            <CreateCampaignDialogSimple>
              <Button 
                size="lg" 
                className="text-base lg:text-lg px-6 py-3 lg:px-8 lg:py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:scale-[1.02] border-0 text-white group relative overflow-hidden" 
                onMouseEnter={(e) => {
                  e.currentTarget.style.filter = 'drop-shadow(0 0 15px rgba(59, 130, 246, 0.3))';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.filter = 'none';
                }}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <Plus className="h-4 w-4 mr-2 relative z-10" />
                <span className="relative z-10">Lancer ma première campagne</span>
              </Button>
            </CreateCampaignDialogSimple>
          </div>
        </CardContent>
      </Card>
    );
  }

  Logger.debug('CampaignsList: rendering campaigns list');
  return (
    <div className="space-y-6">
      {/* Sélecteur de mode d'affichage */}
      {campaigns.length > 3 && (
        <div className="flex justify-end">
          <ToggleGroup 
            type="single" 
            value={viewMode} 
            onValueChange={handleViewModeChange}
            className="bg-white border border-slate-200 rounded-xl p-1"
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
