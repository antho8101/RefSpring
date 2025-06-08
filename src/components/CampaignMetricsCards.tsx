
import { Users, MousePointer, DollarSign, Percent } from 'lucide-react';
import { useCurrencyConverter } from '@/hooks/useCurrencyConverter';

interface CampaignMetricsCardsProps {
  stats: {
    affiliatesCount: number;
    totalClicks: number;
    totalConversions: number;
    conversionRate: number;
    netRevenue: number;
    totalCost: number;
  };
  loading: boolean;
}

export const CampaignMetricsCards = ({ stats, loading }: CampaignMetricsCardsProps) => {
  const { convertAndFormat, convertAndFormatCompact } = useCurrencyConverter();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-gradient-to-br from-green-50/20 to-green-100/10 p-4 rounded-xl border border-green-100/20">
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

      <div className="bg-gradient-to-br from-blue-50/20 to-blue-100/10 p-4 rounded-xl border border-blue-100/20">
        <div className="flex items-center gap-2 text-blue-600 mb-2">
          <MousePointer className="h-4 w-4" />
          <span className="text-sm font-medium">Total Clics</span>
        </div>
        <div className="text-2xl font-bold text-slate-900">
          {loading ? '...' : stats.totalClicks}
        </div>
      </div>

      <div className="bg-gradient-to-br from-orange-50/20 to-orange-100/10 p-4 rounded-xl border border-orange-100/20">
        <div className="flex items-center gap-2 text-orange-600 mb-2">
          <DollarSign className="h-4 w-4" />
          <span className="text-sm font-medium">Total Paiements</span>
        </div>
        <div className="text-2xl font-bold text-slate-900">
          {loading ? '...' : stats.totalConversions}
        </div>
        <p className="text-xs text-slate-500 mt-1">validés</p>
      </div>

      <div className="bg-gradient-to-br from-emerald-50/20 to-emerald-100/10 p-4 rounded-xl border border-emerald-100/20">
        <div className="flex items-center gap-2 text-emerald-600 mb-2">
          <DollarSign className="h-4 w-4" />
          <span className="text-sm font-medium">CA Généré</span>
        </div>
        <div className="text-lg font-bold text-slate-900 mb-1">
          {loading ? '...' : convertAndFormatCompact(stats.netRevenue)}
        </div>
        <p className="text-xs text-slate-500">
          {loading ? 'Calcul...' : 'chiffre d\'affaires'}
        </p>
      </div>
    </div>
  );
};
