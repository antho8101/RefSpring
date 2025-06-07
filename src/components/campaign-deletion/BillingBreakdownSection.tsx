
import { CreditCard } from 'lucide-react';
import { PaymentDistribution } from '@/services/stripeConnectService';

interface BillingBreakdownSectionProps {
  distribution: PaymentDistribution;
  totalToDistribute: number;
}

export const BillingBreakdownSection = ({ distribution, totalToDistribute }: BillingBreakdownSectionProps) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <h4 className="font-medium text-red-900 mb-3 flex items-center gap-2">
        <CreditCard className="h-4 w-4" />
        Montants qui vous seront facturés
      </h4>
      <div className="space-y-3">
        {/* Commissions affiliés */}
        <div className="bg-white rounded-lg p-3 border border-red-100">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium text-red-900">Commissions aux affiliés</p>
              <p className="text-sm text-red-700">
                Montant à reverser aux {distribution.affiliatePayments.length} affilié(s)
              </p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-red-900">
                {distribution.totalCommissions.toFixed(2)}€
              </p>
            </div>
          </div>
        </div>

        {/* Commission RefSpring */}
        <div className="bg-white rounded-lg p-3 border border-red-100">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium text-red-900">Commission RefSpring</p>
              <p className="text-sm text-red-700">
                2.5% sur le CA de {distribution.totalRevenue.toFixed(2)}€ + frais Stripe
              </p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-red-900">
                {distribution.platformFee.toFixed(2)}€
              </p>
            </div>
          </div>
        </div>

        {/* Total */}
        <div className="bg-red-100 rounded-lg p-3 border-2 border-red-300">
          <div className="flex justify-between items-center">
            <p className="text-lg font-bold text-red-900">TOTAL À FACTURER</p>
            <p className="text-2xl font-black text-red-900">
              {totalToDistribute.toFixed(2)}€
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
