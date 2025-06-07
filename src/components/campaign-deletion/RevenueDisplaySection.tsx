
import { PaymentDistribution, LastPaymentInfo } from '@/services/stripeConnectService';
import { Calendar, TrendingUp, Info } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface RevenueDisplaySectionProps {
  distribution: PaymentDistribution;
  lastPaymentInfo: LastPaymentInfo;
}

export const RevenueDisplaySection = ({ distribution, lastPaymentInfo }: RevenueDisplaySectionProps) => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
        <TrendingUp className="h-4 w-4" />
        Revenus à facturer
      </h4>
      <div className="space-y-2">
        <div className="text-sm text-blue-700 flex items-center gap-1">
          {lastPaymentInfo.hasPayments ? (
            <>
              <Calendar className="h-4 w-4" />
              Période : depuis le {format(lastPaymentInfo.lastPaymentDate!, 'dd MMMM yyyy', { locale: fr })}
            </>
          ) : (
            <>
              <Info className="h-4 w-4" />
              Période : depuis la création de la campagne
            </>
          )}
        </div>
        <p className="text-blue-900 font-medium">
          CA généré : {distribution.totalRevenue.toFixed(2)}€
        </p>
      </div>
    </div>
  );
};
