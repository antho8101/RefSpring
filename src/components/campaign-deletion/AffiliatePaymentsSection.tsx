
import { Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PaymentDistribution } from '@/services/stripeConnectService';

interface AffiliatePaymentsSectionProps {
  distribution: PaymentDistribution;
}

export const AffiliatePaymentsSection = ({ distribution }: AffiliatePaymentsSectionProps) => {
  if (distribution.affiliatePayments.length === 0) return null;

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
      <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
        <Users className="h-4 w-4" />
        Détail des paiements aux affiliés
      </h4>
      <div className="space-y-2 max-h-32 overflow-y-auto">
        {distribution.affiliatePayments.map((payment) => (
          <div key={payment.affiliateId} className="flex items-center justify-between py-2 px-3 bg-white rounded border">
            <div>
              <p className="text-sm font-medium text-slate-900">{payment.affiliateName}</p>
              <p className="text-xs text-slate-500">{payment.conversionsCount} conversions</p>
            </div>
            <Badge variant="secondary" className="font-semibold">
              {payment.totalCommission.toFixed(2)}€
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
};
