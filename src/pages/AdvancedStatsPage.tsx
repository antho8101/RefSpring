import { useParams, useNavigate } from 'react-router-dom';
import { useAdvancedStatsExtended } from '@/hooks/useAdvancedStatsExtended';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useStatsFilters } from '@/hooks/useStatsFilters';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Globe, Menu, Crown, Star, TrendingUp, Target, Users, DollarSign, Zap, Clock, Award } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AdvancedStatsCharts } from '@/components/AdvancedStatsCharts';
import { AdvancedStatsAffiliateTable } from '@/components/AdvancedStatsAffiliateTable';
import { AdvancedStatsEvolution } from '@/components/AdvancedStatsEvolution';
import { AdvancedStatsTimeAnalysis } from '@/components/AdvancedStatsTimeAnalysis';
import { AdvancedStatsBehavioralMetrics } from '@/components/AdvancedStatsBehavioralMetrics';
import { StatsPeriodToggle } from '@/components/StatsPeriodToggle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AdvancedStatsPage = () => {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const { campaigns } = useCampaigns();
  const { period, setPeriod, getDateFilter, getPeriodLabel } = useStatsFilters();
  const { stats, loading } = useAdvancedStatsExtended(campaignId, getDateFilter());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 truncate">RefSpring</h1>
              <p className="text-xs sm:text-sm text-slate-600">Statistiques Avancées - {getPeriodLabel()}</p>
            </div>

            {/* Toggle de période dans le header */}
            <div className="hidden lg:flex items-center space-x-4">
              <StatsPeriodToggle 
                period={period}
                onPeriodChange={setPeriod}
              />
              <div className="text-sm text-slate-700 bg-slate-100 px-3 py-1 rounded-full max-w-[300px] truncate">
                Campagne : <span className="font-semibold">{campaign.name}</span>
              </div>
              <Button 
                variant="outline" 
                onClick={() => navigate('/dashboard')}
                className="hover:bg-slate-50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="outline"
              size="sm"
              className="lg:hidden ml-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden border-t border-slate-200 bg-white">
              <div className="py-4 space-y-3">
                <div className="flex justify-center">
                  <StatsPeriodToggle 
                    period={period}
                    onPeriodChange={setPeriod}
                  />
                </div>
                <div className="text-sm text-slate-700 px-3 py-2 bg-slate-50 rounded-lg">
                  Campagne : <span className="font-semibold">{campaign.name}</span>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    navigate('/dashboard');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full justify-start"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour au dashboard
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Message d'information si pas de données */}
        {stats.totalClicks === 0 && stats.totalConversions === 0 && (
          <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="p-3 bg-blue-100 rounded-full w-fit">
                <Globe className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Aucune donnée disponible</h3>
                <p className="text-blue-700">
                  {period === 'current-month' 
                    ? "Aucune activité détectée ce mois-ci. Les statistiques apparaîtront dès que vos affiliés génèreront du trafic."
                    : "Cette campagne n'a pas encore généré de clics ou de conversions. Les statistiques apparaîtront dès que vos affiliés commenceront à générer du trafic."
                  }
                </p>
              </div>
            </div>
          </div>
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
            <div className="xl:col-span-1">
              <div className="bg-gradient-to-br from-emerald-50/50 via-white to-green-50/30 rounded-2xl p-6 shadow-lg border border-white/50 h-full">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-emerald-600" />
                  Métriques Avancées
                </h3>
                <div className="space-y-4">
                  <div className="bg-white/60 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      <span className="text-xl font-bold text-blue-600">{additionalMetrics.activeAffiliates}</span>
                    </div>
                    <p className="text-sm text-slate-600">Affiliés actifs</p>
                  </div>

                  <div className="bg-white/60 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      <span className="text-lg font-bold text-green-600">
                        {new Intl.NumberFormat('fr-FR', {
                          style: 'currency',
                          currency: 'EUR',
                          minimumFractionDigits: 0,
                        }).format(additionalMetrics.avgCommissionPerAffiliate)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">Commission moy./affilié</p>
                  </div>

                  <div className="bg-white/60 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Target className="h-5 w-5 text-purple-600" />
                      <span className="text-xl font-bold text-purple-600">{additionalMetrics.profitMargin.toFixed(1)}%</span>
                    </div>
                    <p className="text-sm text-slate-600">Marge bénéficiaire</p>
                  </div>

                  <div className="bg-white/60 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Award className="h-5 w-5 text-orange-600" />
                      <span className="text-lg font-bold text-orange-600">
                        {new Intl.NumberFormat('fr-FR', {
                          style: 'currency',
                          currency: 'EUR',
                          minimumFractionDigits: 2,
                        }).format(additionalMetrics.avgRevenuePerClick)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">CA moyen/clic</p>
                  </div>
                </div>
              </div>
            </div>

            {/* HALL OF FAME */}
            <div className="xl:col-span-1 relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-400/10 via-purple-500/10 to-blue-400/10 rounded-2xl blur-lg animate-pulse" style={{ animationDuration: '3s' }}></div>
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-400/8 via-blue-500/8 to-purple-400/8 rounded-xl blur-md animate-pulse" style={{ animationDelay: '1.5s', animationDuration: '4s' }}></div>
              
              <div className="relative bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 rounded-2xl p-6 shadow-2xl border-none h-full overflow-hidden transform hover:scale-[1.01] transition-all duration-700 z-10">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-pulse" style={{ animationDuration: '4s' }}></div>
                
                <div className="absolute top-3 left-3">
                  <Star className="h-4 w-4 text-blue-200 fill-current animate-pulse" style={{ animationDuration: '2s' }} />
                </div>
                <div className="absolute top-6 right-6">
                  <Star className="h-3 w-3 text-indigo-100 fill-current animate-pulse" style={{ animationDelay: '0.7s', animationDuration: '2.5s' }} />
                </div>
                <div className="absolute bottom-3 right-3">
                  <Star className="h-4 w-4 text-purple-200 fill-current animate-pulse" style={{ animationDelay: '1.2s', animationDuration: '3s' }} />
                </div>
                <div className="absolute bottom-6 left-6">
                  <Star className="h-2 w-2 text-blue-100 fill-current animate-pulse" style={{ animationDelay: '1.8s', animationDuration: '2.2s' }} />
                </div>

                <div className="relative z-10 h-full flex flex-col justify-center text-center">
                  <div className="flex items-center justify-center mb-6">
                    <Crown className="h-8 w-8 text-white drop-shadow-lg mr-2 animate-pulse" style={{ animationDuration: '2.5s' }} />
                    <h3 className="text-xl font-black text-white drop-shadow-lg">HALL OF FAME</h3>
                  </div>

                  <div className="mb-6">
                    <div className="text-2xl font-black text-white mb-2 drop-shadow-lg break-words">
                      {stats.behavioralMetrics.topPerformingAffiliate.name}
                    </div>
                    <div className="text-sm text-white/90 font-bold">
                      🏆 TOP PERFORMER
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                      <div className="text-3xl font-black text-white mb-1 drop-shadow-lg">
                        {stats.behavioralMetrics.topPerformingAffiliate.conversionRate.toFixed(1)}%
                      </div>
                      <div className="text-xs font-bold text-white/90 uppercase tracking-wide">
                        Taux de conversion
                      </div>
                    </div>

                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                      <div className="text-2xl font-black text-white mb-1 drop-shadow-lg">
                        {new Intl.NumberFormat('fr-FR', {
                          style: 'currency',
                          currency: 'EUR',
                          minimumFractionDigits: 0,
                        }).format(getTopPerformerRevenue())}
                      </div>
                      <div className="text-xs font-bold text-white/90 uppercase tracking-wide">
                        CA rapporté
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-center">
                    <div className="bg-emerald-500/30 backdrop-blur-sm rounded-full px-3 py-1 border border-emerald-400/50 flex items-center gap-1 animate-pulse" style={{ animationDuration: '2.8s' }}>
                      <TrendingUp className="h-3 w-3 text-white" />
                      <span className="text-xs font-bold text-white">EN FORME</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Div avec animation après les métriques avancées */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/3 via-transparent to-white/3 animate-pulse" style={{ animationDelay: '2s', animationDuration: '5s' }}></div>

          {/* Section 3: Graphiques et performance financière */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            
            {/* Performance Financière compacte (1/4) */}
            <div className="xl:col-span-1">
              <div className="bg-gradient-to-br from-emerald-50/50 via-white to-green-50/30 rounded-2xl p-6 shadow-lg border border-white/50 h-full">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-emerald-600" />
                  Finance
                </h3>
                <div className="space-y-4">
                  <div className="bg-white/60 rounded-lg p-4">
                    <div className="text-xl font-bold text-emerald-600 mb-1">
                      {new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'EUR',
                        minimumFractionDigits: 0,
                      }).format(stats.totalRevenue)}
                    </div>
                    <p className="text-sm text-slate-600">CA Total</p>
                  </div>
                  <div className="bg-white/60 rounded-lg p-4">
                    <div className="text-xl font-bold text-purple-600 mb-1">
                      {stats.conversionRate.toFixed(1)}%
                    </div>
                    <p className="text-sm text-slate-600">Taux de conversion</p>
                  </div>
                </div>
              </div>
            </div>

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
