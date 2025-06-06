
import { useAuth } from '@/hooks/useAuth';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useAffiliates } from '@/hooks/useAffiliates';
import { DashboardBackground } from '@/components/DashboardBackground';
import { DashboardHeader } from '@/components/DashboardHeader';
import { DashboardContent } from '@/components/DashboardContent';
import { DashboardFooter } from '@/components/DashboardFooter';
import { NetworkStatus } from '@/components/NetworkStatus';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Helmet } from 'react-helmet-async';
import { memo, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Users, DollarSign, Percent } from 'lucide-react';
import { auth } from '@/lib/firebase';

// Composant de stats simplifié SANS requêtes Firebase lourdes
const SimpleDashboardStats = ({ activeCampaigns, totalCampaigns, totalAffiliates }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
      <Card className="bg-gradient-to-br from-white to-blue-50/50 border-slate-200/50 shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:bg-gradient-to-br hover:from-white hover:to-blue-100/70">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-700">Campagnes Actives</CardTitle>
          <div className="p-2 bg-blue-100 rounded-full">
            <BarChart3 className="h-4 w-4 text-blue-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900">{activeCampaigns}</div>
          <p className="text-xs text-slate-500">sur {totalCampaigns} campagne{totalCampaigns > 1 ? 's' : ''}</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-white to-green-50/50 border-slate-200/50 shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:bg-gradient-to-br hover:from-white hover:to-green-100/70">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-700">Total Affiliés</CardTitle>
          <div className="p-2 bg-green-100 rounded-full">
            <Users className="h-4 w-4 text-green-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900">{totalAffiliates}</div>
          <p className="text-xs text-slate-500">affiliés actifs</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-white to-purple-50/50 border-slate-200/50 shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:bg-gradient-to-br hover:from-white hover:to-purple-100/70">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-700">Chiffre d'affaires</CardTitle>
          <div className="p-2 bg-purple-100 rounded-full">
            <DollarSign className="h-4 w-4 text-purple-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900">0.00€</div>
          <p className="text-xs text-slate-500">En attente de conversions</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-white to-orange-50/50 border-slate-200/50 shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:bg-gradient-to-br hover:from-white hover:to-orange-100/70">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-700">Taux Conversion</CardTitle>
          <div className="p-2 bg-orange-100 rounded-full">
            <Percent className="h-4 w-4 text-orange-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900">0.0%</div>
          <p className="text-xs text-slate-500">Aucun clic pour le moment</p>
        </CardContent>
      </Card>
    </div>
  );
};

export const Dashboard = memo(() => {
  const { user } = useAuth();
  const { campaigns, loading: campaignsLoading } = useCampaigns();
  const { affiliates, loading: affiliatesLoading } = useAffiliates();

  const handleLogout = useCallback(async () => {
    try {
      // Simple logout Firebase
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

  // Chargement ultra-rapide
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
        <DashboardHeader user={user} onLogout={handleLogout} />

        <main className="relative z-10 max-w-full w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 flex-1">
          <ErrorBoundary fallback={<div>Erreur stats</div>}>
            <SimpleDashboardStats 
              activeCampaigns={dashboardMetrics.activeCampaigns}
              totalCampaigns={dashboardMetrics.totalCampaigns}
              totalAffiliates={dashboardMetrics.totalAffiliates}
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
