
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Calendar, TrendingUp } from 'lucide-react';
import { StatsPeriod } from '@/hooks/useStatsFilters';

interface StatsPeriodToggleProps {
  period: StatsPeriod;
  onPeriodChange: (period: StatsPeriod) => void;
}

export const StatsPeriodToggle = ({ period, onPeriodChange }: StatsPeriodToggleProps) => {
  return (
    <ToggleGroup
      type="single" 
      value={period}
      onValueChange={(value) => value && onPeriodChange(value as StatsPeriod)}
      className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-full p-0.5 shadow-sm"
    >
      <ToggleGroupItem 
        value="current-month" 
        className="rounded-full px-2.5 py-1 text-xs font-medium data-[state=on]:bg-blue-100 data-[state=on]:text-blue-700 hover:bg-slate-50 transition-all"
      >
        <Calendar className="h-3 w-3 mr-1" />
        Mois
      </ToggleGroupItem>
      <ToggleGroupItem 
        value="all-time" 
        className="rounded-full px-2.5 py-1 text-xs font-medium data-[state=on]:bg-blue-100 data-[state=on]:text-blue-700 hover:bg-slate-50 transition-all"
      >
        <TrendingUp className="h-3 w-3 mr-1" />
        Total
      </ToggleGroupItem>
    </ToggleGroup>
  );
};
