
import { Shield, Star, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PricingHeaderProps {
  onGetStarted: () => void;
}

export const PricingHeader = ({ onGetStarted }: PricingHeaderProps) => {
  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 relative pt-8">
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] animate-pulse"></div>
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header with badge */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-100 to-blue-100 text-green-800 px-6 py-3 rounded-full text-sm font-medium mb-8 border border-green-200/50 backdrop-blur-sm animate-scale-in">
            <Shield className="w-4 h-4" />
            Une offre pour tous
            <Star className="w-4 h-4 text-yellow-500" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            RefSpring vs les autres plateformes
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Il y a RefSpring et il y a les autres, c'est tout
          </p>
        </div>

        {/* Pricing Comparison */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Traditional Model - All Others */}
          <div className="bg-white border-2 border-slate-200 p-8 rounded-2xl shadow-lg">
            <div className="text-center mb-6">
              <div className="bg-slate-100 text-slate-600 px-4 py-2 rounded-full text-sm font-medium mb-4">
                Toutes les autres plateformes
              </div>
              <div className="text-4xl font-bold text-slate-600 mb-2">
                99-299€<span className="text-lg text-slate-500">/mois</span>
              </div>
              <p className="text-slate-500">+ commission variable</p>
            </div>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-3">
                <X className="w-5 h-5 text-red-500" />
                <span>Frais mensuels fixes</span>
              </li>
              <li className="flex items-center gap-3">
                <X className="w-5 h-5 text-red-500" />
                <span>Engagement contractuel</span>
              </li>
              <li className="flex items-center gap-3">
                <X className="w-5 h-5 text-red-500" />
                <span>Coûts même sans revenus</span>
              </li>
              <li className="flex items-center gap-3">
                <X className="w-5 h-5 text-red-500" />
                <span>Risque financier élevé</span>
              </li>
              <li className="flex items-center gap-3">
                <X className="w-5 h-5 text-red-500" />
                <span>Fonctionnalités bridées en freemium</span>
              </li>
            </ul>
          </div>

          {/* RefSpring */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-4 border-blue-500 p-8 rounded-2xl shadow-2xl transform scale-105">
            <div className="text-center mb-6">
              <div className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
                RefSpring
              </div>
              <div className="text-4xl font-bold text-blue-600 mb-2">
                0€<span className="text-lg text-slate-500">/mois</span>
              </div>
              <p className="text-slate-600">2,5% sur vos gains uniquement</p>
            </div>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-blue-500" />
                <span className="font-semibold">Aucun frais fixe</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-blue-500" />
                <span className="font-semibold">Aucun engagement</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-blue-500" />
                <span className="font-semibold">Payez seulement si vous gagnez</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-blue-500" />
                <span className="font-semibold">Risque zéro</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-blue-500" />
                <span className="font-semibold">Toutes les fonctionnalités incluses</span>
              </li>
            </ul>
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 hover:scale-105 transition-all text-lg py-3" 
              onClick={onGetStarted}
            >
              Commencer maintenant
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
