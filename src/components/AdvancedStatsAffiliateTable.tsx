
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';

interface AffiliatePerformance {
  id: string;
  name: string;
  email: string;
  clicks: number;
  conversions: number;
  commissions: number;
  conversionRate: number;
  commissionRate: number;
}

interface AdvancedStatsAffiliateTableProps {
  affiliates: AffiliatePerformance[];
}

type SortOption = 
  | 'commissions-desc' 
  | 'commissions-asc'
  | 'clicks-desc' 
  | 'clicks-asc'
  | 'conversions-desc'
  | 'conversions-asc'
  | 'conversion-rate-desc'
  | 'conversion-rate-asc';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(value);
};

const sortAffiliates = (affiliates: AffiliatePerformance[], sortBy: SortOption) => {
  const sorted = [...affiliates];
  
  switch (sortBy) {
    case 'commissions-desc':
      return sorted.sort((a, b) => b.commissions - a.commissions);
    case 'commissions-asc':
      return sorted.sort((a, b) => a.commissions - b.commissions);
    case 'clicks-desc':
      return sorted.sort((a, b) => b.clicks - a.clicks);
    case 'clicks-asc':
      return sorted.sort((a, b) => a.clicks - b.clicks);
    case 'conversions-desc':
      return sorted.sort((a, b) => b.conversions - a.conversions);
    case 'conversions-asc':
      return sorted.sort((a, b) => a.conversions - b.conversions);
    case 'conversion-rate-desc':
      return sorted.sort((a, b) => b.conversionRate - a.conversionRate);
    case 'conversion-rate-asc':
      return sorted.sort((a, b) => a.conversionRate - b.conversionRate);
    default:
      return sorted;
  }
};

export const AdvancedStatsAffiliateTable = ({ affiliates }: AdvancedStatsAffiliateTableProps) => {
  const [sortBy, setSortBy] = useState<SortOption>('commissions-desc');

  if (affiliates.length === 0) {
    return null;
  }

  const sortedAffiliates = sortAffiliates(affiliates, sortBy);

  return (
    <Card className="bg-white border-slate-200 shadow-sm rounded-2xl overflow-hidden">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-lg sm:text-xl font-bold text-slate-900">Performance détaillée des affiliés</CardTitle>
            <CardDescription className="text-slate-600">Vue d'ensemble de tous vos affiliés</CardDescription>
          </div>
          <div className="w-full sm:w-auto">
            <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
              <SelectTrigger className="w-full sm:w-[250px] rounded-xl">
                <SelectValue placeholder="Trier par..." />
              </SelectTrigger>
              <SelectContent className="rounded-xl bg-white border border-slate-200 shadow-lg z-50">
                <SelectItem value="commissions-desc">Plus performants (commissions)</SelectItem>
                <SelectItem value="commissions-asc">Moins performants (commissions)</SelectItem>
                <SelectItem value="clicks-desc">Plus de clics</SelectItem>
                <SelectItem value="clicks-asc">Moins de clics</SelectItem>
                <SelectItem value="conversions-desc">Plus de conversions</SelectItem>
                <SelectItem value="conversions-asc">Moins de conversions</SelectItem>
                <SelectItem value="conversion-rate-desc">Meilleur taux de conversion</SelectItem>
                <SelectItem value="conversion-rate-asc">Pire taux de conversion</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Version mobile - Cards */}
        <div className="block lg:hidden">
          <div className="divide-y divide-slate-100">
            {sortedAffiliates.map((affiliate) => (
              <div key={affiliate.id} className="p-4 hover:bg-slate-50 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-slate-900 truncate">{affiliate.name}</h3>
                    <p className="text-sm text-slate-600 truncate">{affiliate.email}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-emerald-600 text-sm">
                      {formatCurrency(affiliate.commissions)}
                    </div>
                    <div className="text-xs text-slate-500">
                      {affiliate.commissionRate}% commission
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="text-center bg-slate-50 rounded-2xl p-3">
                    <div className="font-medium text-slate-900">{affiliate.clicks}</div>
                    <div className="text-xs text-slate-500">Clics</div>
                  </div>
                  <div className="text-center bg-slate-50 rounded-2xl p-3">
                    <div className="font-medium text-slate-900">{affiliate.conversions}</div>
                    <div className="text-xs text-slate-500">Conversions</div>
                  </div>
                </div>
                <div className="mt-2 text-center bg-blue-50 rounded-2xl p-3">
                  <div className="font-medium text-blue-600">{affiliate.conversionRate.toFixed(1)}%</div>
                  <div className="text-xs text-slate-500">Taux de conversion</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Version desktop - Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left p-4 text-sm font-semibold text-slate-700">Affilié</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-700">Email</th>
                <th className="text-center p-4 text-sm font-semibold text-slate-700">Clics</th>
                <th className="text-center p-4 text-sm font-semibold text-slate-700">Conversions</th>
                <th className="text-center p-4 text-sm font-semibold text-slate-700">Taux Conv.</th>
                <th className="text-center p-4 text-sm font-semibold text-slate-700">Comm. %</th>
                <th className="text-right p-4 text-sm font-semibold text-slate-700">Commissions</th>
              </tr>
            </thead>
            <tbody>
              {sortedAffiliates.map((affiliate, index) => (
                <tr key={affiliate.id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-25'}`}>
                  <td className="p-4">
                    <div className="font-medium text-slate-900">{affiliate.name}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-slate-600 text-sm">{affiliate.email}</div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="inline-flex items-center justify-center bg-blue-100 text-blue-700 px-3 py-2 rounded-2xl text-sm font-medium min-w-[50px]">
                      {affiliate.clicks}
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="inline-flex items-center justify-center bg-green-100 text-green-700 px-3 py-2 rounded-2xl text-sm font-medium min-w-[50px]">
                      {affiliate.conversions}
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <div className={`inline-flex items-center justify-center px-3 py-2 rounded-2xl text-sm font-medium min-w-[60px] ${
                      affiliate.conversionRate >= 5 ? 'bg-emerald-100 text-emerald-700' :
                      affiliate.conversionRate >= 2 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {affiliate.conversionRate.toFixed(1)}%
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="inline-flex items-center justify-center bg-purple-100 text-purple-700 px-3 py-2 rounded-2xl text-sm font-medium min-w-[50px]">
                      {affiliate.commissionRate}%
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="font-semibold text-emerald-600 text-lg">
                      {formatCurrency(affiliate.commissions)}
                    </div>
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
