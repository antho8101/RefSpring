
import { TrendingUp, Users, BarChart3, Target, Zap, Eye } from "lucide-react";
import { useState } from "react";

export const DashboardPreview = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const mockData = {
    overview: {
      revenue: "€12,847",
      affiliates: "847",
      growth: "+23%",
      conversions: "234"
    },
    analytics: {
      conversionRate: "4.2%",
      avgOrderValue: "€89",
      topAffiliate: "Marie L.",
      bestDay: "Mardi"
    }
  };

  return (
    <section id="dashboard" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-900">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Votre command center vous attend
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Un dashboard aussi intuitif et puissant que vous ne l'avez jamais eu. 
            Suivez vos performances en temps réel, analysez vos affiliés et optimisez vos campagnes.
          </p>
        </div>
        
        {/* Interactive Dashboard Demo */}
        <div className="relative max-w-6xl mx-auto">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-3xl shadow-2xl border border-slate-700">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              {/* Browser Header */}
              <div className="flex items-center gap-3 px-6 py-4 bg-slate-50 border-b">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div className="ml-auto text-sm text-slate-500">dashboard.refspring.com</div>
              </div>
              
              {/* Dashboard Tabs */}
              <div className="flex border-b bg-white">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`px-6 py-3 font-medium transition-all ${
                    activeTab === "overview" 
                      ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50" 
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Vue d'ensemble
                </button>
                <button
                  onClick={() => setActiveTab("analytics")}
                  className={`px-6 py-3 font-medium transition-all ${
                    activeTab === "analytics" 
                      ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50" 
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Analytics avancées
                </button>
                <button
                  onClick={() => setActiveTab("affiliates")}
                  className={`px-6 py-3 font-medium transition-all ${
                    activeTab === "affiliates" 
                      ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50" 
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Gestion des affiliés
                </button>
              </div>

              {/* Dashboard Content */}
              <div className="p-6">
                {activeTab === "overview" && (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-4 gap-4">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="w-6 h-6 text-blue-600" />
                          <div className="text-xl font-bold text-slate-900">{mockData.overview.revenue}</div>
                        </div>
                        <div className="text-sm text-slate-600">CA ce mois</div>
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="w-6 h-6 text-green-600" />
                          <div className="text-xl font-bold text-slate-900">{mockData.overview.affiliates}</div>
                        </div>
                        <div className="text-sm text-slate-600">Affiliés actifs</div>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <BarChart3 className="w-6 h-6 text-purple-600" />
                          <div className="text-xl font-bold text-slate-900">{mockData.overview.growth}</div>
                        </div>
                        <div className="text-sm text-slate-600">Croissance</div>
                      </div>
                      <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="w-6 h-6 text-orange-600" />
                          <div className="text-xl font-bold text-slate-900">{mockData.overview.conversions}</div>
                        </div>
                        <div className="text-sm text-slate-600">Conversions</div>
                      </div>
                    </div>
                    
                    <div className="h-48 bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                      <div className="text-center">
                        <BarChart3 className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                        <div className="text-slate-600 font-medium">Graphiques interactifs en temps réel</div>
                        <div className="text-sm text-slate-500">Évolution du CA, clics, conversions...</div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "analytics" && (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="font-semibold text-slate-900">Métriques comportementales</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                            <span className="text-slate-600">Taux de conversion</span>
                            <span className="font-bold text-green-600">{mockData.analytics.conversionRate}</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                            <span className="text-slate-600">Panier moyen</span>
                            <span className="font-bold text-blue-600">{mockData.analytics.avgOrderValue}</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                            <span className="text-slate-600">Meilleur affilié</span>
                            <span className="font-bold text-purple-600">{mockData.analytics.topAffiliate}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h3 className="font-semibold text-slate-900">Analyse temporelle</h3>
                        <div className="h-32 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg flex items-center justify-center">
                          <div className="text-center">
                            <Eye className="w-8 h-8 text-slate-600 mx-auto mb-1" />
                            <div className="text-sm text-slate-600">Heatmap des performances</div>
                          </div>
                        </div>
                        <div className="text-center p-3 bg-amber-50 rounded-lg">
                          <div className="text-sm text-amber-700">💡 Votre meilleur jour : <strong>{mockData.analytics.bestDay}</strong></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "affiliates" && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-slate-900">Vos affiliés</h3>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">
                        + Nouvel affilié
                      </button>
                    </div>
                    
                    <div className="bg-slate-50 rounded-lg p-4">
                      <div className="grid grid-cols-4 gap-4 text-sm font-medium text-slate-600 mb-3">
                        <div>Nom</div>
                        <div>Clics</div>
                        <div>Conversions</div>
                        <div>Commissions</div>
                      </div>
                      {[
                        { name: "Marie Laurent", clicks: "1,247", conversions: "52", commission: "€524" },
                        { name: "Thomas Dupont", clicks: "892", conversions: "31", commission: "€310" },
                        { name: "Sarah Chen", clicks: "1,105", conversions: "47", commission: "€470" }
                      ].map((affiliate, index) => (
                        <div key={index} className="grid grid-cols-4 gap-4 py-3 border-b border-slate-200 last:border-b-0">
                          <div className="font-medium text-slate-900">{affiliate.name}</div>
                          <div className="text-slate-600">{affiliate.clicks}</div>
                          <div className="text-green-600 font-medium">{affiliate.conversions}</div>
                          <div className="text-blue-600 font-bold">{affiliate.commission}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Temps réel</h3>
            <p className="text-slate-300">Toutes vos métriques se mettent à jour instantanément. Suivez chaque clic, chaque conversion en live.</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Analytics poussées</h3>
            <p className="text-slate-300">Analyse comportementale, heatmaps temporelles, prédictions de performance et bien plus.</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Gestion simplifiée</h3>
            <p className="text-slate-300">Invitez, gérez et payez vos affiliés en quelques clics. Email automatique des commissions.</p>
          </div>
        </div>
      </div>
    </section>
  );
};
