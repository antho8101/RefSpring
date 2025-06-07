
import { useAffiliateStats } from '@/hooks/useAffiliateStats';

interface AffiliateStatsCellProps {
  affiliateId: string;
  commissionRate: number;
}

export const AffiliateStatsCell = ({ affiliateId, commissionRate }: AffiliateStatsCellProps) => {
  const { stats, loading } = useAffiliateStats(affiliateId);
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(value);
  };

  if (loading) {
    return <div className="text-xs text-slate-500">Chargement...</div>;
  }

  const conversionRate = stats.clicks > 0 ? ((stats.conversions / stats.clicks) * 100) : 0;
  const totalRevenue = stats.commissions / (commissionRate / 100);

  return (
    <div className="space-y-1">
      <div className="text-xs text-slate-600">
        Taux: <span className="font-medium">{conversionRate.toFixed(1)}%</span>
      </div>
      <div className="text-xs text-slate-600">
        CA: <span className="font-medium">{formatCurrency(totalRevenue)}</span>
      </div>
    </div>
  );
};
