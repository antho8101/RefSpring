
import { Zap, Users, DollarSign, Target, Award } from 'lucide-react';

interface AdditionalMetrics {
  activeAffiliates: number;
  avgCommissionPerAffiliate: number;
  profitMargin: number;
  avgRevenuePerClick: number;
}

interface AdvancedStatsAdditionalMetricsProps {
  metrics: AdditionalMetrics;
}

export const AdvancedStatsAdditionalMetrics = ({ metrics }: AdvancedStatsAdditionalMetricsProps) => {
  return (
    <div className="xl:col-span-1">
      <div className="bg-white rounded-xl p-6 border border-slate-200 h-full">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5 text-emerald-600" />
          Métriques Avancées
        </h3>
        <div className="space-y-4">
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="text-xl font-bold text-blue-600">{metrics.activeAffiliates}</span>
            </div>
            <p className="text-sm text-slate-600">Affiliés actifs</p>
          </div>

          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span className="text-lg font-bold text-green-600">
                {new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: 'EUR',
                  minimumFractionDigits: 0,
                }).format(metrics.avgCommissionPerAffiliate)}
              </span>
            </div>
            <p className="text-sm text-slate-600">Commission moy./affilié</p>
          </div>

          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Target className="h-5 w-5 text-purple-600" />
              <span className="text-xl font-bold text-purple-600">{metrics.profitMargin.toFixed(1)}%</span>
            </div>
            <p className="text-sm text-slate-600">Marge bénéficiaire</p>
          </div>

          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Award className="h-5 w-5 text-orange-600" />
              <span className="text-lg font-bold text-orange-600">
                {new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: 'EUR',
                  minimumFractionDigits: 2,
                }).format(metrics.avgRevenuePerClick)}
              </span>
            </div>
            <p className="text-sm text-slate-600">CA moyen/clic</p>
          </div>
        </div>
      </div>
    </div>
  );
};
