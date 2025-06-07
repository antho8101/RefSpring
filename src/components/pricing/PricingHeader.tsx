
import { Shield, Star, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PricingHeaderProps {
  onGetStarted: () => void;
}

export const PricingHeader = ({ onGetStarted }: PricingHeaderProps) => {
  const handleGetStarted = () => {
    window.location.href = '/app?signup=true';
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 relative pt-8">
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] animate-pulse"></div>
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header with badge */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-100 to-blue-100 text-green-800 px-6 py-3 rounded-full text-sm font-medium mb-8 border border-green-200/50 backdrop-blur-sm animate-scale-in">
            <Shield className="w-4 h-4" />
            Le seul modèle équitable
            <Star className="w-4 h-4 text-yellow-500" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            RefSpring vs les autres plateformes
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            On vous explique pourquoi on est différent
          </p>
        </div>

        {/* Pricing Comparison */}
        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto items-center">
          {/* Traditional Model - All Others */}
          <div className="bg-gray-50/70 border border-gray-200/50 p-6 rounded-lg shadow-sm opacity-75 transform scale-90">
            <div className="text-center mb-4">
              <div className="bg-gray-200 text-gray-600 px-3 py-1.5 rounded-full text-xs font-medium mb-3">
                Toutes les autres plateformes
              </div>
              <div className="text-2xl font-semibold text-gray-600 mb-1">
                199-499€<span className="text-sm text-gray-500">/mois</span>
              </div>
              <p className="text-gray-500 text-sm">+ commission variable</p>
            </div>
            <ul className="space-y-2 mb-4 text-sm">
              <li className="flex items-center gap-2">
                <X className="w-4 h-4 text-red-400" />
                <span className="text-gray-600">Frais mensuels fixes énormes</span>
              </li>
              <li className="flex items-center gap-2">
                <X className="w-4 h-4 text-red-400" />
                <span className="text-gray-600">Engagement sur 12 mois</span>
              </li>
              <li className="flex items-center gap-2">
                <X className="w-4 h-4 text-red-400" />
                <span className="text-gray-600">Vous payez même sans revenus</span>
              </li>
              <li className="flex items-center gap-2">
                <X className="w-4 h-4 text-red-400" />
                <span className="text-gray-600">Interface complexe</span>
              </li>
              <li className="flex items-center gap-2">
                <X className="w-4 h-4 text-red-400" />
                <span className="text-gray-600">Support payant</span>
              </li>
            </ul>
          </div>

          {/* RefSpring */}
          <div className="relative group transform scale-110">
            {/* Multiple animated glow layers */}
            <div className="absolute -inset-3 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 rounded-3xl opacity-20 group-hover:opacity-40 blur-2xl animate-pulse transition-opacity duration-500"></div>
            <div className="absolute -inset-2 bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 rounded-3xl opacity-30 animate-pulse blur-xl" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 rounded-2xl opacity-40 animate-pulse blur-lg" style={{ animationDelay: '1s' }}></div>
            
            {/* Main card with enhanced styling */}
            <div className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 border-4 border-transparent bg-clip-padding p-10 rounded-3xl shadow-2xl backdrop-blur-sm">
              {/* Animated border overlay */}
              <div className="absolute inset-0 rounded-3xl border-2 border-gradient-to-r from-blue-500 via-purple-500 to-green-500 animate-pulse opacity-50"></div>
              
              <div className="relative z-10">
                <div className="text-center mb-8">
                  <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 text-white px-6 py-3 rounded-full text-base font-bold mb-6 animate-pulse shadow-lg">
                    ⭐ RefSpring ⭐
                  </div>
                  <div className="text-6xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent mb-3 animate-pulse">
                    0€<span className="text-2xl text-slate-500">/mois</span>
                  </div>
                  <p className="text-slate-700 font-semibold text-lg">2,5% sur vos gains uniquement</p>
                </div>
                <ul className="space-y-4 mb-8 text-base">
                  <li className="flex items-center gap-3">
                    <div className="bg-gradient-to-r from-green-400 to-green-600 rounded-full p-1">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-slate-800">✨ Aucun frais fixe</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="bg-gradient-to-r from-green-400 to-green-600 rounded-full p-1">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-slate-800">🚀 Setup en 10 minutes</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="bg-gradient-to-r from-green-400 to-green-600 rounded-full p-1">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-slate-800">💰 Dashboard simple et clair</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="bg-gradient-to-r from-green-400 to-green-600 rounded-full p-1">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-slate-800">🛡️ Tracking fiable</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="bg-gradient-to-r from-green-400 to-green-600 rounded-full p-1">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-slate-800">🎯 Paiements automatiques</span>
                  </li>
                </ul>
                <Button 
                  className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 hover:from-blue-700 hover:via-purple-700 hover:to-green-700 text-white font-bold px-8 py-4 shadow-2xl hover:shadow-3xl hover:scale-105 transition-all text-xl rounded-2xl border-2 border-white/50"
                  onClick={handleGetStarted}
                >
                  🚀 Tester gratuitement 🚀
                </Button>
                <p className="text-center text-slate-600 text-sm mt-4 font-medium">
                  ✓ Aucune carte bancaire requise ✓ Accès immédiat
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
