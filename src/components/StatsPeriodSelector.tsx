
import { Calendar, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatsPeriod } from '@/hooks/useStatsFilters';

interface StatsPeriodSelectorProps {
  period: StatsPeriod;
  onPeriodChange: (period: StatsPeriod) => void;
  className?: string;
}

export const StatsPeriodSelector = ({ period, onPeriodChange, className }: StatsPeriodSelectorProps) => {
  return (
    <div className={`flex gap-2 ${className}`}>
      <Button
        variant={period === 'all-time' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onPeriodChange('all-time')}
        className="flex items-center gap-2"
      >
        <TrendingUp className="h-4 w-4" />
        Depuis le début
      </Button>
      <Button
        variant={period === 'current-month' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onPeriodChange('current-month')}
        className="flex items-center gap-2"
      >
        <Calendar className="h-4 w-4" />
        Ce mois-ci
      </Button>
    </div>
  );
};
