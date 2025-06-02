
import { useParams, useNavigate } from 'react-router-dom';
import { useAdvancedStats } from '@/hooks/useAdvancedStats';
import { useCampaigns } from '@/hooks/useCampaigns';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Globe } from 'lucide-react';
import { useEffect } from 'react';
import { AdvancedStatsMetrics } from '@/components/AdvancedStatsMetrics';
import { AdvancedStatsCharts } from '@/components/AdvancedStatsCharts';
import { AdvancedStatsAffiliateTable } from '@/components/AdvancedStatsAffiliateTable';

const AdvancedStatsPage = () => {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const { campaigns } = useCampaigns();
  const { stats, loading } = useAdvancedStats(campaignId);

  const campaign = campaigns.find(c => c.id === campaignId);

  // Debug: afficher les stats dans la console
  useEffect(() => {
    if (!loading) {
      console.log('📊 STATS AFFICHÉES:', stats);
    }
  }, [stats, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="text-slate-600 font-medium">Chargement des statistiques avancées...</p>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-6">
          <h1 className="text-3xl font-bold text-slate-900">Campagne introuvable</h1>
          <p className="text-slate-600">Cette campagne n'existe pas ou vous n'y avez pas accès.</p>
          <Button onClick={() => navigate('/dashboard')} size="lg" className="bg-blue-600 hover:bg-blue-700">
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
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">RefSpring</h1>
              <p className="text-sm text-slate-600">Statistiques Avancées</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Message d'information si pas de données */}
        {stats.totalClicks === 0 && stats.totalConversions === 0 && (
          <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <Globe className="h-5 w-5 text-blue-400 mt-0.5" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Aucune donnée disponible</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>Cette campagne n'a pas encore généré de clics ou de conversions. Les statistiques apparaîtront dès que vos affiliés commenceront à générer du trafic.</p>
                </div>
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
