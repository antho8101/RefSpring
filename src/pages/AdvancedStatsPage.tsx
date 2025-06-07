
import { useParams, useNavigate } from 'react-router-dom';
import { useAdvancedStatsExtended } from '@/hooks/useAdvancedStatsExtended';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useStatsFilters } from '@/hooks/useStatsFilters';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Globe, Menu, Crown, Star, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AdvancedStatsCharts } from '@/components/AdvancedStatsCharts';
import { AdvancedStatsAffiliateTable } from '@/components/AdvancedStatsAffiliateTable';
import { AdvancedStatsEvolution } from '@/components/AdvancedStatsEvolution';
import { AdvancedStatsTimeAnalysis } from '@/components/AdvancedStatsTimeAnalysis';
import { AdvancedStatsBehavioralMetrics } from '@/components/AdvancedStatsBehavioralMetrics';
import { StatsPeriodToggle } from '@/components/StatsPeriodToggle';

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
      // Calculer le CA basé sur les commissions et le taux de commission
      const revenue = topAffiliate.commissionRate > 0 
        ? (topAffiliate.commissions / topAffiliate.commissionRate) * 100
        : topAffiliate.commissions * 10; // Estimation si pas de taux
      return revenue;
    }
    
    // Fallback: utiliser une estimation basée sur les métriques comportementales
    if (stats.behavioralMetrics.averageOrderValue > 0) {
      return stats.behavioralMetrics.averageOrderValue * stats.behavioralMetrics.topPerformingAffiliate.conversionRate;
    }
    
    return 0;
  };

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

        {/* Layout asymétrique principal */}
        <div className="space-y-8">
          
          {/* Section 1: Évolution des performances (pleine largeur) */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
            <AdvancedStatsEvolution evolution={stats.evolution} />
          </div>

          {/* Section 2: Layout 2/3 - 1/3 */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            
            {/* Colonne gauche (2/3) - Métriques comportementales */}
            <div className="xl:col-span-2">
              <div className="bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30 rounded-2xl p-6 shadow-lg border border-white/50">
                <AdvancedStatsBehavioralMetrics behavioralMetrics={stats.behavioralMetrics} />
              </div>
            </div>

            {/* Colonne droite (1/3) - HALL OF FAME avec glow discret mais animé */}
            <div className="xl:col-span-1 relative">
              {/* Effet glow discret avec pulse doux */}
              <div className="absolute -inset-3 bg-gradient-to-r from-blue-400/20 via-purple-500/20 to-blue-400/20 rounded-2xl blur-xl animate-pulse"></div>
              <div className="absolute -inset-2 bg-gradient-to-r from-purple-400/15 via-blue-500/15 to-purple-400/15 rounded-xl blur-lg animate-pulse" style={{ animationDelay: '1s' }}></div>
              
              {/* Carte principale avec rotation subtile */}
              <div className="relative bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 rounded-2xl p-6 shadow-2xl border-none h-full overflow-hidden transform hover:scale-105 transition-all duration-300 z-10 animate-pulse" style={{ animationDuration: '3s' }}>
                {/* Effet de brillance animé qui tourne */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-pulse"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 via-transparent to-white/5 animate-pulse" style={{ animationDelay: '1.5s', animationDuration: '4s' }}></div>
                
                {/* Étoiles en arrière-plan avec animations décalées */}
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

                {/* Contenu du Hall of Fame */}
                <div className="relative z-10 h-full flex flex-col justify-center text-center">
                  {/* Titre avec couronne */}
                  <div className="flex items-center justify-center mb-6">
                    <Crown className="h-8 w-8 text-white drop-shadow-lg mr-2 animate-pulse" style={{ animationDuration: '2.5s' }} />
                    <h3 className="text-xl font-black text-white drop-shadow-lg">HALL OF FAME</h3>
                  </div>

                  {/* Nom de l'affilié */}
                  <div className="mb-6">
                    <div className="text-2xl font-black text-white mb-2 drop-shadow-lg break-words">
                      {stats.behavioralMetrics.topPerformingAffiliate.name}
                    </div>
                    <div className="text-sm text-white/90 font-bold">
                      🏆 TOP PERFORMER
                    </div>
                  </div>

                  {/* Stats principales */}
                  <div className="space-y-4">
                    {/* Taux de conversion */}
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                      <div className="text-3xl font-black text-white mb-1 drop-shadow-lg">
                        {stats.behavioralMetrics.topPerformingAffiliate.conversionRate.toFixed(1)}%
                      </div>
                      <div className="text-xs font-bold text-white/90 uppercase tracking-wide">
                        Taux de conversion
                      </div>
                    </div>

                    {/* CA rapporté */}
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

                  {/* Badge tendance */}
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

          {/* Section 3: Layout 1/3 - 2/3 inversé */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            
            {/* Colonne gauche (1/3) - Résumé financier */}
            <div className="xl:col-span-1">
              <div className="bg-gradient-to-br from-emerald-50/50 via-white to-green-50/30 rounded-2xl p-6 shadow-lg border border-white/50 h-full">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">💰 Performance Financière</h3>
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

            {/* Colonne droite (2/3) - Graphiques */}
            <div className="xl:col-span-2">
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
