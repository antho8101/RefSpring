
import { Shield, Star, Check, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PricingHeaderProps {
  onGetStarted: () => void;
}

export const PricingHeader = ({ onGetStarted }: PricingHeaderProps) => {
  const handleGetStarted = () => {
    window.location.href = '/app?signup=true';
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 relative pt-8 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] opacity-30"></div>
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header with badge */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-100 to-blue-100 text-green-800 px-6 py-3 rounded-full text-sm font-bold mb-8 border border-green-200/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all hover:scale-105">
            <Zap className="w-4 h-4 animate-pulse" />
            Le modèle qui change tout
            <Star className="w-4 h-4 text-yellow-500 animate-pulse" />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 leading-tight">
            RefSpring vs <span className="text-slate-400">les autres</span>
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
            <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-300 p-8 rounded-3xl shadow-lg">
              <div className="text-center mb-6">
                <div className="bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-bold mb-4 border border-red-200">
                  💀 Toutes les autres plateformes
                </div>
                <div className="text-4xl font-black text-gray-600 mb-2">
                  199-499€<span className="text-lg text-gray-500">/mois</span>
                </div>
                <p className="text-gray-500 font-medium">+ commission de ouf</p>
              </div>
              <ul className="space-y-3 mb-6 text-sm">
                <li className="flex items-center gap-3">
                  <X className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <span className="text-gray-700">Tu paies même si tu vends rien</span>
                </li>
                <li className="flex items-center gap-3">
                  <X className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <span className="text-gray-700">Engagement 12 mois minimum</span>
                </li>
                <li className="flex items-center gap-3">
                  <X className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <span className="text-gray-700">Interface de 2005</span>
                </li>
                <li className="flex items-center gap-3">
                  <X className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <span className="text-gray-700">Support par email uniquement</span>
                </li>
                <li className="flex items-center gap-3">
                  <X className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <span className="text-gray-700">Setup compliqué</span>
                </li>
              </ul>
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                <p className="text-red-700 font-bold text-sm">💸 Risque total sur tes épaules</p>
              </div>
            </div>
          </div>

          {/* RefSpring - The Future */}
          <div className="relative group transform scale-110 hover:scale-115 transition-all duration-500">
            {/* Multiple animated glow layers */}
            <div className="absolute -inset-6 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 rounded-3xl opacity-20 group-hover:opacity-30 blur-3xl animate-pulse transition-opacity duration-700"></div>
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 rounded-3xl opacity-30 animate-pulse blur-2xl" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 rounded-3xl opacity-40 animate-pulse blur-xl" style={{ animationDelay: '1s' }}></div>
            
            {/* Main card */}
            <div className="relative bg-gradient-to-br from-white via-blue-50/50 to-purple-50/50 border-4 border-transparent bg-clip-padding p-10 rounded-3xl shadow-2xl backdrop-blur-sm">
              {/* Animated border */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 opacity-20 animate-pulse"></div>
              
              <div className="relative z-10">
                <div className="text-center mb-8">
                  <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 text-white px-6 py-3 rounded-full text-base font-black mb-6 shadow-lg animate-pulse">
                    🚀 RefSpring 🚀
                  </div>
                  <div className="text-7xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent mb-3">
                    0€<span className="text-2xl text-slate-500">/mois</span>
                  </div>
                  <p className="text-slate-700 font-bold text-xl">2,5% seulement sur tes gains</p>
                </div>
                <ul className="space-y-4 mb-8 text-base">
                  <li className="flex items-center gap-3 group hover:scale-105 transition-transform">
                    <div className="bg-gradient-to-r from-green-400 to-green-600 rounded-full p-1.5 shadow-lg">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-slate-800">✨ Tu paies que si tu gagnes</span>
                  </li>
                  <li className="flex items-center gap-3 group hover:scale-105 transition-transform">
                    <div className="bg-gradient-to-r from-green-400 to-green-600 rounded-full p-1.5 shadow-lg">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-slate-800">⚡ Setup en 5 minutes chrono</span>
                  </li>
                  <li className="flex items-center gap-3 group hover:scale-105 transition-transform">
                    <div className="bg-gradient-to-r from-green-400 to-green-600 rounded-full p-1.5 shadow-lg">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-slate-800">🎯 Dashboard qui déchire</span>
                  </li>
                  <li className="flex items-center gap-3 group hover:scale-105 transition-transform">
                    <div className="bg-gradient-to-r from-green-400 to-green-600 rounded-full p-1.5 shadow-lg">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-slate-800">🔒 Tracking au pixel près</span>
                  </li>
                  <li className="flex items-center gap-3 group hover:scale-105 transition-transform">
                    <div className="bg-gradient-to-r from-green-400 to-green-600 rounded-full p-1.5 shadow-lg">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-slate-800">💰 Paiements automatiques</span>
                  </li>
                </ul>
                <Button 
                  className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 hover:from-blue-700 hover:via-purple-700 hover:to-green-700 text-white font-black px-8 py-6 shadow-2xl hover:shadow-3xl hover:scale-105 transition-all text-xl rounded-2xl border-2 border-white/50"
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
            Sérieusement, pourquoi payer <span className="font-bold text-red-600">avant</span> de gagner ? 🤷‍♂️
          </p>
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-6 py-3 rounded-full text-sm font-bold border border-green-200">
            <Shield className="w-4 h-4" />
            Risque zéro, résultats max
          </div>
        </div>
      </div>
    </section>
  );
};
