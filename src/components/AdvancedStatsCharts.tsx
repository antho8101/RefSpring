
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { MousePointer, DollarSign } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface AdvancedStatsChartsProps {
  dailyStats: Array<{
    date: string;
    clicks: number;
    conversions: number;
    revenue: number;
  }>;
  totalRevenue: number;
  netRevenue: number;
  totalCommissions: number;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
};

export const AdvancedStatsCharts = ({ dailyStats, totalRevenue, netRevenue, totalCommissions }: AdvancedStatsChartsProps) => {
  const { t } = useTranslation();

  const pieData = [
    { name: t('stats.netRevenue'), value: netRevenue, color: '#10B981' },
    { name: t('stats.commissions'), value: totalCommissions, color: '#3B82F6' }
  ].filter(item => item.value > 0);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
      {/* Évolution des clics */}
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl font-bold text-slate-900">{t('charts.clicksEvolution')}</CardTitle>
          <CardDescription className="text-slate-600">{t('charts.last30Days')}</CardDescription>
        </CardHeader>
        <CardContent>
          {dailyStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
              <AreaChart data={dailyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString('fr-FR')}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    fontSize: '12px'
                  }}
                />
                <Area type="monotone" dataKey="clicks" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.2} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] sm:h-[300px] flex items-center justify-center text-slate-500">
              <div className="text-center">
                <MousePointer className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm sm:text-base">{t('charts.noClicks')}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Répartition financière */}
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl font-bold text-slate-900">{t('charts.financialBreakdown')}</CardTitle>
          <CardDescription className="text-slate-600">{t('charts.netVsCommissions')}</CardDescription>
        </CardHeader>
        <CardContent>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    className="sm:innerRadius-[60] sm:outerRadius-[120]"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => formatCurrency(Number(value))}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0', 
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 sm:gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-xs sm:text-sm text-slate-600">{t('stats.netRevenue')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-xs sm:text-sm text-slate-600">{t('stats.commissions')}</span>
                </div>
              </div>
            </>
          ) : (
            <div className="h-[250px] sm:h-[300px] flex items-center justify-center text-slate-500">
              <div className="text-center">
                <DollarSign className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm sm:text-base">{t('charts.noFinancialData')}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
