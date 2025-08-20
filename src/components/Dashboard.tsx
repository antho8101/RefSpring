
import { useAuth } from '@/hooks/useAuth';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useAffiliates } from '@/hooks/useAffiliates';
import { useStatsFilters } from '@/hooks/useStatsFilters';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useTawkTo } from '@/hooks/useTawkTo';
import { useGuidedTour } from '@/hooks/useGuidedTour';
import { DashboardBackground } from '@/components/DashboardBackground';
import { DashboardHeader } from '@/components/DashboardHeader';
import { DashboardContent } from '@/components/DashboardContent';
import { DashboardFooter } from '@/components/DashboardFooter';
import { NetworkStatus } from '@/components/NetworkStatus';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { PaymentNotificationBanner } from '@/components/PaymentNotificationBanner';
import { GuidedTourOverlay } from '@/components/GuidedTourOverlay';
import { CampaignSuccessModal } from '@/components/CampaignSuccessModal';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Helmet } from 'react-helmet-async';
import { memo, useCallback, useMemo, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsPeriodToggle } from '@/components/StatsPeriodToggle';
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
const DashboardStats = ({ activeCampaigns, totalCampaigns, totalAffiliates, userId, filterDate, periodLabel, period, onPeriodChange }) => {
  const [globalStats, setGlobalStats] = useState<GlobalStats>({
    totalRevenue: 0,
    totalCommissions: 0,
    totalClicks: 0,
    totalConversions: 0,
    conversionRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const { requireAuthentication } = useAuthGuard();

  useEffect(() => {
    const loadGlobalStats = async () => {
      if (!userId) {
        console.log('📊 SECURITY - No userId provided for stats');
        return;
      }
      
      try {
        // Vérification de sécurité
        if (!requireAuthentication('consulter les statistiques')) {
          return; // Sortir si l'auth n'est pas prête
        }
        
        console.log(`📊 SECURITY - Loading secured global stats ${periodLabel} for:`, userId);
        
        // Récupérer les campagnes de l'utilisateur avec vérification de propriété
        const campaignsQuery = query(collection(db, 'campaigns'), where('userId', '==', userId));
        const campaignsSnapshot = await getDocs(campaignsQuery);
        const campaignIds = campaignsSnapshot.docs.map(doc => doc.id);
        
        if (campaignIds.length === 0) {
          console.log('📊 SECURITY - No campaigns found for user');
          setLoading(false);
          return;
        }

        // Récupérer tous les clics et conversions en parallèle avec vérification de sécurité
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

        console.log(`📊 SECURITY - Secured stats calculated ${periodLabel}:`, {
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
        console.error('❌ SECURITY - Error loading secured stats:', error);
      }
      
      setLoading(false);
    };

    loadGlobalStats();
  }, [userId, filterDate, periodLabel, requireAuthentication]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 px-1">
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 transition-all duration-300 hover:scale-105 group cursor-default rounded-xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
          <CardTitle className="text-sm font-medium text-slate-600 truncate pr-2">Campagnes Actives</CardTitle>
          <div className="p-2 bg-blue-600 rounded-xl group-hover:animate-bounce">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="text-2xl font-bold text-slate-900 truncate group-hover:scale-110 transition-transform">{activeCampaigns}</div>
          <p className="text-xs text-slate-600 truncate">sur {totalCampaigns} campagne{totalCampaigns > 1 ? 's' : ''}</p>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-1">
            <div className="text-xs text-slate-500 italic">📊 Suivi en temps réel</div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 transition-all duration-300 hover:scale-105 group cursor-default rounded-xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
          <CardTitle className="text-sm font-medium text-slate-600 truncate pr-2">Total Affiliés</CardTitle>
          <div className="p-2 bg-green-600 rounded-xl group-hover:animate-bounce">
            <Users className="h-5 w-5 text-white" />
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="text-2xl font-bold text-slate-900 truncate group-hover:scale-110 transition-transform">{totalAffiliates}</div>
          <p className="text-xs text-slate-600 truncate">affiliés actifs</p>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-1">
            <div className="text-xs text-slate-500 italic">🚀 Réseau grandissant</div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 transition-all duration-300 hover:scale-105 group cursor-default rounded-xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
          <CardTitle className="text-sm font-medium text-slate-600 truncate pr-2">
            Chiffre d'affaires
            <span className="text-xs text-slate-500 block font-normal truncate">{periodLabel}</span>
          </CardTitle>
          <div className="p-2 bg-purple-600 rounded-xl group-hover:animate-bounce">
            <DollarSign className="h-5 w-5 text-white" />
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="text-xl lg:text-2xl font-bold text-slate-900 truncate group-hover:scale-110 transition-transform">
            {loading ? '...' : formatCurrency(globalStats.totalRevenue)}
          </div>
          <p className="text-xs text-slate-600 truncate">
            {loading ? 'Calcul...' : `${globalStats.totalConversions} conversion${globalStats.totalConversions > 1 ? 's' : ''}`}
          </p>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-1">
            <div className="text-xs text-slate-500 italic">💰 En croissance</div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 transition-all duration-300 hover:scale-105 group cursor-default rounded-xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
          <CardTitle className="text-sm font-medium text-slate-600 truncate pr-2">
            Taux Conversion
            <span className="text-xs text-slate-500 block font-normal truncate">{periodLabel}</span>
          </CardTitle>
          <div className="p-2 bg-orange-600 rounded-xl group-hover:animate-bounce">
            <Percent className="h-5 w-5 text-white" />
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="text-2xl font-bold text-slate-900 truncate group-hover:scale-110 transition-transform">
            {loading ? '...' : `${globalStats.conversionRate.toFixed(1)}%`}
          </div>
          <p className="text-xs text-slate-600 truncate">
            {loading ? 'Calcul...' : `${globalStats.totalClicks} clic${globalStats.totalClicks > 1 ? 's' : ''} total`}
          </p>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-1">
            <div className="text-xs text-slate-500 italic">🎯 Performance optimale</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const Dashboard = memo(() => {
  const { user } = useAuth();
  const { isAuthenticated, isLoading, requireAuthentication } = useAuthGuard();
  const { campaigns, loading: campaignsLoading } = useCampaigns();
  const { affiliates, loading: affiliatesLoading } = useAffiliates();
  const { period, setPeriod, getDateFilter, getPeriodLabel } = useStatsFilters();
  const { tourCompleted, startTour } = useGuidedTour();

  // État pour la modale de succès de campagne
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [newCampaignData, setNewCampaignData] = useState<{id: string, name: string} | null>(null);

  // Intégration Tawk.to - SEULEMENT pour les utilisateurs authentifiés
  useTawkTo({ enabled: isAuthenticated });

  // CORRECTION: Vérification de sécurité au montage SEULEMENT quand l'auth est prête
  useEffect(() => {
    if (!isLoading) {
      console.log('📊 SECURITY - Dashboard mounted, checking authentication');
      if (!requireAuthentication('accéder au dashboard')) {
        console.log('📊 SECURITY - Auth not ready or failed, will retry when ready');
      }
    }
  }, [requireAuthentication, isLoading]);

  // 🆕 Détecter une nouvelle campagne créée et afficher la modale
  useEffect(() => {
    const checkForNewCampaign = () => {
      const newCampaignCreated = localStorage.getItem('newCampaignCreated');
      if (newCampaignCreated) {
        try {
          const campaignData = JSON.parse(newCampaignCreated);
          console.log('🎉 DASHBOARD: Nouvelle campagne détectée:', campaignData);
          
          setNewCampaignData(campaignData);
          setShowSuccessModal(true);
          
          // Nettoyer immédiatement pour éviter les répétitions
          localStorage.removeItem('newCampaignCreated');
        } catch (error) {
          console.error('❌ DASHBOARD: Erreur parsing newCampaignCreated:', error);
          localStorage.removeItem('newCampaignCreated');
        }
      }
    };

    // Vérifier au montage du dashboard
    checkForNewCampaign();
  }, []);

  // Démarrer l'onboarding si l'utilisateur est connecté et n'a pas encore fait le tour
  useEffect(() => {
    if (isAuthenticated && !tourCompleted && !campaignsLoading && !affiliatesLoading) {
      // Attendre un peu que le dashboard soit rendu
      const timer = setTimeout(() => {
        console.log('🎯 Starting guided tour for new user');
        startTour();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, tourCompleted, campaignsLoading, affiliatesLoading, startTour]);

  const handleLogout = useCallback(async () => {
    try {
      console.log('🔐 SECURITY - User logout initiated');
      await auth.signOut();
      localStorage.removeItem('auth_user');
      sessionStorage.clear(); // Nettoyer toutes les données de session
      console.log('🔐 SECURITY - User logged out successfully');
    } catch (error) {
      console.error('🔐 SECURITY - Logout error:', error);
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

  // CORRECTION: Affichage du loader si l'authentification est encore en cours
  if (isLoading || campaignsLoading || affiliatesLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement sécurisé du dashboard...</p>
        </div>
      </div>
    );
  }

  // Vérification finale : si pas authentifié après le chargement, ne pas afficher le dashboard
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Redirection vers la page de connexion...</p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Helmet>
        <title>RefSpring - Dashboard Sécurisé</title>
      </Helmet>

      <NetworkStatus />
      <div className="min-h-screen bg-white relative overflow-hidden flex flex-col">
        {/* Removed DashboardBackground */}
        <div data-tour="header">
          <DashboardHeader 
            user={user} 
            onLogout={handleLogout}
            period={period}
            onPeriodChange={setPeriod}
          />
        </div>

        <main className="relative z-10 max-w-6xl mx-auto w-full px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8 h-[calc(100vh-120px-80px)] overflow-y-auto min-w-0">
          {/* Bandeau de notifications de paiement */}
          <ErrorBoundary fallback={<div>Erreur notifications</div>}>
            <PaymentNotificationBanner />
          </ErrorBoundary>

          <div data-tour="stats">
            <ErrorBoundary fallback={<div>Erreur stats</div>}>
              <DashboardStats 
                activeCampaigns={dashboardMetrics.activeCampaigns}
                totalCampaigns={dashboardMetrics.totalCampaigns}
                totalAffiliates={dashboardMetrics.totalAffiliates}
                userId={user?.uid}
                filterDate={getDateFilter()}
                periodLabel={getPeriodLabel()}
                period={period}
                onPeriodChange={setPeriod}
              />
            </ErrorBoundary>
            
            {/* Toggle des périodes - Version discrète */}
            <div className="flex justify-end -mt-4 pb-5" data-tour="period-toggle">
              <StatsPeriodToggle period={period} onPeriodChange={setPeriod} />
            </div>
          </div>

          <ErrorBoundary fallback={<div>Erreur contenu</div>}>
            <DashboardContent />
          </ErrorBoundary>
        </main>

        <div data-tour="footer">
          <DashboardFooter />
        </div>
      </div>

      {/* Guided Tour Overlay */}
      <GuidedTourOverlay />

      {/* 🆕 Modale de succès de campagne */}
      {newCampaignData && (
        <CampaignSuccessModal
          open={showSuccessModal}
          onOpenChange={(open) => {
            setShowSuccessModal(open);
            if (!open) {
              setNewCampaignData(null);
            }
          }}
          campaignId={newCampaignData.id}
          campaignName={newCampaignData.name}
        />
      )}
    </TooltipProvider>
  );
});

Dashboard.displayName = 'SecuredDashboard';
