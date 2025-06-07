
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Star } from "lucide-react";

interface PricingCTAProps {
  onGetStarted: () => void;
}

export const PricingCTA = ({ onGetStarted }: PricingCTAProps) => {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-white/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
      
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-full text-sm font-bold mb-6 border border-white/30">
            <Zap className="w-4 h-4 animate-pulse" />
            Action time
            <Star className="w-4 h-4 animate-pulse" />
          </div>
        </div>
        <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
          Alors, on y va ? 🚀
        </h2>
        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed font-medium">
          Rejoins les entrepreneurs qui ont choisi le bon camp.
          <br />
          <span className="font-bold">Zéro risque, résultats max.</span>
        </p>
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Button 
            size="lg" 
            variant="secondary" 
            className="text-xl px-12 py-6 bg-white text-slate-900 hover:bg-slate-100 hover:scale-110 transition-all shadow-2xl font-black border-4 border-white/50" 
            onClick={onGetStarted}
          >
            🎯 Créer mon compte (gratuit)
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="text-xl px-12 py-6 border-4 border-white text-white hover:bg-white hover:text-slate-900 hover:scale-110 transition-all font-bold backdrop-blur-sm"
            onClick={() => document.getElementById('dashboard')?.scrollIntoView({ behavior: 'smooth' })}
          >
            👀 Voir le dashboard
          </Button>
        </div>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <p className="text-white font-bold text-sm">✓ Aucune CB requise</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <p className="text-white font-bold text-sm">✓ Accès complet immédiat</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <p className="text-white font-bold text-sm">✓ Support inclus</p>
          </div>
        </div>
        <p className="text-blue-200 text-lg mt-6 font-bold">
          Pendant que tu hésites, tes concurrents économisent déjà 💸
        </p>
      </div>
    </section>
  );
};
