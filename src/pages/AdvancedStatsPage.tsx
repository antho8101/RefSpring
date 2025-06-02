
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { useAdvancedStats } from '@/hooks/useAdvancedStats';
import { ArrowLeft, TrendingUp, Users, DollarSign, Target, Download, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

export const AdvancedStatsPage = () => {
  const { stats, loading } = useAdvancedStats();

  const chartConfig = {
    clicks: {
      label: "Clics",
      color: "#3b82f6",
    },
    conversions: {
      label: "Conversions",
      color: "#10b981",
    },
    revenue: {
      label: "Revenus",
      color: "#8b5cf6",
    },
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg">Chargement des statistiques avancées...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 relative overflow-hidden">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 right-10 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-10 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-green-500/5 rounded-full blur-2xl animate-pulse"></div>
      </div>

      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] animate-pulse pointer-events-none"></div>

      {/* Header */}
      <header className="relative z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="sm" className="hover:scale-105 transition-all">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour
                </Button>
              </Link>
              <div className="animate-fade-in">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  RefSpring
                </h1>
                <p className="text-sm text-slate-600 font-medium">Statistiques Avancées</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" className="hover:scale-105 transition-all">
                <Filter className="h-4 w-4 mr-2" />
                Filtres
              </Button>
              <Button variant="outline" size="sm" className="hover:scale-105 transition-all">
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Métriques Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
          <Card className="bg-gradient-to-br from-white to-blue-50/50 border-slate-200/50 shadow-xl hover:shadow-2xl transition-all hover:scale-105 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">Taux de Conversion</CardTitle>
              <Target className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 mb-1">{stats.conversionRate.toFixed(2)}%</div>
              <p className="text-xs text-slate-500">{stats.totalConversions} conv. / {stats.totalClicks} clics</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-green-50/50 border-slate-200/50 shadow-xl hover:shadow-2xl transition-all hover:scale-105 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">CPA Moyen</CardTitle>
              <DollarSign className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 mb-1">{stats.averageCPA.toFixed(2)}€</div>
              <p className="text-xs text-slate-500">Coût par acquisition</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-purple-50/50 border-slate-200/50 shadow-xl hover:shadow-2xl transition-all hover:scale-105 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">ROAS Moyen</CardTitle>
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 mb-1">{stats.averageROAS.toFixed(2)}x</div>
              <p className="text-xs text-slate-500">Return on Ad Spend</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-orange-50/50 border-slate-200/50 shadow-xl hover:shadow-2xl transition-all hover:scale-105 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">CA Net</CardTitle>
              <DollarSign className="h-5 w-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 mb-1">{stats.netRevenue.toFixed(2)}€</div>
              <p className="text-xs text-slate-500">Après commissions</p>
            </CardContent>
          </Card>
        </div>

        {/* Graphiques Temporels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-slate-200/50">
            <CardHeader>
              <CardTitle className="text-slate-900">Évolution des Clics et Conversions</CardTitle>
              <CardDescription>Tendance sur les 30 derniers jours</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.dailyStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#64748b"
                      fontSize={12}
                      tickFormatter={(value) => new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                    />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line 
                      type="monotone" 
                      dataKey="clicks" 
                      stroke={chartConfig.clicks.color} 
                      strokeWidth={3}
                      dot={{ fill: chartConfig.clicks.color, strokeWidth: 2, r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="conversions" 
                      stroke={chartConfig.conversions.color} 
                      strokeWidth={3}
                      dot={{ fill: chartConfig.conversions.color, strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-slate-200/50">
            <CardHeader>
              <CardTitle className="text-slate-900">Revenus Journaliers</CardTitle>
              <CardDescription>CA brut généré par jour</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.dailyStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#64748b"
                      fontSize={12}
                      tickFormatter={(value) => new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                    />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar 
                      dataKey="revenue" 
                      fill={chartConfig.revenue.color}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Top Affiliés */}
        <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-slate-200/50 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <CardHeader>
            <CardTitle className="text-slate-900 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Top Affiliés Performers
            </CardTitle>
            <CardDescription>Classement par commissions générées</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topAffiliates.slice(0, 5).map((affiliate, index) => (
                <div key={affiliate.id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-lg border border-slate-200/50 hover:bg-slate-100/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                      index === 0 ? 'bg-yellow-500' : 
                      index === 1 ? 'bg-gray-400' : 
                      index === 2 ? 'bg-orange-600' : 'bg-slate-400'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{affiliate.name}</p>
                      <p className="text-sm text-slate-500">{affiliate.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">{affiliate.commissions.toFixed(2)}€</p>
                    <p className="text-sm text-slate-500">
                      {affiliate.conversions} conv. ({affiliate.conversionRate.toFixed(1)}%)
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Répartition des Performances */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-slate-200/50">
            <CardHeader>
              <CardTitle className="text-slate-900">Répartition des Commissions</CardTitle>
              <CardDescription>Top 6 affiliés par commissions</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.topAffiliates.slice(0, 6).map(affiliate => ({
                        name: affiliate.name,
                        value: affiliate.commissions,
                      }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {stats.topAffiliates.slice(0, 6).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-slate-200/50">
            <CardHeader>
              <CardTitle className="text-slate-900">Métriques Comparatives</CardTitle>
              <CardDescription>Performance par affilié</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.topAffiliates.slice(0, 5)} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" stroke="#64748b" fontSize={12} />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      stroke="#64748b" 
                      fontSize={12}
                      width={100}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar 
                      dataKey="clicks" 
                      fill={chartConfig.clicks.color}
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

      </main>
    </div>
  );
};

export default AdvancedStatsPage;
