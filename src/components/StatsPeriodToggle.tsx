
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
      className="bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-[10px] p-0.5 shadow-sm scale-75"
    >
      <ToggleGroupItem 
        value="current-month" 
        className="rounded-[10px] px-2 py-0.5 text-xs font-medium data-[state=on]:bg-blue-100 data-[state=on]:text-blue-700 hover:bg-slate-50 transition-all"
      >
        <Calendar className="h-2.5 w-2.5 mr-1" />
        Mois
      </ToggleGroupItem>
      <ToggleGroupItem 
        value="all-time" 
        className="rounded-[10px] px-2 py-0.5 text-xs font-medium data-[state=on]:bg-blue-100 data-[state=on]:text-blue-700 hover:bg-slate-50 transition-all"
      >
        <TrendingUp className="h-2.5 w-2.5 mr-1" />
        Total
      </ToggleGroupItem>
    </ToggleGroup>
  );
};
