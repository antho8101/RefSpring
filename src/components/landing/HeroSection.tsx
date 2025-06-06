
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle, PlayCircle } from "lucide-react";

interface HeroSectionProps {
  scrollY: number;
  onRedirectToDashboard: () => void;
}

export const HeroSection = ({ scrollY, onRedirectToDashboard }: HeroSectionProps) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 pb-16 overflow-hidden">
      {/* Hero Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <Badge 
          variant="secondary" 
          className="mb-8 px-6 py-2 text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors animate-fade-in"
        >
          €0 frais mensuels • Rémunération basée sur les performances uniquement
        </Badge>
        
        <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold mb-8 animate-fade-in-up">
          Enfin une plateforme{" "}
          <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent animate-gradient-x">
            qui se paie toute seule
          </span>
        </h1>
        
        <p className="text-xl sm:text-2xl text-slate-600 mb-4 max-w-4xl mx-auto leading-relaxed animate-fade-in-up animation-delay-200">
          <span className="font-semibold text-slate-800">Modèle basé sur les revenus :</span>{" "}
          accès gratuit, nous gagnons seulement quand vous gagnez.
        </p>

        <div className="flex flex-wrap justify-center gap-6 mb-12 animate-fade-in-up animation-delay-400">
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">€0 frais d'installation</span>
          </div>
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">€0 abonnement mensuel</span>
          </div>
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">Accès complet à la plateforme</span>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16 animate-fade-in-up animation-delay-600">
          <Button 
            onClick={onRedirectToDashboard}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-4 text-lg shadow-2xl hover:shadow-blue-500/25 hover:scale-105 transition-all duration-300 border-0"
          >
            Commencer gratuitement
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          
          <Button 
            variant="outline" 
            size="lg"
            className="border-2 border-slate-200 hover:bg-slate-50 px-8 py-4 text-lg hover:scale-105 transition-all duration-300"
          >
            <PlayCircle className="mr-2 h-5 w-5" />
            Voir comment ça marche
          </Button>
        </div>

        {/* Social Proof */}
        <div 
          className="animate-fade-in-up animation-delay-800"
          style={{ transform: `translateY(${scrollY * 0.1}px)` }}
        >
          <p className="text-slate-500 mb-6 font-medium">
            Adoptée par les entreprises qui veulent des résultats, pas des factures récurrentes
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-12">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-slate-800 mb-1">50M€+</div>
              <div className="text-sm text-slate-600">Générés</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-green-600 mb-1">€0</div>
              <div className="text-sm text-slate-600">D'avance</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
