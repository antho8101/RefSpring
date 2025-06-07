
import { useAuth } from '@/hooks/useAuth';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useAffiliates } from '@/hooks/useAffiliates';
import { useStatsFilters } from '@/hooks/useStatsFilters';
import { DashboardBackground } from '@/components/DashboardBackground';
import { DashboardHeader } from '@/components/DashboardHeader';
import { DashboardContent } from '@/components/DashboardContent';
import { DashboardFooter } from '@/components/DashboardFooter';
import { NetworkStatus } from '@/components/NetworkStatus';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { PaymentNotificationBanner } from '@/components/PaymentNotificationBanner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Helmet } from 'react-helmet-async';
import { memo, useCallback, useMemo, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Users, DollarSign, Percent } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface GlobalStats {
  totalRevenue: number;
  totalCommissions: number;
  totalClicks: number;
  totalConversions: number;
  conversionRate: number;
}

// Composant de stats avec vraies données Firebase et filtrage par période
const DashboardStats = ({ activeCampaigns, totalCampaigns, totalAffiliates, userId, filterDate, periodLabel }) => {
  const [globalStats, setGlobalStats] = useState<GlobalStats>({
    totalRevenue: 0,
    totalCommissions: 0,
    totalClicks: 0,
    totalConversions: 0,
    conversionRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGlobalStats = async () => {
      if (!userId) return;
      
      try {
        console.log(`📊 DASHBOARD - Chargement des stats globales ${periodLabel} pour:`, userId);
        
        // Récupérer les campagnes de l'utilisateur
        const campaignsQuery = query(collection(db, 'campaigns'), where('userId', '==', userId));
        const campaignsSnapshot = await getDocs(campaignsQuery);
        const campaignIds = campaignsSnapshot.docs.map(doc => doc.id);
        
        if (campaignIds.length === 0) {
          setLoading(false);
          return;
        }

        // Récupérer tous les clics et conversions en parallèle
        const [clicksSnapshot, conversionsSnapshot] = await Promise.all([
          getDocs(query(collection(db, 'clicks'), where('campaignId', 'in', campaignIds))),
          getDocs(query(collection(db, 'conversions'), where('campaignId', 'in', campaignIds)))
        ]);

        // Filtrer par période si nécessaire
        const filterDataByDate = (data: any[]) => {
          if (!filterDate) return data;
          
          return data.filter(item => {
            if (!item.timestamp) return false;
            try {
              const itemDate = item.timestamp.toDate ? 
                item.timestamp.toDate() : 
                new Date(item.timestamp);
              return itemDate >= filterDate;
            } catch (error) {
              return false;
            }
          });
        };

        const filteredClicks = filterDataByDate(clicksSnapshot.docs.map(doc => doc.data()));
        const filteredConversions = filterDataByDate(conversionsSnapshot.docs.map(doc => doc.data()));

        const totalClicks = filteredClicks.length;
        let totalRevenue = 0;
        let totalCommissions = 0;
        let totalConversions = 0;

        filteredConversions.forEach(data => {
          const amount = parseFloat(data.amount) || 0;
          const commission = parseFloat(data.commission) || 0;
          
          totalConversions++;
          totalRevenue += amount;
          totalCommissions += commission;
        });

        const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

        console.log(`📊 DASHBOARD - Stats calculées ${periodLabel}:`, {
          totalClicks,
          totalConversions,
          totalRevenue,
          totalCommissions,
          conversionRate
        });

        setGlobalStats({
          totalRevenue,
          totalCommissions,
          totalClicks,
          totalConversions,
          conversionRate,
        });
      } catch (error) {
        console.error('❌ DASHBOARD - Erreur chargement stats:', error);
      }
      
      setLoading(false);
    };

    loadGlobalStats();
  }, [userId, filterDate, periodLabel]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8 px-1">
      <Card className="bg-gradient-to-br from-white to-blue-50/50 border-slate-200/50 shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:bg-gradient-to-br hover:from-white hover:to-blue-100/70 min-w-0">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
          <CardTitle className="text-sm font-medium text-slate-700 truncate pr-2">Campagnes Actives</CardTitle>
          <div className="p-2 bg-blue-100 rounded-full flex-shrink-0">
            <BarChart3 className="h-4 w-4 text-blue-600" />
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="text-2xl font-bold text-slate-900 truncate">{activeCampaigns}</div>
          <p className="text-xs text-slate-500 truncate">sur {totalCampaigns} campagne{totalCampaigns > 1 ? 's' : ''}</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-white to-green-50/50 border-slate-200/50 shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:bg-gradient-to-br hover:from-white hover:to-green-100/70 min-w-0">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
          <CardTitle className="text-sm font-medium text-slate-700 truncate pr-2">Total Affiliés</CardTitle>
          <div className="p-2 bg-green-100 rounded-full flex-shrink-0">
            <Users className="h-4 w-4 text-green-600" />
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="text-2xl font-bold text-slate-900 truncate">{totalAffiliates}</div>
          <p className="text-xs text-slate-500 truncate">affiliés actifs</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-white to-purple-50/50 border-slate-200/50 shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:bg-gradient-to-br hover:from-white hover:to-purple-100/70 min-w-0">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
          <CardTitle className="text-sm font-medium text-slate-700 truncate pr-2">
            Chiffre d'affaires
            <span className="text-xs text-slate-500 block font-normal truncate">{periodLabel}</span>
          </CardTitle>
          <div className="p-2 bg-purple-100 rounded-full flex-shrink-0">
            <DollarSign className="h-4 w-4 text-purple-600" />
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="text-xl lg:text-2xl font-bold text-slate-900 truncate">
            {loading ? '...' : formatCurrency(globalStats.totalRevenue)}
          </div>
          <p className="text-xs text-slate-500 truncate">
            {loading ? 'Calcul...' : `${globalStats.totalConversions} conversion${globalStats.totalConversions > 1 ? 's' : ''}`}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-white to-orange-50/50 border-slate-200/50 shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:bg-gradient-to-br hover:from-white hover:to-orange-100/70 min-w-0">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
          <CardTitle className="text-sm font-medium text-slate-700 truncate pr-2">
            Taux Conversion
            <span className="text-xs text-slate-500 block font-normal truncate">{periodLabel}</span>
          </CardTitle>
          <div className="p-2 bg-orange-100 rounded-full flex-shrink-0">
            <Percent className="h-4 w-4 text-orange-600" />
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="text-2xl font-bold text-slate-900 truncate">
            {loading ? '...' : `${globalStats.conversionRate.toFixed(1)}%`}
          </div>
          <p className="text-xs text-slate-500 truncate">
            {loading ? 'Calcul...' : `${globalStats.totalClicks} clic${globalStats.totalClicks > 1 ? 's' : ''} total`}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export const Dashboard = memo(() => {
  const { user } = useAuth();
  const { campaigns, loading: campaignsLoading } = useCampaigns();
  const { affiliates, loading: affiliatesLoading } = useAffiliates();
  const { period, setPeriod, getDateFilter, getPeriodLabel } = useStatsFilters();

  const handleLogout = useCallback(async () => {
    try {
      await auth.signOut();
      localStorage.removeItem('auth_user');
    } catch (error) {
      console.error('Erreur logout:', error);
    }
  }, []);

  const dashboardMetrics = useMemo(() => {
    const activeCampaigns = campaigns.filter(c => c.isActive).length;
    return {
      activeCampaigns,
      totalCampaigns: campaigns.length,
      totalAffiliates: affiliates.length,
    };
  }, [campaigns, affiliates]);

  if (campaignsLoading || affiliatesLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Helmet>
        <title>RefSpring - Dashboard</title>
      </Helmet>

      <NetworkStatus />
      <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 relative overflow-hidden flex flex-col">
        <DashboardBackground />
        <DashboardHeader 
          user={user} 
          onLogout={handleLogout}
          period={period}
          onPeriodChange={setPeriod}
        />

        <main className="relative z-10 max-w-[1800px] mx-auto w-full px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8 flex-1 min-w-0">
          {/* Bandeau de notifications de paiement */}
          <ErrorBoundary fallback={<div>Erreur notifications</div>}>
            <PaymentNotificationBanner />
          </ErrorBoundary>

          <ErrorBoundary fallback={<div>Erreur stats</div>}>
            <DashboardStats 
              activeCampaigns={dashboardMetrics.activeCampaigns}
              totalCampaigns={dashboardMetrics.totalCampaigns}
              totalAffiliates={dashboardMetrics.totalAffiliates}
              userId={user?.uid}
              filterDate={getDateFilter()}
              periodLabel={getPeriodLabel()}
            />
          </ErrorBoundary>

          <ErrorBoundary fallback={<div>Erreur contenu</div>}>
            <DashboardContent />
          </ErrorBoundary>
        </main>

        <DashboardFooter />
      </div>
    </TooltipProvider>
  );
});

Dashboard.displayName = 'Dashboard';
