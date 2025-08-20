
import { useAffiliateStats } from '@/hooks/useAffiliateStats';
import { useCurrencyConverter } from '@/hooks/useCurrencyConverter';

interface AffiliateStatsCellProps {
  affiliateId: string;
  commissionRate: number;
}

export const AffiliateStatsCell = ({ affiliateId, commissionRate }: AffiliateStatsCellProps) => {
  const { stats, loading } = useAffiliateStats(affiliateId);
  const { convertAndFormat } = useCurrencyConverter();
  
  if (loading) {
    return <div className="text-xs text-slate-500">Chargement...</div>;
  }

  const conversionRate = stats.clicks > 0 ? ((stats.conversions / stats.clicks) * 100) : 0;
  const totalRevenue = stats.commissions / (commissionRate / 100);

  return (
    <div className="text-xs space-y-0.5">
      <div className="text-slate-600 leading-tight">
        <span className="font-medium text-slate-900">{conversionRate.toFixed(1)}%</span>
      </div>
      <div className="text-slate-500 leading-tight">
        {convertAndFormat(totalRevenue)}
      </div>
    </div>
  );
};
