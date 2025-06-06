
import React from 'react';
import { CampaignCard } from './CampaignCard';
import { useCampaigns } from '@/hooks/useCampaigns';
import { Skeleton } from './ui/skeleton';
import { useTranslation } from 'react-i18next';
import { CreateCampaignDialog } from './CreateCampaignDialog';
import { Button } from './ui/button';
import { Plus } from 'lucide-react';

export const CampaignsList = () => {
  const { campaigns, loading } = useCampaigns();
  const { t } = useTranslation();
  
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
        
        <CreateCampaignDialog>
          <Button className="mx-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            <Plus className="mr-2 h-4 w-4" />
            {t('dashboard.createCampaign')}
          </Button>
        </CreateCampaignDialog>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-slate-800">{t('dashboard.yourCampaigns')}</h2>
        <CreateCampaignDialog>
          <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            <Plus className="mr-1 h-4 w-4" />
            {t('dashboard.new')}
          </Button>
        </CreateCampaignDialog>
      </div>
      
      <div className="space-y-4">
        {campaigns.map((campaign) => (
          <CampaignCard key={campaign.id} campaign={campaign} />
        ))}
      </div>

      <Button 
        className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
      >
        <Plus className="mr-2 h-4 w-4" />
        {t('dashboard.createFirstCampaign')}
      </Button>
    </div>
  );
};
