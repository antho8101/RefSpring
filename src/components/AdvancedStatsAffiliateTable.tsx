
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AffiliatePerformance {
  id: string;
  name: string;
  email: string;
  clicks: number;
  conversions: number;
  commissions: number;
  conversionRate: number;
}

interface AdvancedStatsAffiliateTableProps {
  affiliates: AffiliatePerformance[];
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(value);
};

export const AdvancedStatsAffiliateTable = ({ affiliates }: AdvancedStatsAffiliateTableProps) => {
  if (affiliates.length === 0) {
    return null;
  }

  return (
    <Card className="bg-white border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-slate-900">Performance détaillée des affiliés</CardTitle>
        <CardDescription className="text-slate-600">Vue d'ensemble de tous vos affiliés</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left p-3 text-sm font-semibold text-slate-700">Nom</th>
                <th className="text-left p-3 text-sm font-semibold text-slate-700 hidden sm:table-cell">Email</th>
                <th className="text-right p-3 text-sm font-semibold text-slate-700">Clics</th>
                <th className="text-right p-3 text-sm font-semibold text-slate-700">Conv.</th>
                <th className="text-right p-3 text-sm font-semibold text-slate-700 hidden md:table-cell">Taux (%)</th>
                <th className="text-right p-3 text-sm font-semibold text-slate-700">Commissions</th>
              </tr>
            </thead>
            <tbody>
              {affiliates.map((affiliate) => (
                <tr key={affiliate.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-medium text-slate-900">{affiliate.name}</td>
                  <td className="p-3 text-slate-600 hidden sm:table-cell text-sm">{affiliate.email}</td>
                  <td className="p-3 text-right text-slate-900 font-medium">{affiliate.clicks}</td>
                  <td className="p-3 text-right text-slate-900 font-medium">{affiliate.conversions}</td>
                  <td className="p-3 text-right text-slate-600 hidden md:table-cell">{affiliate.conversionRate.toFixed(1)}%</td>
                  <td className="p-3 text-right font-semibold text-emerald-600">
                    {formatCurrency(affiliate.commissions)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
