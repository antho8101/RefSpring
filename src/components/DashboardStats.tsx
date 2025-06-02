
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Users, DollarSign, Percent, TrendingUp } from 'lucide-react';

interface DashboardStatsProps {
  activeCampaigns: number;
  totalCampaigns: number;
  totalAffiliates: number;
  globalStats: {
    totalClicks: number;
    netRevenue: number;
    totalConversions: number;
    totalCommissions: number;
    conversionRate: number;
  };
  globalStatsLoading: boolean;
}

export const DashboardStats = ({ 
  activeCampaigns, 
  totalCampaigns, 
  totalAffiliates, 
  globalStats, 
  globalStatsLoading 
}: DashboardStatsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8 animate-fade-in">
      <Card className="bg-gradient-to-br from-white to-blue-50/50 border-slate-200/50 shadow-xl hover:shadow-2xl transition-all hover:scale-105 backdrop-blur-sm rounded-xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-700">Campagnes Actives</CardTitle>
          <div className="p-2 bg-blue-100 rounded-full">
            <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">{activeCampaigns}</div>
          <p className="text-xs text-slate-500">
            sur {totalCampaigns} campagne{totalCampaigns > 1 ? 's' : ''}
          </p>
          <div className="mt-2 h-1 bg-blue-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all"
              style={{ width: totalCampaigns > 0 ? `${(activeCampaigns / totalCampaigns) * 100}%` : '0%' }}
            ></div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-white to-green-50/50 border-slate-200/50 shadow-xl hover:shadow-2xl transition-all hover:scale-105 backdrop-blur-sm rounded-xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-700">Total Affiliés</CardTitle>
          <div className="p-2 bg-green-100 rounded-full">
            <Users className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">{totalAffiliates}</div>
          <p className="text-xs text-slate-500">
            {totalAffiliates === 0 ? 'Aucun affilié ajouté' : 'affiliés actifs'}
          </p>
          <div className="mt-2 flex items-center gap-1 text-green-600">
            <TrendingUp className="h-3 w-3" />
            <span className="text-xs font-medium">
              {globalStatsLoading ? '...' : `${globalStats.totalClicks} clics`}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-white to-purple-50/50 border-slate-200/50 shadow-xl hover:shadow-2xl transition-all hover:scale-105 backdrop-blur-sm rounded-xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-700">CA Net</CardTitle>
          <div className="p-2 bg-purple-100 rounded-full">
            <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 mb-1">
            {globalStatsLoading ? '...' : `${globalStats.netRevenue.toFixed(2)}€`}
          </div>
          <p className="text-xs text-slate-500">
            {globalStatsLoading ? 'Chargement...' : 
              globalStats.totalConversions === 0 ? 'Aucune conversion' : 
              `après ${globalStats.totalCommissions.toFixed(2)}€ de commissions`
            }
          </p>
          <div className="mt-2 text-xs text-purple-600 font-medium">
            {globalStatsLoading ? '' : 
              globalStats.totalConversions === 0 ? 'Prêt à décoller 🚀' :
              `${globalStats.totalConversions} conversion${globalStats.totalConversions > 1 ? 's' : ''}`
            }
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-white to-orange-50/50 border-slate-200/50 shadow-xl hover:shadow-2xl transition-all hover:scale-105 backdrop-blur-sm rounded-xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-700">Taux Conversion</CardTitle>
          <div className="p-2 bg-orange-100 rounded-full">
            <Percent className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">
            {globalStatsLoading ? '...' : `${globalStats.conversionRate.toFixed(1)}%`}
          </div>
          <p className="text-xs text-slate-500">
            {globalStatsLoading ? 'Calcul...' : 
              `sur ${globalStats.totalClicks} clics totaux`
            }
          </p>
          <div className="mt-2 h-1 bg-orange-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full transition-all"
              style={{ width: `${Math.min(globalStats.conversionRate * 2, 100)}%` }}
            ></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
