
import { TrendingUp, Users, BarChart3, Target, Zap, Eye, Sparkles, Coffee, Clock } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export const DashboardPreview = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [isVisible, setIsVisible] = useState(false);
  const [animatedNumbers, setAnimatedNumbers] = useState({
    revenue: 0,
    affiliates: 0,
    conversions: 0
  });
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            setTimeout(() => {
              setAnimatedNumbers({ revenue: 8547, affiliates: 23, conversions: 89 });
            }, 500);
          }
        });
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isVisible) {
      const duration = 2000;
      const steps = 60;
      const stepTime = duration / steps;
      
      let currentStep = 0;
      const timer = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        
        setAnimatedNumbers({
          revenue: Math.floor(8547 * progress),
          affiliates: Math.floor(23 * progress),
          conversions: Math.floor(89 * progress)
        });
        
        if (currentStep >= steps) {
          clearInterval(timer);
        }
      }, stepTime);
      
      return () => clearInterval(timer);
    }
  }, [isVisible]);

  const mockData = {
    overview: {
      revenue: `€${animatedNumbers.revenue.toLocaleString()}`,
      affiliates: animatedNumbers.affiliates.toString(),
      growth: "+18%",
      conversions: animatedNumbers.conversions.toString()
    },
    analytics: {
      conversionRate: "3.2%",
      avgOrderValue: "€96",
      topAffiliate: "Marie L.",
      bestDay: "Mardi"
    }
  };

  return (
    <section ref={sectionRef} id="dashboard" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-900 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl animate-bounce"></div>
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-green-500/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-gradient-to-r from-slate-700 to-slate-800 rounded-full border border-slate-600">
            <Sparkles className="w-5 h-5 text-yellow-400 animate-spin" />
            <span className="text-slate-300 font-semibold">Aperçu Dashboard</span>
            <Eye className="w-4 h-4 text-blue-400 animate-pulse" />
          </div>
          <h2 className={`text-4xl md:text-5xl font-bold text-white mb-6 transition-all duration-700 ${
            isVisible ? 'animate-fade-in-scale' : 'opacity-0 translate-y-10'
          }`}>
            Votre tableau de bord vous attend 🚀
          </h2>
          <p className={`text-xl text-slate-300 max-w-3xl mx-auto transition-all duration-700 ${
            isVisible ? 'animate-fade-in' : 'opacity-0 translate-y-5'
          }`} style={{ animationDelay: '0.2s' }}>
            Un dashboard <strong className="text-blue-400">simple et efficace</strong> pour suivre vos performances. 
            <br />
            Tout ce dont vous avez besoin, rien de superflu ! 😎
          </p>
        </div>
        
        <div className={`relative max-w-6xl mx-auto transition-all duration-1000 ${
          isVisible ? 'animate-fade-in-scale opacity-100' : 'opacity-0 scale-95'
        }`} style={{ animationDelay: '0.4s' }}>
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-3xl shadow-2xl border border-slate-700 hover:shadow-slate-700/50 transition-all">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden group">
              <div className="flex items-center gap-3 px-6 py-4 bg-slate-50 border-b">
                <div className="w-3 h-3 bg-red-500 rounded-full hover:animate-pulse cursor-pointer"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full hover:animate-pulse cursor-pointer"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full hover:animate-pulse cursor-pointer"></div>
                <div className="ml-auto flex items-center gap-2 text-sm text-slate-500">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Live</span>
                  </div>
                  <span>dashboard.refspring.com</span>
                </div>
              </div>
              
              <div className="flex border-b bg-white">
                {[
                  { id: "overview", label: "Vue d'ensemble", emoji: "📊" },
                  { id: "analytics", label: "Analytics", emoji: "🔍" },
                  { id: "affiliates", label: "Affiliés", emoji: "👥" }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`group px-6 py-3 font-medium transition-all relative overflow-hidden ${
                      activeTab === tab.id 
                        ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50" 
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="group-hover:animate-bounce">{tab.emoji}</span>
                      {tab.label}
                    </span>
                    {activeTab !== tab.id && (
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 opacity-0 group-hover:opacity-50 transition-opacity"></div>
                    )}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {activeTab === "overview" && (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-4 gap-4">
                      {[
                        { icon: TrendingUp, value: mockData.overview.revenue, label: "CA ce mois", color: "blue", trend: "📈" },
                        { icon: Users, value: mockData.overview.affiliates, label: "Affiliés actifs", color: "green", trend: "🔥" },
                        { icon: BarChart3, value: mockData.overview.growth, label: "Croissance", color: "purple", trend: "🚀" },
                        { icon: Target, value: mockData.overview.conversions, label: "Conversions", color: "orange", trend: "💰" }
                      ].map((stat, index) => (
                        <div key={index} className={`bg-gradient-to-br from-${stat.color}-50 to-${stat.color}-100 p-4 rounded-xl hover:scale-105 transition-transform group cursor-default border border-${stat.color}-200`}>
                          <div className="flex items-center gap-2 mb-2">
                            <stat.icon className={`w-6 h-6 text-${stat.color}-600 group-hover:animate-bounce`} />
                            <div className="text-xl font-bold text-slate-900 group-hover:scale-110 transition-transform">
                              {stat.value}
                            </div>
                            <div className="ml-auto text-lg group-hover:animate-spin">{stat.trend}</div>
                          </div>
                          <div className="text-sm text-slate-600">{stat.label}</div>
                          <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 mt-2">
                            <div className="text-xs text-slate-500 italic">
                              {index === 0 && "🎯 En croissance constante !"}
                              {index === 1 && "⭐ Taux de rétention: 87%"}
                              {index === 2 && "📊 Objectif dépassé !"}
                              {index === 3 && "🏆 Nouveau record !"}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="h-48 bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 rounded-xl flex items-center justify-center group hover:shadow-lg transition-all cursor-default">
                      <div className="text-center">
                        <BarChart3 className="w-12 h-12 text-slate-600 mx-auto mb-2 group-hover:animate-bounce" />
                        <div className="text-slate-600 font-medium group-hover:text-slate-800 transition-colors">Graphiques de performance</div>
                        <div className="text-sm text-slate-500 flex items-center justify-center gap-2 mt-1">
                          <span>Évolution du CA, clics, conversions...</span>
                          <Clock className="w-4 h-4 animate-spin" />
                        </div>
                        <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="text-xs text-slate-400">📍 Données actualisées en continu</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "analytics" && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                          <Zap className="w-5 h-5 text-yellow-500 animate-pulse" />
                          Métriques clés
                        </h3>
                        <div className="space-y-3">
                          {[
                            { label: "Taux de conversion", value: mockData.analytics.conversionRate, color: "green" },
                            { label: "Panier moyen", value: mockData.analytics.avgOrderValue, color: "blue" },
                            { label: "Meilleur affilié", value: mockData.analytics.topAffiliate, color: "purple" }
                          ].map((metric, index) => (
                            <div key={index} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors group">
                              <span className="text-slate-600">{metric.label}</span>
                              <span className={`font-bold text-${metric.color}-600 group-hover:scale-110 transition-transform`}>
                                {metric.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                          <Coffee className="w-5 h-5 text-brown-500" />
                          Analyse temporelle
                        </h3>
                        <div className="h-32 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg flex items-center justify-center group hover:shadow-lg transition-all">
                          <div className="text-center">
                            <Eye className="w-8 h-8 text-slate-600 mx-auto mb-1 group-hover:animate-spin" />
                            <div className="text-sm text-slate-600">Évolution des performances</div>
                            <div className="opacity-0 group-hover:opacity-100 text-xs text-slate-500 mt-1">📊 Tendances détaillées</div>
                          </div>
                        </div>
                        <div className="text-center p-3 bg-amber-50 rounded-lg border border-amber-200 hover:bg-amber-100 transition-colors">
                          <div className="text-sm text-amber-700">💡 Votre meilleur jour : <strong>{mockData.analytics.bestDay}</strong></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "affiliates" && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-600 animate-pulse" />
                        Vos affiliés
                      </h3>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors hover:scale-105 flex items-center gap-2 group">
                        <span>+ Nouvel affilié</span>
                        <Sparkles className="w-4 h-4 group-hover:animate-spin" />
                      </button>
                    </div>
                    
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <div className="grid grid-cols-4 gap-4 text-sm font-medium text-slate-600 mb-3">
                        <div>Nom</div>
                        <div>Clics</div>
                        <div>Conversions</div>
                        <div>Commissions</div>
                      </div>
                      {[
                        { name: "Marie Laurent", clicks: "467", conversions: "15", commission: "€156", emoji: "🌟" },
                        { name: "Thomas Dupont", clicks: "321", conversions: "9", commission: "€94", emoji: "🚀" },
                        { name: "Sophie Chen", clicks: "298", conversions: "12", commission: "€118", emoji: "💎" }
                      ].map((affiliate, index) => (
                        <div key={index} className="grid grid-cols-4 gap-4 py-3 border-b border-slate-200 last:border-b-0 hover:bg-white rounded transition-colors group">
                          <div className="font-medium text-slate-900 flex items-center gap-2">
                            <span className="group-hover:animate-bounce">{affiliate.emoji}</span>
                            {affiliate.name}
                          </div>
                          <div className="text-slate-600 group-hover:font-medium transition-all">{affiliate.clicks}</div>
                          <div className="text-green-600 font-medium group-hover:scale-110 transition-transform">{affiliate.conversions}</div>
                          <div className="text-blue-600 font-bold group-hover:animate-pulse">{affiliate.commission}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-16">
          {[
            { icon: Zap, title: "Temps réel", desc: "Toutes vos métriques se mettent à jour en direct. Suivez chaque vente instantanément ! ⚡", color: "blue" },
            { icon: BarChart3, title: "Analytics claires", desc: "Graphiques simples, données précises. Comprenez vos performances d'un coup d'œil ! 📊", color: "green" },
            { icon: Users, title: "Gestion simple", desc: "Invitez et gérez vos affiliés facilement. Interface intuitive, pas de prise de tête ! 👥", color: "purple" }
          ].map((feature, index) => (
            <div key={index} className={`text-center group hover:scale-105 transition-all duration-300 animate-fade-in`} style={{ animationDelay: `${0.8 + index * 0.2}s` }}>
              <div className={`w-16 h-16 bg-${feature.color}-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:animate-bounce group-hover:shadow-lg transition-all`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">{feature.title}</h3>
              <p className="text-slate-300 group-hover:text-slate-200 transition-colors">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
