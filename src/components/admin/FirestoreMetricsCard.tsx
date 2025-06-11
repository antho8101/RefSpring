
import { Database, Zap, AlertTriangle, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { FirestoreMetrics } from '@/hooks/useFirestoreMonitoring';

interface FirestoreMetricsCardProps {
  metrics: FirestoreMetrics;
  isLoading: boolean;
  onRefresh: () => void;
}

export const FirestoreMetricsCard = ({ metrics, isLoading, onRefresh }: FirestoreMetricsCardProps) => {
  const getQuotaColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-blue-600" />
          Monitoring Firestore
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-gray-500">
              Dernière mise à jour: {metrics.lastUpdate.toLocaleTimeString('fr-FR')}
            </p>
          </div>
          <Button
            onClick={onRefresh}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Database className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Collecte...' : 'Actualiser'}
          </Button>
        </div>

        {/* Métriques principales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Performance</span>
            </div>
            <div className="text-2xl font-bold text-blue-900">{metrics.avgQueryTime}ms</div>
            <p className="text-xs text-blue-600">Temps moyen</p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Lectures</span>
            </div>
            <div className="text-2xl font-bold text-green-900">{metrics.totalReads.toLocaleString()}</div>
            <p className="text-xs text-green-600">Total session</p>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Database className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">Écritures</span>
            </div>
            <div className="text-2xl font-bold text-purple-900">{metrics.totalWrites.toLocaleString()}</div>
            <p className="text-xs text-purple-600">Total session</p>
          </div>
        </div>

        {/* Quotas Firestore */}
        <div className="space-y-4 mb-6">
          <h4 className="font-medium text-gray-900">Utilisation des Quotas Quotidiens</h4>
          
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Lectures ({metrics.quotaUsage.reads.used.toLocaleString()} / {metrics.quotaUsage.reads.limit.toLocaleString()})</span>
                <span className={getQuotaColor(metrics.quotaUsage.reads.percentage)}>
                  {metrics.quotaUsage.reads.percentage.toFixed(1)}%
                </span>
              </div>
              <Progress value={metrics.quotaUsage.reads.percentage} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Écritures ({metrics.quotaUsage.writes.used.toLocaleString()} / {metrics.quotaUsage.writes.limit.toLocaleString()})</span>
                <span className={getQuotaColor(metrics.quotaUsage.writes.percentage)}>
                  {metrics.quotaUsage.writes.percentage.toFixed(1)}%
                </span>
              </div>
              <Progress value={metrics.quotaUsage.writes.percentage} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Stockage ({metrics.quotaUsage.storage.used} MB / {metrics.quotaUsage.storage.limit} MB)</span>
                <span className={getQuotaColor(metrics.quotaUsage.storage.percentage)}>
                  {metrics.quotaUsage.storage.percentage.toFixed(1)}%
                </span>
              </div>
              <Progress value={metrics.quotaUsage.storage.percentage} className="h-2" />
            </div>
          </div>
        </div>

        {/* Requêtes lentes */}
        {metrics.slowQueries.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              Requêtes Lentes (&gt;2s)
            </h4>
            <div className="space-y-2">
              {metrics.slowQueries.map((query, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-yellow-50 rounded text-sm">
                  <span className="font-medium">{query.collection}</span>
                  <div className="text-right">
                    <span className="text-yellow-700 font-semibold">{query.queryTime}ms</span>
                    <p className="text-xs text-yellow-600">
                      {query.timestamp.toLocaleTimeString('fr-FR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
