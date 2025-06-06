
import React from 'react';
import { CampaignCard } from './CampaignCard';
import { useCampaigns } from '@/hooks/useCampaigns';
import { Skeleton } from './ui/skeleton';
import { useTranslation } from 'react-i18next';
import { CreateCampaignDialog } from './CreateCampaignDialog';
import { Button } from './ui/button';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const CampaignsList = () => {
  const { campaigns, loading } = useCampaigns();
  const { t } = useTranslation();
  const { toast } = useToast();
  
  // Handle copy URL function
  const handleCopyUrl = (id: string) => {
    // Copy campaign URL functionality
    navigator.clipboard.writeText(`${window.location.origin}/campaign/${id}`);
    toast({
      title: "URL copied",
      description: "Campaign URL has been copied to clipboard"
    });
  };
  
  // Show loading state
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white/50 backdrop-blur-sm rounded-xl border border-slate-200/70 shadow-sm p-5">
            <Skeleton className="h-8 w-3/4 mb-4" />
            <Skeleton className="h-4 w-1/2 mb-2" />
            <div className="flex gap-2 mt-4">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!campaigns || campaigns.length === 0) {
    return (
      <div className="bg-white/50 backdrop-blur-sm rounded-xl border border-slate-200/70 shadow-sm p-6 text-center">
        <h3 className="text-lg font-semibold text-slate-800 mb-2">{t('dashboard.noCampaigns')}</h3>
        <p className="text-slate-500 mb-6">{t('dashboard.createFirstCampaign')}</p>
        
        <CreateCampaignDialog />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-slate-800">{t('dashboard.yourCampaigns')}</h2>
        <CreateCampaignDialog />
      </div>
      
      <div className="space-y-4">
        {campaigns.map((campaign) => (
          <CampaignCard key={campaign.id} campaign={campaign} onCopyUrl={handleCopyUrl} />
        ))}
      </div>

      <CreateCampaignDialog />
    </div>
  );
};
