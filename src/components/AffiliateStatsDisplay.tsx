
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

export const AffiliateStatsDisplay = ({ stats, loading }: AffiliateStatsDisplayProps) => {
  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clics Total</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : stats.clicks}
            </div>
            <p className="text-xs text-muted-foreground">
              Visiteurs uniques tracés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : stats.conversions}
            </div>
            <p className="text-xs text-muted-foreground">
              Taux de conversion: {stats.clicks ? ((stats.conversions / stats.clicks) * 100).toFixed(1) : 0}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commissions</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : `${stats.commissions}€`}
            </div>
            <p className="text-xs text-muted-foreground">
              En attente de validation
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Placeholder pour futurs graphiques */}
      <Card>
        <CardHeader>
          <CardTitle>Évolution des performances</CardTitle>
          <CardDescription>
            Graphiques et données détaillées
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Les graphiques détaillés seront disponibles prochainement</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
