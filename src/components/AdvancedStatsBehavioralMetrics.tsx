
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Target, DollarSign, Repeat, Crown, Star } from 'lucide-react';

interface BehavioralMetrics {
  averageOrderValue: number;
  topPerformingAffiliate: {
    name: string;
    conversionRate: number;
  };
  affiliateRetentionRate: number;
  revenueConcentration: number; // % du CA généré par le top 20% des affiliés
}

interface AdvancedStatsBehavioralMetricsProps {
  behavioralMetrics: BehavioralMetrics;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(value);
};

export const AdvancedStatsBehavioralMetrics = ({ behavioralMetrics }: AdvancedStatsBehavioralMetricsProps) => {
  return (
    <div className="mb-6 sm:mb-8">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Métriques comportementales</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        
        {/* Valeur moyenne des commandes */}
        <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Panier moyen</CardTitle>
            <div className="p-2 bg-green-100 rounded-full">
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">
              {formatCurrency(behavioralMetrics.averageOrderValue)}
            </div>
            <p className="text-xs text-slate-500">Par conversion</p>
          </CardContent>
        </Card>

        {/* Hall of Fame - Top Affilié */}
        <Card className="relative bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 border-none shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden">
          {/* Effet de brillance animé */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-pulse"></div>
          
          {/* Étoiles en arrière-plan */}
          <div className="absolute top-2 left-2">
            <Star className="h-3 w-3 text-yellow-200 fill-current animate-pulse" />
          </div>
          <div className="absolute top-4 right-4">
            <Star className="h-2 w-2 text-yellow-100 fill-current animate-pulse" style={{ animationDelay: '0.5s' }} />
          </div>
          <div className="absolute bottom-2 right-2">
            <Star className="h-3 w-3 text-yellow-200 fill-current animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
          
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-bold text-white drop-shadow-md">🏆 HALL OF FAME</CardTitle>
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-full shadow-lg">
              <Crown className="h-4 w-4 text-white drop-shadow-md" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-lg font-black text-white mb-1 truncate drop-shadow-md">
              {behavioralMetrics.topPerformingAffiliate.name}
            </div>
            <div className="flex items-center gap-1">
              <div className="text-xs font-bold text-white/90 bg-white/20 px-2 py-1 rounded-full backdrop-blur-sm">
                {behavioralMetrics.topPerformingAffiliate.conversionRate.toFixed(1)}% de conversion
              </div>
            </div>
          </CardContent>
          
          {/* Effet glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-400/50 via-yellow-500/50 to-orange-500/50 blur-xl -z-10"></div>
        </Card>

        {/* Taux de rétention des affiliés */}
        <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Rétention Affiliés</CardTitle>
            <div className="p-2 bg-purple-100 rounded-full">
              <Repeat className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">
              {behavioralMetrics.affiliateRetentionRate.toFixed(1)}%
            </div>
            <p className="text-xs text-slate-500">Affiliés actifs ce mois</p>
          </CardContent>
        </Card>

        {/* Concentration du CA */}
        <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Concentration CA</CardTitle>
            <div className="p-2 bg-orange-100 rounded-full">
              <Users className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">
              {behavioralMetrics.revenueConcentration.toFixed(1)}%
            </div>
            <p className="text-xs text-slate-500">Du CA par top 20%</p>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};
