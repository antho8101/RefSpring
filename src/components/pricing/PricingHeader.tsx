
import { Shield, Star, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PricingHeaderProps {
  onGetStarted: () => void;
}

export const PricingHeader = ({ onGetStarted }: PricingHeaderProps) => {
  const handleGetStarted = () => {
    window.location.href = '/app?signup=true';
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/30 relative pt-20 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-purple-500/8 to-pink-500/8 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] bg-[size:14px_24px] opacity-20"></div>
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-8">
        {/* Header with badge */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 px-6 py-3 rounded-full text-sm font-bold mb-8 border border-blue-200/50 shadow-lg hover:shadow-xl transition-all hover:scale-105">
            <Zap className="w-4 h-4 animate-pulse text-yellow-500" />
            Le modèle qui change tout
            <Star className="w-4 h-4 text-yellow-400 animate-pulse" />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 leading-tight">
            RefSpring vs <span className="text-slate-500">les autres</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Spoiler : ils te font payer avant que tu gagnes 💸
          </p>
        </div>

        {/* Pricing Battle */}
        <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto items-center">
          {/* Les Autres - Deprecated */}
          <div className="relative opacity-60 transform scale-90 hover:scale-95 transition-all duration-500">
            <div className="absolute -inset-2 bg-gradient-to-r from-red-500 to-red-600 rounded-3xl opacity-20 blur-xl"></div>
            <div className="relative bg-white border-2 border-red-200 p-8 rounded-3xl shadow-lg">
              <div className="text-center mb-6">
                <div className="bg-red-100 text-red-600 px-4 py-2 rounded-full text-sm font-bold mb-4 border border-red-200">
                  💀 Toutes les autres plateformes
                </div>
                <div className="text-4xl font-black text-red-500 mb-2">
                  199-499€<span className="text-lg text-slate-500">/mois</span>
                </div>
                <p className="text-slate-500 font-medium">+ commission de ouf</p>
              </div>
              <ul className="space-y-3 mb-6 text-sm">
                <li className="flex items-center gap-3">
                  <X className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <span className="text-slate-600">Tu paies même si tu vends rien</span>
                </li>
                <li className="flex items-center gap-3">
                  <X className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <span className="text-slate-600">Engagement 12 mois minimum</span>
                </li>
                <li className="flex items-center gap-3">
                  <X className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <span className="text-slate-600">Interface de 2005</span>
                </li>
                <li className="flex items-center gap-3">
                  <X className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <span className="text-slate-600">Support par email uniquement</span>
                </li>
                <li className="flex items-center gap-3">
                  <X className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <span className="text-slate-600">Setup compliqué</span>
                </li>
              </ul>
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                <p className="text-red-600 font-bold text-sm">💸 Risque total sur tes épaules</p>
              </div>
            </div>
          </div>

          {/* RefSpring - The Hero Treatment */}
          <div className="relative group transform scale-105 hover:scale-110 transition-all duration-700">
            {/* Main card with hero styling */}
            <div className="relative bg-white/95 backdrop-blur-sm border-4 border-slate-200 p-10 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 group-hover:border-blue-300">
              <div className="relative z-10">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 border-2 border-blue-300 rounded-full text-blue-800 font-black text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 px-6 py-3 mb-6">
                    <Zap className="w-6 h-6 animate-pulse text-yellow-500" />
                    🚀 RefSpring 🚀
                  </div>
                  <div className="text-7xl font-black bg-gradient-to-r from-slate-900 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-3 animate-pulse">
                    0€<span className="text-2xl text-slate-400">/mois</span>
                  </div>
                  <p className="text-slate-700 font-bold text-xl">2,5% seulement sur tes gains</p>
                </div>
                <ul className="space-y-4 mb-8 text-base">
                  <li className="flex items-center gap-3 group/item hover:scale-105 transition-transform">
                    <span className="font-bold text-slate-900 group-hover/item:text-blue-700 transition-colors">✨ Tu paies que si tu gagnes</span>
                  </li>
                  <li className="flex items-center gap-3 group/item hover:scale-105 transition-transform">
                    <span className="font-bold text-slate-900 group-hover/item:text-purple-700 transition-colors">⚡ Setup en 10 minutes chrono</span>
                  </li>
                  <li className="flex items-center gap-3 group/item hover:scale-105 transition-transform">
                    <span className="font-bold text-slate-900 group-hover/item:text-green-700 transition-colors">🎯 Dashboard qui déchire</span>
                  </li>
                  <li className="flex items-center gap-3 group/item hover:scale-105 transition-transform">
                    <span className="font-bold text-slate-900 group-hover/item:text-blue-700 transition-colors">🔒 Tracking au pixel près</span>
                  </li>
                  <li className="flex items-center gap-3 group/item hover:scale-105 transition-transform">
                    <span className="font-bold text-slate-900 group-hover/item:text-purple-700 transition-colors">💰 Paiements automatiques</span>
                  </li>
                </ul>
                <Button 
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-black px-8 py-6 shadow-2xl hover:shadow-3xl hover:scale-105 transition-all text-xl rounded-2xl border-2 border-blue-300 group-hover:border-purple-300 animate-pulse"
                  onClick={handleGetStarted}
                >
                  🎯 Tester maintenant (c'est gratuit)
                </Button>
                <p className="text-center text-slate-600 text-sm mt-4 font-bold">
                  ✓ Aucune CB ✓ Accès immédiat ✓ Zéro bullshit
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16 animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <p className="text-lg text-slate-600 mb-6">
            Sérieusement, pourquoi payer <span className="font-bold text-red-500">avant</span> de gagner ? 🤷‍♂️
          </p>
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-6 py-3 rounded-full text-sm font-bold border border-green-200">
            <Shield className="w-4 h-4" />
            Risque zéro, résultats max
          </div>
        </div>
      </div>
    </section>
  );
};
