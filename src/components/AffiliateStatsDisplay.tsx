
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Users, TrendingUp } from 'lucide-react';

interface AffiliateStats {
  clicks: number;
  conversions: number;
  commissions: number;
}

interface AffiliateStatsDisplayProps {
  stats: AffiliateStats;
  loading: boolean;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(value);
};

export const AffiliateStatsDisplay = ({ stats, loading }: AffiliateStatsDisplayProps) => {
  const conversionRate = stats.clicks > 0 ? ((stats.conversions / stats.clicks) * 100) : 0;

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Clics Total</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">
              {loading ? '...' : stats.clicks.toLocaleString()}
            </div>
            <p className="text-xs text-blue-600">
              Visiteurs uniques tracés
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Conversions</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {loading ? '...' : stats.conversions.toLocaleString()}
            </div>
            <p className="text-xs text-green-600">
              Taux: {loading ? '...' : `${conversionRate.toFixed(1)}%`}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">Commissions</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">
              {loading ? '...' : formatCurrency(stats.commissions)}
            </div>
            <p className="text-xs text-purple-600">
              Gains générés
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Message informatif si pas de données */}
      {!loading && stats.clicks === 0 && stats.conversions === 0 && (
        <Card className="mb-8">
          <CardContent className="py-8">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune donnée disponible</h3>
              <p className="text-gray-600">
                Commencez à générer du trafic pour voir vos statistiques apparaître ici.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Placeholder pour futurs graphiques */}
      {!loading && (stats.clicks > 0 || stats.conversions > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Évolution des performances</CardTitle>
            <CardDescription>
              Aperçu de vos données d'affiliation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Résumé des performances</h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>• {stats.clicks} clic{stats.clicks > 1 ? 's' : ''} généré{stats.clicks > 1 ? 's' : ''}</p>
                  <p>• {stats.conversions} conversion{stats.conversions > 1 ? 's' : ''} réalisée{stats.conversions > 1 ? 's' : ''}</p>
                  <p>• {formatCurrency(stats.commissions)} de commissions gagnées</p>
                  <p>• Taux de conversion: {conversionRate.toFixed(1)}%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};
