import { useAffiliateStats } from '@/hooks/useAffiliateStats';
import { useCurrencyConverter } from '@/hooks/useCurrencyConverter';

interface AffiliatePaymentAmountProps {
  affiliateId: string;
}

export const AffiliatePaymentAmount = ({ affiliateId }: AffiliatePaymentAmountProps) => {
  const { stats, loading } = useAffiliateStats(affiliateId);
  const { convertAndFormat } = useCurrencyConverter();
  
  if (loading) {
    return <div className="text-xs text-slate-500">Chargement...</div>;
  }

  return (
    <div className="text-xs">
      <div className="font-medium text-slate-900">
        {convertAndFormat(stats.commissions)}
      </div>
      <div className="text-slate-500 text-xs">
        dû à l'affilié
      </div>
    </div>
  );
};