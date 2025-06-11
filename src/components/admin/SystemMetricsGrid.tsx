
import { Zap, Database, Server, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SystemStats {
  totalCollections: number;
  totalDocuments: number;
  averageResponseTime: number;
  healthyServices: number;
  totalServices: number;
  lastUpdateTime: Date;
}

interface SystemMetricsGridProps {
  systemStats: SystemStats;
}

export const SystemMetricsGrid = ({ systemStats }: SystemMetricsGridProps) => {
  const getServiceAvailability = () => {
    if (systemStats.totalServices === 0) return 100;
    return ((systemStats.healthyServices / systemStats.totalServices) * 100).toFixed(1);
  };

  const formatUptime = (lastUpdate: Date) => {
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60));
    if (diffMinutes < 60) return `${diffMinutes}m`;
    const diffHours = Math.floor(diffMinutes / 60);
    return `${diffHours}h ${diffMinutes % 60}m`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Temps de Réponse</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{systemStats.averageResponseTime}ms</div>
          <p className="text-xs text-muted-foreground">
            Moyenne des services actifs
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Base de Données</CardTitle>
          <Database className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{systemStats.totalDocuments}</div>
          <p className="text-xs text-muted-foreground">
            Documents totaux ({systemStats.totalCollections} collections)
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Disponibilité</CardTitle>
          <Server className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{getServiceAvailability()}%</div>
          <p className="text-xs text-muted-foreground">
            {systemStats.healthyServices}/{systemStats.totalServices} services
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Dernière MàJ</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatUptime(systemStats.lastUpdateTime)}</div>
          <p className="text-xs text-muted-foreground">
            Il y a
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
