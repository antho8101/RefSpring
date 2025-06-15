
import { useParams, useNavigate } from 'react-router-dom';
import { useAdvancedStatsExtended } from '@/hooks/useAdvancedStatsExtended';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useStatsFilters } from '@/hooks/useStatsFilters';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';
import { AdvancedStatsCharts } from '@/components/AdvancedStatsCharts';
import { AdvancedStatsAffiliateTable } from '@/components/AdvancedStatsAffiliateTable';
import { AdvancedStatsEvolution } from '@/components/AdvancedStatsEvolution';
import { AdvancedStatsTimeAnalysis } from '@/components/AdvancedStatsTimeAnalysis';
import { AdvancedStatsBehavioralMetrics } from '@/components/AdvancedStatsBehavioralMetrics';
import { AdvancedStatsPageHeader } from '@/components/AdvancedStatsPageHeader';
import { AdvancedStatsHallOfFame } from '@/components/AdvancedStatsHallOfFame';
import { AdvancedStatsAdditionalMetrics } from '@/components/AdvancedStatsAdditionalMetrics';
import { AdvancedStatsFinanceCard } from '@/components/AdvancedStatsFinanceCard';
import { AdvancedStatsNoDataMessage } from '@/components/AdvancedStatsNoDataMessage';

const AdvancedStatsPage = () => {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const { campaigns } = useCampaigns();
  const { period, setPeriod, getDateFilter, getPeriodLabel } = useStatsFilters();
  
  // 🔧 FIX: Utiliser directement la valeur filtrée mémorisée
  const dateFilter = getDateFilter();
  const { stats, loading } = useAdvancedStatsExtended(campaignId, dateFilter);

  const campaign = campaigns.find(c => c.id === campaignId);

  // Debug: afficher les stats dans la console
  useEffect(() => {
    if (!loading) {
      console.log(`📊 STATS ÉTENDUES AFFICHÉES (${getPeriodLabel()}):`, stats);
    }
  }, [stats, loading, getPeriodLabel]);

  // Calculer le CA rapporté par le top performer
  const getTopPerformerRevenue = () => {
    const topAffiliate = stats.topAffiliates.find(a => 
      a.name === stats.behavioralMetrics.topPerformingAffiliate.name
    );
    
    if (topAffiliate && topAffiliate.conversions > 0) {
      const revenue = topAffiliate.commissionRate > 0 
        ? (topAffiliate.commissions / topAffiliate.commissionRate) * 100
        : topAffiliate.commissions * 10;
      return revenue;
    }
    
    if (stats.behavioralMetrics.averageOrderValue > 0) {
      return stats.behavioralMetrics.averageOrderValue * stats.behavioralMetrics.topPerformingAffiliate.conversionRate;
    }
    
    return 0;
  };

  // Calculer des métriques additionnelles
  const calculateAdditionalMetrics = () => {
    const activeAffiliates = stats.topAffiliates.filter(a => a.conversions > 0).length;
    const avgCommissionPerAffiliate = activeAffiliates > 0 ? stats.totalCommissions / activeAffiliates : 0;
    const profitMargin = stats.totalRevenue > 0 ? ((stats.totalRevenue - stats.totalCommissions) / stats.totalRevenue) * 100 : 0;
    const avgRevenuePerClick = stats.totalClicks > 0 ? stats.totalRevenue / stats.totalClicks : 0;
    
    return {
      activeAffiliates,
      avgCommissionPerAffiliate,
      profitMargin,
      avgRevenuePerClick
    };
  };

  const additionalMetrics = calculateAdditionalMetrics();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="text-slate-600 font-medium">Chargement des statistiques avancées...</p>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center space-y-6 max-w-md w-full">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Campagne introuvable</h1>
          <p className="text-slate-600">Cette campagne n'existe pas ou vous n'y avez pas accès.</p>
          <Button onClick={() => navigate('/dashboard')} size="lg" className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      <AdvancedStatsPageHeader 
        campaign={campaign}
        period={period}
        onPeriodChange={setPeriod}
        getPeriodLabel={getPeriodLabel}
      />

      {/* Main Content */}
      <main className="w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Message d'information si pas de données */}
        {stats.totalClicks === 0 && stats.totalConversions === 0 && (
          <AdvancedStatsNoDataMessage period={period} />
        )}

        {/* Layout principal restructuré */}
        <div className="space-y-8">
          
          {/* Section 1: Évolution des performances (pleine largeur) */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
            <AdvancedStatsEvolution evolution={stats.evolution} />
          </div>

          {/* Section 2: Métriques comportementales + Hall of Fame + Métriques additionnelles */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* Métriques comportementales */}
            <div className="xl:col-span-1">
              <div className="bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30 rounded-2xl p-6 shadow-lg border border-white/50">
                <AdvancedStatsBehavioralMetrics behavioralMetrics={stats.behavioralMetrics} />
              </div>
            </div>

            {/* Métriques additionnelles */}
            <AdvancedStatsAdditionalMetrics metrics={additionalMetrics} />

            {/* HALL OF FAME */}
            <AdvancedStatsHallOfFame 
              topPerformingAffiliate={stats.behavioralMetrics.topPerformingAffiliate}
              topPerformerRevenue={getTopPerformerRevenue()}
            />
          </div>

          {/* Section 3: Graphiques et performance financière */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            
            {/* Performance Financière compacte (1/4) */}
            <AdvancedStatsFinanceCard 
              stats={{
                totalRevenue: stats.totalRevenue,
                conversionRate: stats.conversionRate
              }}
            />

            {/* Graphiques (3/4) */}
            <div className="xl:col-span-3">
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
                <AdvancedStatsCharts 
                  dailyStats={stats.dailyStats}
                  totalRevenue={stats.totalRevenue}
                  netRevenue={stats.netRevenue}
                  totalCommissions={stats.totalCommissions}
                />
              </div>
            </div>
          </div>

          {/* Section 4: Analyse temporelle détaillée (pleine largeur) */}
          <div className="bg-gradient-to-r from-slate-50/50 via-white to-blue-50/50 rounded-2xl p-6 shadow-lg border border-white/50">
            <AdvancedStatsTimeAnalysis timeAnalysis={stats.timeAnalysis} />
          </div>

          {/* Section 5: Tableau des affiliés (pleine largeur) */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
            <AdvancedStatsAffiliateTable affiliates={stats.topAffiliates} />
          </div>

        </div>
      </main>
    </div>
  );
};

export default AdvancedStatsPage;
