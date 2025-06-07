
import { DollarSign } from 'lucide-react';

interface FinanceStats {
  totalRevenue: number;
  conversionRate: number;
}

interface AdvancedStatsFinanceCardProps {
  stats: FinanceStats;
}

export const AdvancedStatsFinanceCard = ({ stats }: AdvancedStatsFinanceCardProps) => {
  return (
    <div className="xl:col-span-1">
      <div className="bg-gradient-to-br from-emerald-50/50 via-white to-green-50/30 rounded-2xl p-6 shadow-lg border border-white/50 h-full">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-emerald-600" />
          Finance
        </h3>
        <div className="space-y-4">
          <div className="bg-white/60 rounded-lg p-4">
            <div className="text-xl font-bold text-emerald-600 mb-1">
              {new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'EUR',
                minimumFractionDigits: 0,
              }).format(stats.totalRevenue)}
            </div>
            <p className="text-sm text-slate-600">CA Total</p>
          </div>
          <div className="bg-white/60 rounded-lg p-4">
            <div className="text-xl font-bold text-purple-600 mb-1">
              {stats.conversionRate.toFixed(1)}%
            </div>
            <p className="text-sm text-slate-600">Taux de conversion</p>
          </div>
        </div>
      </div>
    </div>
  );
};
