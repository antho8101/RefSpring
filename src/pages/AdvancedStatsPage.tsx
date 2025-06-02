
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
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      {/* Header intégré dans le contenu */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Statistiques Avancées</h1>
            <p className="text-lg text-slate-600">Campagne : <span className="font-semibold text-slate-900">{campaign.name}</span></p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard')}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </div>

        {/* Métriques principales - responsive grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white border-slate-200 shadow-lg hover:shadow-xl transition-all">
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
                <div className="h-full bg-blue-600 rounded-full transition-all w-full"></div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 shadow-lg hover:shadow-xl transition-all">
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

          <Card className="bg-white border-slate-200 shadow-lg hover:shadow-xl transition-all">
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

          <Card className="bg-white border-slate-200 shadow-lg hover:shadow-xl transition-all">
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
                  className="h-full bg-orange-600 rounded-full transition-all"
                  style={{ width: `${Math.min(stats.conversionRate * 2, 100)}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Graphiques - responsive grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          {/* Évolution des clics */}
          <Card className="bg-white border-slate-200 shadow-lg hover:shadow-xl transition-all">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-900">Évolution des clics</CardTitle>
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
          <Card className="bg-white border-slate-200 shadow-lg hover:shadow-xl transition-all">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-900">Répartition financière</CardTitle>
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
          <Card className="bg-white border-slate-200 shadow-lg hover:shadow-xl transition-all">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-900">Évolution du CA</CardTitle>
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
          <Card className="bg-white border-slate-200 shadow-lg hover:shadow-xl transition-all">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-900">Top Affiliés</CardTitle>
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
        <Card className="bg-white border-slate-200 shadow-lg hover:shadow-xl transition-all">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-900">Performance détaillée des affiliés</CardTitle>
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
      </div>
    </div>
  );
};

export default AdvancedStatsPage;
