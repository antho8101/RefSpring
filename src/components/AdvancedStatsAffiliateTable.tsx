import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();

  if (affiliates.length === 0) {
    return null;
  }

  return (
    <Card className="bg-white border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl font-bold text-slate-900">{t('table.detailedPerformance')}</CardTitle>
        <CardDescription className="text-slate-600">{t('table.overviewAllAffiliates')}</CardDescription>
      </CardHeader>
      <CardContent className="p-0 sm:p-6">
        {/* Version mobile - Cards */}
        <div className="block sm:hidden">
          <div className="divide-y divide-slate-100">
            {affiliates.map((affiliate) => (
              <div key={affiliate.id} className="p-4 hover:bg-slate-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-slate-900 truncate">{affiliate.name}</h3>
                    <p className="text-sm text-slate-600 truncate">{affiliate.email}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-emerald-600 text-sm">
                      {formatCurrency(affiliate.commissions)}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-medium text-slate-900">{affiliate.clicks}</div>
                    <div className="text-xs text-slate-500">{t('table.clicks')}</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-slate-900">{affiliate.conversions}</div>
                    <div className="text-xs text-slate-500">{t('table.conversions')}</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-slate-900">{affiliate.conversionRate.toFixed(1)}%</div>
                    <div className="text-xs text-slate-500">{t('table.conversionRateShort')}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Version desktop - Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left p-3 text-sm font-semibold text-slate-700">{t('table.name')}</th>
                <th className="text-left p-3 text-sm font-semibold text-slate-700 hidden lg:table-cell">{t('table.email')}</th>
                <th className="text-right p-3 text-sm font-semibold text-slate-700">{t('table.clicks')}</th>
                <th className="text-right p-3 text-sm font-semibold text-slate-700">{t('table.conversions')}</th>
                <th className="text-right p-3 text-sm font-semibold text-slate-700 hidden md:table-cell">{t('table.conversionRateShort')}</th>
                <th className="text-right p-3 text-sm font-semibold text-slate-700">{t('stats.commissions')}</th>
              </tr>
            </thead>
            <tbody>
              {affiliates.map((affiliate) => (
                <tr key={affiliate.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-medium text-slate-900">{affiliate.name}</td>
                  <td className="p-3 text-slate-600 hidden lg:table-cell text-sm">{affiliate.email}</td>
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
