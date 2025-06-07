
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Target, DollarSign, Repeat } from 'lucide-react';

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
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        
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
