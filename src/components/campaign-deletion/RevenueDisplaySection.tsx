
import { DollarSign } from 'lucide-react';
import { PaymentDistribution } from '@/services/stripeConnectService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface RevenueDisplaySectionProps {
  distribution: PaymentDistribution;
  lastPaymentDate: Date;
}

export const RevenueDisplaySection = ({ distribution, lastPaymentDate }: RevenueDisplaySectionProps) => {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
      <h4 className="font-medium text-slate-900 mb-2 flex items-center gap-2">
        <DollarSign className="h-4 w-4" />
        Chiffre d'affaires depuis le dernier paiement
      </h4>
      <p className="text-2xl font-bold text-slate-900">{distribution.totalRevenue.toFixed(2)}€</p>
      <p className="text-sm text-slate-600 mt-1">
        Généré entre le {format(lastPaymentDate, 'dd MMMM', { locale: fr })} et aujourd'hui
      </p>
    </div>
  );
};
