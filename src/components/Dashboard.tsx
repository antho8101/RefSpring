
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useAffiliates } from '@/hooks/useAffiliates';
import { useGlobalStats } from '@/hooks/useGlobalStats';
import { LogOut, Settings, Users, BarChart3, Plus, TrendingUp, DollarSign, Zap, Globe, Percent, Menu } from 'lucide-react';
import { CreateCampaignDialog } from '@/components/CreateCampaignDialog';
import { CampaignsList } from '@/components/CampaignsList';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const { campaigns } = useCampaigns();
  const { affiliates } = useAffiliates();
  const { stats: globalStats, loading: globalStatsLoading } = useGlobalStats();
  const [scrollY, setScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      {/* Floating Background Elements - Hidden on mobile for performance */}
      <div className="fixed inset-0 pointer-events-none hidden lg:block">
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

      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] animate-pulse pointer-events-none opacity-30 lg:opacity-100"></div>

      <div className="absolute inset-0 pointer-events-none hidden lg:block">
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
            {/* Logo */}
            <Link to="/landing" className="animate-fade-in hover:opacity-80 transition-opacity flex-shrink-0">
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                RefSpring
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">Dashboard</p>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-4">
              <Link to="/advanced-stats">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="hover:scale-105 transition-all shadow-lg backdrop-blur-sm bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 hover:border-blue-300"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Statistiques Avancées
                </Button>
              </Link>
              <div className="text-sm text-slate-700 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200 max-w-[200px] truncate">
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

            {/* Mobile Menu Button */}
            <Button
              variant="outline"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden border-t border-slate-200/80 bg-white/95 backdrop-blur-xl">
              <div className="py-4 space-y-3">
                <div className="text-sm text-slate-700 px-4 py-2 bg-slate-50 rounded-lg">
                  Bonjour, <span className="font-semibold">{user?.displayName || user?.email}</span>
                </div>
                <Link 
                  to="/advanced-stats" 
                  className="block"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Statistiques Avancées
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogout}
                  className="w-full justify-start"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Déconnexion
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8 animate-fade-in">
          <Card className="bg-gradient-to-br from-white to-blue-50/50 border-slate-200/50 shadow-xl hover:shadow-2xl transition-all hover:scale-105 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">Campagnes Actives</CardTitle>
              <div className="p-2 bg-blue-100 rounded-full">
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">{activeCampaigns}</div>
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
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">{totalAffiliates}</div>
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
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 mb-1">
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
                <Percent className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">
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
        <div className="space-y-4 sm:space-y-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">Mes Campagnes</h2>
              <p className="text-slate-600 text-sm sm:text-base">Gérez vos campagnes d'affiliation en temps réel</p>
            </div>
            <div className="flex-shrink-0">
              <CreateCampaignDialog />
            </div>
          </div>
          
          <div className="relative">
            <CampaignsList />
          </div>
        </div>
      </main>
    </div>
  );
};
