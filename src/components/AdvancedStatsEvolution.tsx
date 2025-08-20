
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface EvolutionMetric {
  label: string;
  current: number;
  previous: number;
  format: 'number' | 'currency' | 'percentage';
}

interface AdvancedStatsEvolutionProps {
  evolution: {
    clicks: EvolutionMetric;
    conversions: EvolutionMetric;
    revenue: EvolutionMetric;
    conversionRate: EvolutionMetric;
  };
}

const formatValue = (value: number, format: 'number' | 'currency' | 'percentage') => {
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
      }).format(value);
    case 'percentage':
      return `${value.toFixed(1)}%`;
    default:
      return value.toLocaleString();
  }
};

const calculateChange = (current: number, previous: number) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

const EvolutionCard = ({ metric }: { metric: EvolutionMetric }) => {
  const change = calculateChange(metric.current, metric.previous);
  const isPositive = change > 0;
  const isNeutral = change === 0;

  return (
    <Card className="bg-white border-slate-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-700">{metric.label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-slate-900">
              {formatValue(metric.current, metric.format)}
            </div>
            <div className="text-xs text-slate-500">
              vs {formatValue(metric.previous, metric.format)} précédent
            </div>
          </div>
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            isNeutral 
              ? 'bg-slate-100 text-slate-600'
              : isPositive 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
          }`}>
            {isNeutral ? (
              <Minus className="h-3 w-3" />
            ) : isPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {Math.abs(change).toFixed(1)}%
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const AdvancedStatsEvolution = ({ evolution }: AdvancedStatsEvolutionProps) => {
  return (
    <div className="mb-6 sm:mb-8">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Évolution des performances</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <EvolutionCard metric={evolution.clicks} />
        <EvolutionCard metric={evolution.conversions} />
        <EvolutionCard metric={evolution.revenue} />
        <EvolutionCard metric={evolution.conversionRate} />
      </div>
    </div>
  );
};
