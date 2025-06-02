
import { CreateCampaignDialog } from '@/components/CreateCampaignDialog';
import { CampaignsList } from '@/components/CampaignsList';

export const DashboardContent = () => {
  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">Mes Campagnes</h2>
          <p className="text-slate-600 text-sm sm:text-base">Gérez vos campagnes d'affiliation en temps réel</p>
        </div>
        <div className="flex-shrink-0">
          <CreateCampaignDialog />
        </div>
      </div>
      
      <div className="relative">
        <CampaignsList />
      </div>
    </div>
  );
};
