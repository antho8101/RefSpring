
import { Card } from '@/components/ui/card';
import { TrendingUp, Users, Calendar } from 'lucide-react';
import { Campaign } from '@/types';

interface CampaignStatsProps {
  campaign: Campaign;
  affiliatesCount: number;
}

export const CampaignStats = ({ campaign, affiliatesCount }: CampaignStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div className="bg-blue-50/50 p-4 rounded-xl">
        <div className="flex items-center gap-2 text-blue-600 mb-2">
          <TrendingUp className="h-4 w-4" />
          <span className="text-sm font-medium">URL Cible</span>
        </div>
        <p className="font-mono text-xs text-slate-600 truncate bg-white/70 px-2 py-1 rounded">
          {campaign.targetUrl}
        </p>
      </div>
      
      <div className="bg-green-50/50 p-4 rounded-xl">
        <div className="flex items-center gap-2 text-green-600 mb-2">
          <Users className="h-4 w-4" />
          <span className="text-sm font-medium">Affiliés</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-slate-900">{affiliatesCount}</span>
          <span className="text-xs text-slate-500">actifs</span>
        </div>
      </div>
      
      <div className="bg-purple-50/50 p-4 rounded-xl">
        <div className="flex items-center gap-2 text-purple-600 mb-2">
          <Calendar className="h-4 w-4" />
          <span className="text-sm font-medium">Créée le</span>
        </div>
        <p className="text-sm font-semibold text-slate-900">
          {new Date(campaign.createdAt).toLocaleDateString('fr-FR')}
        </p>
      </div>
    </div>
  );
};
