
import { MousePointer, Target, DollarSign, Percent } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AdvancedStatsMetricsProps {
  stats: {
    totalClicks: number;
    totalConversions: number;
    totalRevenue: number;
    conversionRate: number;
    netRevenue: number;
    totalCommissions: number;
    averageCPA: number;
    averageROAS: number;
  };
  loading: boolean;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(value);
};

export const AdvancedStatsMetrics = ({ stats, loading }: AdvancedStatsMetricsProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6 mb-6 sm:mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-white border-slate-200 shadow-sm">
            <CardHeader>
              <div className="h-4 bg-slate-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-slate-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <>
      {/* Métriques principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6 mb-6 sm:mb-8">
        <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Clics totaux</CardTitle>
            <div className="p-2 bg-blue-100 rounded-full">
              <MousePointer className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">
              {stats.totalClicks.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500">Total des clics générés</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Conversions</CardTitle>
            <div className="p-2 bg-green-100 rounded-full">
              <Target className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">{stats.totalConversions}</div>
            <p className="text-xs text-slate-500">Actions réalisées</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">CA Total</CardTitle>
            <div className="p-2 bg-purple-100 rounded-full">
              <DollarSign className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-600 mb-1">
              {formatCurrency(stats.totalRevenue)}
            </div>
            <p className="text-xs text-slate-500">Chiffre d'affaires brut</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Taux de conversion</CardTitle>
            <div className="p-2 bg-orange-100 rounded-full">
              <Percent className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">
              {stats.conversionRate.toFixed(2)}%
            </div>
            <p className="text-xs text-slate-500">Performance globale</p>
          </CardContent>
        </Card>
      </div>

      {/* Métriques additionnelles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">CA Net</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-green-600">
              {formatCurrency(stats.netRevenue)}
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Après {formatCurrency(stats.totalCommissions)} de commissions
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">CPA Moyen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-blue-600">
              {formatCurrency(stats.averageCPA)}
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Coût par acquisition
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">ROAS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-purple-600">
              {stats.averageROAS.toFixed(1)}x
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Retour sur investissement publicitaire
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
};
