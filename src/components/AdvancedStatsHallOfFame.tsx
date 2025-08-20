
import { Crown, Star, TrendingUp } from 'lucide-react';

interface TopPerformingAffiliate {
  name: string;
  conversionRate: number;
}

interface AdvancedStatsHallOfFameProps {
  topPerformingAffiliate: TopPerformingAffiliate;
  topPerformerRevenue: number;
}

export const AdvancedStatsHallOfFame = ({ 
  topPerformingAffiliate, 
  topPerformerRevenue 
}: AdvancedStatsHallOfFameProps) => {
  return (
    <div className="xl:col-span-1">
      <div className="bg-white rounded-xl p-6 border border-slate-200 h-full">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Crown className="h-6 w-6 text-yellow-600 mr-2" />
            <h3 className="text-lg font-semibold text-slate-900">Top Performer</h3>
          </div>

          <div className="mb-4">
            <div className="text-xl font-bold text-slate-900 mb-1 break-words">
              {topPerformingAffiliate.name}
            </div>
            <div className="text-sm text-slate-600">
              🏆 Meilleur affilié
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {topPerformingAffiliate.conversionRate.toFixed(1)}%
              </div>
              <div className="text-xs text-slate-600">
                Taux de conversion
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <div className="text-xl font-bold text-emerald-600 mb-1">
                {new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: 'EUR',
                  minimumFractionDigits: 0,
                }).format(topPerformerRevenue)}
              </div>
              <div className="text-xs text-slate-600">
                CA rapporté
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
