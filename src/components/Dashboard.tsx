
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useAffiliates } from '@/hooks/useAffiliates';
import { useGlobalStats } from '@/hooks/useGlobalStats';
import { LogOut, Settings, Users, BarChart3, Plus, TrendingUp, DollarSign, Zap, Globe, Percent } from 'lucide-react';
import { CreateCampaignDialog } from '@/components/CreateCampaignDialog';
import { CampaignsList } from '@/components/CampaignsList';
import { useEffect, useState } from 'react';

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const { campaigns } = useCampaigns();
  const { affiliates } = useAffiliates();
  const { stats: globalStats, loading: globalStatsLoading } = useGlobalStats();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const activeCampaigns = campaigns.filter(c => c.isActive).length;
  const totalAffiliates = affiliates.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 relative overflow-hidden">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div 
          className="absolute top-20 right-10 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl animate-pulse"
          style={{ transform: `translateY(${scrollY * 0.1}px)` }}
        ></div>
        <div 
          className="absolute top-1/2 left-10 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl animate-pulse"
          style={{ transform: `translateY(${scrollY * -0.05}px)` }}
        ></div>
        <div 
          className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-green-500/5 rounded-full blur-2xl animate-pulse"
          style={{ transform: `translateY(${scrollY * 0.15}px)` }}
        ></div>
      </div>

      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] animate-pulse pointer-events-none"></div>

      <div className="absolute inset-0 pointer-events-none">
        <DollarSign 
          className="absolute top-1/4 left-1/4 w-8 h-8 text-green-500/10 animate-bounce" 
          style={{ animationDelay: '0s', animationDuration: '3s' }}
        />
        <TrendingUp 
          className="absolute top-1/3 right-1/3 w-6 h-6 text-blue-500/10 animate-bounce" 
          style={{ animationDelay: '1s', animationDuration: '4s' }}
        />
        <Zap 
          className="absolute bottom-1/3 left-1/5 w-7 h-7 text-purple-500/10 animate-bounce" 
          style={{ animationDelay: '2s', animationDuration: '3.5s' }}
        />
        <Globe 
          className="absolute top-1/5 right-1/5 w-9 h-9 text-indigo-500/10 animate-bounce" 
          style={{ animationDelay: '0.5s', animationDuration: '4.5s' }}
        />
      </div>

      {/* Header */}
      <header className="relative z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="animate-fade-in">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                RefSpring
              </h1>
              <p className="text-sm text-slate-600 font-medium">Dashboard</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-slate-700 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200">
                Bonjour, <span className="font-semibold">{user?.displayName || user?.email}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="hover:scale-105 transition-all shadow-lg backdrop-blur-sm"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 animate-fade-in">
          <Card className="bg-gradient-to-br from-white to-blue-50/50 border-slate-200/50 shadow-xl hover:shadow-2xl transition-all hover:scale-105 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">Campagnes Actives</CardTitle>
              <div className="p-2 bg-blue-100 rounded-full">
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 mb-1">{activeCampaigns}</div>
              <p className="text-xs text-slate-500">
                sur {campaigns.length} campagne{campaigns.length > 1 ? 's' : ''}
              </p>
              <div className="mt-2 h-1 bg-blue-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all"
                  style={{ width: campaigns.length > 0 ? `${(activeCampaigns / campaigns.length) * 100}%` : '0%' }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-green-50/50 border-slate-200/50 shadow-xl hover:shadow-2xl transition-all hover:scale-105 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">Total Affiliés</CardTitle>
              <div className="p-2 bg-green-100 rounded-full">
                <Users className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 mb-1">{totalAffiliates}</div>
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

          <Card className="bg-gradient-to-br from-white to-purple-50/50 border-slate-200/50 shadow-xl hover:shadow-2xl transition-all hover:scale-105 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">CA Net</CardTitle>
              <div className="p-2 bg-purple-100 rounded-full">
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 mb-1">
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

          <Card className="bg-gradient-to-br from-white to-orange-50/50 border-slate-200/50 shadow-xl hover:shadow-2xl transition-all hover:scale-105 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">Taux Conversion</CardTitle>
              <div className="p-2 bg-orange-100 rounded-full">
                <Percent className="h-5 w-5 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 mb-1">
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

        {/* Actions & Campaigns */}
        <div className="space-y-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Mes Campagnes</h2>
              <p className="text-slate-600">Gérez vos campagnes d'affiliation en temps réel</p>
            </div>
            <CreateCampaignDialog />
          </div>
          
          <div className="relative">
            <CampaignsList />
          </div>
        </div>
      </main>
    </div>
  );
};
