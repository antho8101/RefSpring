
import { Users, MousePointer, DollarSign, Percent } from 'lucide-react';

interface CampaignMetricsCardsProps {
  stats: {
    affiliatesCount: number;
    totalClicks: number;
    totalConversions: number;
    conversionRate: number;
    netRevenue: number;
    totalCommissions: number;
  };
  loading: boolean;
}

export const CampaignMetricsCards = ({ stats, loading }: CampaignMetricsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      <div className="bg-green-50/50 p-4 rounded-xl">
        <div className="flex items-center gap-2 text-green-600 mb-2">
          <Users className="h-4 w-4" />
          <span className="text-sm font-medium">Affiliés</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-slate-900">
            {loading ? '...' : stats.affiliatesCount}
          </span>
          <span className="text-xs text-slate-500">actifs</span>
        </div>
      </div>

      <div className="bg-blue-50/50 p-4 rounded-xl">
        <div className="flex items-center gap-2 text-blue-600 mb-2">
          <MousePointer className="h-4 w-4" />
          <span className="text-sm font-medium">Total Clics</span>
        </div>
        <div className="text-2xl font-bold text-slate-900">
          {loading ? '...' : stats.totalClicks}
        </div>
      </div>

      <div className="bg-orange-50/50 p-4 rounded-xl">
        <div className="flex items-center gap-2 text-orange-600 mb-2">
          <DollarSign className="h-4 w-4" />
          <span className="text-sm font-medium">Total Paiements</span>
        </div>
        <div className="text-2xl font-bold text-slate-900">
          {loading ? '...' : stats.totalConversions}
        </div>
      </div>

      <div className="bg-purple-50/50 p-4 rounded-xl">
        <div className="flex items-center gap-2 text-purple-600 mb-2">
          <Percent className="h-4 w-4" />
          <span className="text-sm font-medium">Taux Conversion</span>
        </div>
        <div className="text-2xl font-bold text-slate-900">
          {loading ? '...' : `${stats.conversionRate.toFixed(1)}%`}
        </div>
      </div>

      <div className="bg-emerald-50/50 p-4 rounded-xl">
        <div className="flex items-center gap-2 text-emerald-600 mb-2">
          <DollarSign className="h-4 w-4" />
          <span className="text-sm font-medium">Total CA Généré</span>
        </div>
        <div className="text-lg font-bold text-slate-900 mb-1">
          {loading ? '...' : `${stats.netRevenue.toFixed(2)}€`}
        </div>
        <p className="text-xs text-slate-500">
          {loading ? 'Calcul...' : 
            stats.totalCommissions === 0 ? 'Aucune commission' : 
            `après ${stats.totalCommissions.toFixed(2)}€ de commissions`
          }
        </p>
      </div>
    </div>
  );
};
