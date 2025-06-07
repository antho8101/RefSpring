
import { Globe } from 'lucide-react';
import { StatsPeriod } from '@/hooks/useStatsFilters';

interface AdvancedStatsNoDataMessageProps {
  period: StatsPeriod;
}

export const AdvancedStatsNoDataMessage = ({ period }: AdvancedStatsNoDataMessageProps) => {
  return (
    <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="p-3 bg-blue-100 rounded-full w-fit">
          <Globe className="h-6 w-6 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Aucune donnée disponible</h3>
          <p className="text-blue-700">
            {period === 'current-month' 
              ? "Aucune activité détectée ce mois-ci. Les statistiques apparaîtront dès que vos affiliés génèreront du trafic."
              : "Cette campagne n'a pas encore généré de clics ou de conversions. Les statistiques apparaîtront dès que vos affiliés commenceront à générer du trafic."
            }
          </p>
        </div>
      </div>
    </div>
  );
};
