
import { Database, Shield, Zap, AlertTriangle, CheckCircle, Clock, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ProductionDBMetrics } from '@/hooks/useProductionDBMonitoring';

interface ProductionDBCardProps {
  metrics: ProductionDBMetrics;
  isLoading: boolean;
  onRefresh: () => void;
}

export const ProductionDBCard = ({ metrics, isLoading, onRefresh }: ProductionDBCardProps) => {
  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-600';
      case 'degraded': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getHealthBgColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'bg-green-50';
      case 'degraded': return 'bg-yellow-50';
      case 'critical': return 'bg-red-50';
      default: return 'bg-gray-50';
    }
  };

  const getEfficiencyColor = (efficiency: string) => {
    switch (efficiency) {
      case 'optimal': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'needs-optimization': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-purple-600" />
          Base de Données Production
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
            {isLoading ? 'Analyse...' : 'Analyser'}
          </Button>
        </div>

        {/* Status général de la réplication */}
        <div className={`p-4 rounded-lg mb-6 ${getHealthBgColor(metrics.replication.overallHealth)}`}>
          <div className="flex items-center gap-2 mb-2">
            <Globe className="h-5 w-5 text-purple-600" />
            <h3 className="font-semibold">Réplication Multi-Région</h3>
            <span className={`ml-auto px-2 py-1 rounded-full text-xs font-medium ${getHealthColor(metrics.replication.overallHealth)}`}>
              {metrics.replication.overallHealth === 'healthy' ? 'Saine' : 
               metrics.replication.overallHealth === 'degraded' ? 'Dégradée' : 'Critique'}
            </span>
          </div>
          <p className="text-sm text-gray-600">
            Région principale: {metrics.replication.primaryRegion} • 
            Latence moyenne: {metrics.replication.averageLatency}ms
          </p>
        </div>

        {/* Métriques principales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Backups</span>
            </div>
            <div className="text-2xl font-bold text-green-900">{metrics.backups.successRate.toFixed(1)}%</div>
            <p className="text-xs text-green-600">Taux de réussite</p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Index</span>
            </div>
            <div className="text-2xl font-bold text-blue-900">{metrics.indexes.optimizedIndexes}/{metrics.indexes.totalIndexes}</div>
            <p className="text-xs text-blue-600">Optimisés</p>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">Performance</span>
            </div>
            <div className="text-2xl font-bold text-purple-900">{metrics.indexes.averageQueryTime}ms</div>
            <p className="text-xs text-purple-600">Temps moyen requête</p>
          </div>
        </div>

        {/* Statut des régions de réplication */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Régions de Réplication</h4>
          <div className="space-y-3">
            {metrics.replication.replicaRegions.map((region, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    region.status === 'active' ? 'bg-green-500' : 
                    region.status === 'syncing' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <div>
                    <p className="font-medium text-sm">{region.region}</p>
                    <p className="text-xs text-gray-500">
                      Latence: {region.latency}ms • Consistance: {region.dataConsistency}%
                    </p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  region.status === 'active' ? 'bg-green-100 text-green-700' :
                  region.status === 'syncing' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                }`}>
                  {region.status === 'active' ? 'Actif' : 
                   region.status === 'syncing' ? 'Sync' : 'Erreur'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Backups récents */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Backups Récents</h4>
          <div className="space-y-2">
            {metrics.backups.recentBackups.slice(0, 3).map((backup, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                <div className="flex items-center gap-3">
                  {backup.status === 'completed' ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : backup.status === 'failed' ? (
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  ) : (
                    <Clock className="h-4 w-4 text-yellow-600" />
                  )}
                  <div>
                    <p className="text-sm font-medium">{backup.region}</p>
                    <p className="text-xs text-gray-500">
                      {backup.timestamp.toLocaleString('fr-FR')} • {backup.size}
                    </p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  backup.status === 'completed' ? 'bg-green-100 text-green-700' :
                  backup.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {backup.status === 'completed' ? 'Terminé' : 
                   backup.status === 'failed' ? 'Échec' : 'En cours'}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Prochain backup:</strong> {metrics.backups.nextScheduled.toLocaleString('fr-FR')}
            </p>
          </div>
        </div>

        {/* Index nécessitant une optimisation */}
        {metrics.indexes.needsOptimization.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              Index à Optimiser
            </h4>
            <div className="space-y-2">
              {metrics.indexes.needsOptimization.map((index, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-yellow-50 rounded text-sm">
                  <div>
                    <span className="font-medium">{index.collection}</span>
                    <p className="text-xs text-yellow-600">{index.indexName}</p>
                  </div>
                  <div className="text-right">
                    <span className={`font-semibold ${getEfficiencyColor(index.efficiency)}`}>
                      {index.queryTime}ms
                    </span>
                    <p className="text-xs text-yellow-600">
                      {index.usageCount} utilisations
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
