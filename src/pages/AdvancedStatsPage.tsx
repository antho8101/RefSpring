
import { useParams, useNavigate } from 'react-router-dom';
import { useAdvancedStats } from '@/hooks/useAdvancedStats';
import { useCampaigns } from '@/hooks/useCampaigns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, Users, MousePointer, DollarSign, Target, Percent, Zap, Globe } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useEffect, useState } from 'react';

const AdvancedStatsPage = () => {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const { campaigns } = useCampaigns();
  const { stats, loading } = useAdvancedStats(campaignId);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const campaign = campaigns.find(c => c.id === campaignId);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 relative overflow-hidden flex items-center justify-center">
        {/* Floating Background Elements */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-20 right-10 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/2 left-10 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-green-500/5 rounded-full blur-2xl animate-pulse"></div>
        </div>

        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] animate-pulse pointer-events-none"></div>

        <div className="text-center space-y-4 relative z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="text-slate-600 font-medium">Chargement des statistiques avancées...</p>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 relative overflow-hidden flex items-center justify-center">
        {/* Floating Background Elements */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-20 right-10 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/2 left-10 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-green-500/5 rounded-full blur-2xl animate-pulse"></div>
        </div>

        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] animate-pulse pointer-events-none"></div>

        <div className="text-center space-y-6 relative z-10">
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

  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const pieData = [
    { name: 'CA Net', value: stats.netRevenue, color: '#10B981' },
    { name: 'Commissions', value: stats.totalCommissions, color: '#3B82F6' }
  ];

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
            <div className="animate-fade-in hover:opacity-80 transition-opacity">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                RefSpring
              </h1>
              <p className="text-sm text-slate-600 font-medium">Statistiques Avancées</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-slate-700 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200">
                Campagne : <span className="font-semibold">{campaign.name}</span>
              </div>
              <Button 
                variant="outline" 
                onClick={() => navigate('/dashboard')}
                className="hover:scale-105 transition-all shadow-lg backdrop-blur-sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Métriques principales - responsive grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6 mb-8 animate-fade-in">
          <Card className="bg-gradient-to-br from-white to-blue-50/50 border-slate-200/50 shadow-xl hover:shadow-2xl transition-all hover:scale-105 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">Clics totaux</CardTitle>
              <div className="p-2 bg-blue-100 rounded-full">
                <MousePointer className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 mb-1">{stats.totalClicks.toLocaleString()}</div>
              <p className="text-xs text-slate-500">Total des clics générés</p>
              <div className="mt-2 h-1 bg-blue-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all w-full"></div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-green-50/50 border-slate-200/50 shadow-xl hover:shadow-2xl transition-all hover:scale-105 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">Conversions</CardTitle>
              <div className="p-2 bg-green-100 rounded-full">
                <Target className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 mb-1">{stats.totalConversions}</div>
              <p className="text-xs text-slate-500">Actions réalisées</p>
              <div className="mt-2 flex items-center gap-1 text-green-600">
                <TrendingUp className="h-3 w-3" />
                <span className="text-xs font-medium">Conversions totales</span>
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
              <div className="text-3xl font-bold text-purple-600 mb-1">{formatCurrency(stats.netRevenue)}</div>
              <p className="text-xs text-slate-500">Chiffre d'affaires net</p>
              <div className="mt-2 text-xs text-purple-600 font-medium">
                Après commissions
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-orange-50/50 border-slate-200/50 shadow-xl hover:shadow-2xl transition-all hover:scale-105 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">Taux de conversion</CardTitle>
              <div className="p-2 bg-orange-100 rounded-full">
                <Percent className="h-5 w-5 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 mb-1">{stats.conversionRate.toFixed(2)}%</div>
              <p className="text-xs text-slate-500">Performance globale</p>
              <div className="mt-2 h-1 bg-orange-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full transition-all"
                  style={{ width: `${Math.min(stats.conversionRate * 2, 100)}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Graphiques - responsive grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8 mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          {/* Évolution des clics */}
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-xl hover:shadow-2xl transition-all">
            <CardHeader>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Évolution des clics</CardTitle>
              <CardDescription className="text-slate-600">Tendance sur les 30 derniers jours</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={stats.dailyStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                  />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString('fr-FR')}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0', 
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Area type="monotone" dataKey="clicks" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.2} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Répartition CA vs Commissions */}
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-xl hover:shadow-2xl transition-all">
            <CardHeader>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Répartition financière</CardTitle>
              <CardDescription className="text-slate-600">CA Net vs Commissions versées</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => formatCurrency(Number(value))}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0', 
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm text-slate-600">CA Net</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm text-slate-600">Commissions</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Évolution du CA */}
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-xl hover:shadow-2xl transition-all">
            <CardHeader>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Évolution du CA</CardTitle>
              <CardDescription className="text-slate-600">Chiffre d'affaires journalier</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.dailyStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                  />
                  <YAxis 
                    tickFormatter={(value) => `${value}€`}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                  />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString('fr-FR')}
                    formatter={(value) => [`${value}€`, 'CA']}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0', 
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={3} dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Affiliés */}
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-xl hover:shadow-2xl transition-all">
            <CardHeader>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Top Affiliés</CardTitle>
              <CardDescription className="text-slate-600">Classement par commissions générées</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.topAffiliates.slice(0, 5)} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" tickFormatter={(value) => `${value}€`} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip 
                    formatter={(value) => [`${value}€`, 'Commissions']}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0', 
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Bar dataKey="commissions" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Tableau des affiliés */}
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-xl hover:shadow-2xl transition-all animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <CardHeader>
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Performance détaillée des affiliés</CardTitle>
            <CardDescription className="text-slate-600">Vue d'ensemble de tous vos affiliés</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left p-3 text-sm font-semibold text-slate-700">Nom</th>
                    <th className="text-left p-3 text-sm font-semibold text-slate-700 hidden sm:table-cell">Email</th>
                    <th className="text-right p-3 text-sm font-semibold text-slate-700">Clics</th>
                    <th className="text-right p-3 text-sm font-semibold text-slate-700">Conv.</th>
                    <th className="text-right p-3 text-sm font-semibold text-slate-700 hidden md:table-cell">Taux (%)</th>
                    <th className="text-right p-3 text-sm font-semibold text-slate-700">Commissions</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topAffiliates.map((affiliate, index) => (
                    <tr key={affiliate.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <td className="p-3 font-medium text-slate-900">{affiliate.name}</td>
                      <td className="p-3 text-slate-600 hidden sm:table-cell text-sm">{affiliate.email}</td>
                      <td className="p-3 text-right text-slate-900 font-medium">{affiliate.clicks}</td>
                      <td className="p-3 text-right text-slate-900 font-medium">{affiliate.conversions}</td>
                      <td className="p-3 text-right text-slate-600 hidden md:table-cell">{affiliate.conversionRate.toFixed(1)}%</td>
                      <td className="p-3 text-right font-semibold text-emerald-600">
                        {formatCurrency(affiliate.commissions)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdvancedStatsPage;
