
import { useParams, useNavigate } from 'react-router-dom';
import { useAdvancedStats } from '@/hooks/useAdvancedStats';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useStatsFilters } from '@/hooks/useStatsFilters';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Globe, Menu } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AdvancedStatsMetrics } from '@/components/AdvancedStatsMetrics';
import { AdvancedStatsCharts } from '@/components/AdvancedStatsCharts';
import { AdvancedStatsAffiliateTable } from '@/components/AdvancedStatsAffiliateTable';
import { StatsPeriodSelector } from '@/components/StatsPeriodSelector';

const AdvancedStatsPage = () => {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const { campaigns } = useCampaigns();
  const { period, setPeriod, getDateFilter, getPeriodLabel } = useStatsFilters();
  const { stats, loading } = useAdvancedStats(campaignId, getDateFilter());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const campaign = campaigns.find(c => c.id === campaignId);

  // Debug: afficher les stats dans la console
  useEffect(() => {
    if (!loading) {
      console.log(`📊 STATS AFFICHÉES (${getPeriodLabel()}):`, stats);
    }
  }, [stats, loading, getPeriodLabel]);

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
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 truncate">RefSpring</h1>
              <p className="text-xs sm:text-sm text-slate-600">Statistiques Avancées - {getPeriodLabel()}</p>
            </div>
            
            {/* Desktop Header */}
            <div className="hidden lg:flex items-center space-x-4">
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
      <main className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Sélecteur de période */}
        <div className="mb-6 sm:mb-8 flex justify-center">
          <StatsPeriodSelector 
            period={period}
            onPeriodChange={setPeriod}
            className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm"
          />
        </div>

        {/* Message d'information si pas de données */}
        {stats.totalClicks === 0 && stats.totalConversions === 0 && (
          <div className="mb-6 sm:mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Globe className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-blue-800 mb-2">Aucune donnée disponible</h3>
                <p className="text-sm text-blue-700">
                  {period === 'current-month' 
                    ? "Aucune activité détectée ce mois-ci. Les statistiques apparaîtront dès que vos affiliés génèreront du trafic."
                    : "Cette campagne n'a pas encore généré de clics ou de conversions. Les statistiques apparaîtront dès que vos affiliés commenceront à générer du trafic."
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Métriques */}
        <AdvancedStatsMetrics stats={stats} loading={loading} />

        {/* Graphiques */}
        <AdvancedStatsCharts 
          dailyStats={stats.dailyStats}
          totalRevenue={stats.totalRevenue}
          netRevenue={stats.netRevenue}
          totalCommissions={stats.totalCommissions}
        />

        {/* Tableau des affiliés */}
        <AdvancedStatsAffiliateTable affiliates={stats.topAffiliates} />
      </main>
    </div>
  );
};

export default AdvancedStatsPage;
