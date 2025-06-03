import { useOptimizedAuth } from '@/hooks/useOptimizedAuth';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useAffiliates } from '@/hooks/useAffiliates';
import { useGlobalStats } from '@/hooks/useGlobalStats';
import { DashboardBackground } from '@/components/DashboardBackground';
import { DashboardHeader } from '@/components/DashboardHeader';
import { DashboardStats } from '@/components/DashboardStats';
import { DashboardContent } from '@/components/DashboardContent';
import { NetworkStatus } from '@/components/NetworkStatus';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Helmet } from 'react-helmet-async';
import { memo, useCallback, useMemo } from 'react';

export const Dashboard = memo(() => {
  const { user, logout } = useOptimizedAuth();
  const { campaigns } = useCampaigns();
  const { affiliates } = useAffiliates();
  const { stats: globalStats, loading: globalStatsLoading } = useGlobalStats();

  const handleLogout = useCallback(async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  }, [logout]);

  const dashboardMetrics = useMemo(() => {
    const activeCampaigns = campaigns.filter(c => c.isActive).length;
    const totalAffiliates = affiliates.length;
    
    return {
      activeCampaigns,
      totalCampaigns: campaigns.length,
      totalAffiliates,
    };
  }, [campaigns, affiliates]);

  return (
    <>
      <Helmet>
        <title>RefSpring - Dashboard</title>
        <meta name="description" content="Gérez vos campagnes d'affiliation, suivez vos performances et optimisez vos revenus avec RefSpring." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <NetworkStatus />
      <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 relative overflow-hidden">
        <DashboardBackground />

        <DashboardHeader user={user} onLogout={handleLogout} />

        {/* Main Content */}
        <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <ErrorBoundary fallback={
            <div className="text-center py-8">
              <p className="text-gray-600">Erreur lors du chargement des statistiques</p>
            </div>
          }>
            <DashboardStats 
              activeCampaigns={dashboardMetrics.activeCampaigns}
              totalCampaigns={dashboardMetrics.totalCampaigns}
              totalAffiliates={dashboardMetrics.totalAffiliates}
              globalStats={globalStats}
              globalStatsLoading={globalStatsLoading}
            />
          </ErrorBoundary>

          <ErrorBoundary fallback={
            <div className="text-center py-8">
              <p className="text-gray-600">Erreur lors du chargement du contenu</p>
            </div>
          }>
            <DashboardContent />
          </ErrorBoundary>
        </main>
      </div>
    </>
  );
});

Dashboard.displayName = 'Dashboard';
