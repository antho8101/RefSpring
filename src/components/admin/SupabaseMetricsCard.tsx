import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database, RefreshCw, TrendingUp, Users, MousePointer, DollarSign } from 'lucide-react';
import { SupabaseMetrics } from '@/hooks/useSupabaseMonitoring';

interface SupabaseMetricsCardProps {
  metrics: SupabaseMetrics;
  isLoading: boolean;
  onRefresh: () => void;
}

export const SupabaseMetricsCard = ({ metrics, isLoading, onRefresh }: SupabaseMetricsCardProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fr-FR').format(num);
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-green-600" />
          <CardTitle className="text-lg font-semibold">
            Monitoring Supabase
          </CardTitle>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
          className="h-8 w-8 p-0"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardDescription className="px-6 pb-4">
        Métriques en temps réel de votre base de données Supabase
      </CardDescription>

      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Campagnes */}
          <div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg">
            <TrendingUp className="h-8 w-8 text-blue-600 mb-2" />
            <div className="text-2xl font-bold text-blue-900">
              {formatNumber(metrics.totalCampaigns)}
            </div>
            <div className="text-sm text-blue-700">Campagnes</div>
          </div>

          {/* Affiliés */}
          <div className="flex flex-col items-center p-4 bg-purple-50 rounded-lg">
            <Users className="h-8 w-8 text-purple-600 mb-2" />
            <div className="text-2xl font-bold text-purple-900">
              {formatNumber(metrics.totalAffiliates)}
            </div>
            <div className="text-sm text-purple-700">Affiliés</div>
          </div>

          {/* Clics */}
          <div className="flex flex-col items-center p-4 bg-orange-50 rounded-lg">
            <MousePointer className="h-8 w-8 text-orange-600 mb-2" />
            <div className="text-2xl font-bold text-orange-900">
              {formatNumber(metrics.totalClicks)}
            </div>
            <div className="text-sm text-orange-700">Clics</div>
          </div>

          {/* Revenus */}
          <div className="flex flex-col items-center p-4 bg-green-50 rounded-lg">
            <DollarSign className="h-8 w-8 text-green-600 mb-2" />
            <div className="text-2xl font-bold text-green-900">
              {formatCurrency(metrics.totalRevenue)}
            </div>
            <div className="text-sm text-green-700">Revenus</div>
          </div>
        </div>

        {/* Métriques techniques */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
          <div className="text-center">
            <div className="text-lg font-semibold">{metrics.avgResponseTime}ms</div>
            <div className="text-sm text-gray-600">Temps de réponse</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold">{metrics.activeUsers}</div>
            <div className="text-sm text-gray-600">Utilisateurs actifs</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold">{formatNumber(metrics.totalConversions)}</div>
            <div className="text-sm text-gray-600">Conversions</div>
          </div>
        </div>

        {/* Erreurs récentes */}
        {metrics.recentErrors.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Erreurs récentes</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {metrics.recentErrors.slice(0, 3).map((error, index) => (
                <div key={index} className="flex items-center gap-2 text-xs">
                  <div className={`w-2 h-2 rounded-full ${
                    error.severity === 'critical' ? 'bg-red-500' : 'bg-orange-500'
                  }`} />
                  <span className="truncate flex-1">{error.message}</span>
                  <span className="text-gray-500">
                    {error.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};