
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Star, DollarSign, TrendingUp, Zap, Globe } from "lucide-react";

interface HeroSectionProps {
  scrollY: number;
  onRedirectToDashboard: () => void;
}

export const HeroSection = ({ scrollY, onRedirectToDashboard }: HeroSectionProps) => {
  return (
    <section className="pt-20 pb-16 flex items-center justify-center bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 relative">
      {/* Animated Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] animate-pulse"></div>
      
      {/* Floating Icons */}
      <div className="absolute inset-0 pointer-events-none">
        <DollarSign 
          className="absolute top-1/4 left-1/4 w-8 h-8 text-green-500/20 animate-bounce" 
          style={{ animationDelay: '0s', animationDuration: '3s' }}
        />
        <TrendingUp 
          className="absolute top-1/3 right-1/3 w-6 h-6 text-blue-500/20 animate-bounce" 
          style={{ animationDelay: '1s', animationDuration: '4s' }}
        />
        <Zap 
          className="absolute bottom-1/3 left-1/5 w-7 h-7 text-purple-500/20 animate-bounce" 
          style={{ animationDelay: '2s', animationDuration: '3.5s' }}
        />
        <Globe 
          className="absolute top-1/5 right-1/5 w-9 h-9 text-indigo-500/20 animate-bounce" 
          style={{ animationDelay: '0.5s', animationDuration: '4.5s' }}
        />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="animate-fade-in space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 px-6 py-3 rounded-full text-sm font-medium border border-blue-200/50 backdrop-blur-sm animate-scale-in">
            <CheckCircle className="w-4 h-4" />
            0€ de frais mensuels • Rémunération sur performance uniquement
            <Star className="w-4 h-4 text-yellow-500" />
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-slate-900 leading-tight">
            Enfin une plateforme
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent animate-pulse">
              qui paie pour elle-même
            </span>
          </h1>
          
          <p className="text-lg md:text-xl lg:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed" style={{ animationDelay: '0.2s' }}>
            <strong>Modèle basé sur les revenus :</strong> 
            <br />
            <span className="text-slate-900 font-semibold">Accès gratuit, nous gagnons seulement quand vous gagnez.</span>
          </p>

          {/* Value props with animations */}
          <div className="flex flex-wrap justify-center gap-4 lg:gap-6">
            {[
              { icon: CheckCircle, text: "0€ de frais d'installation", delay: "0.3s" },
              { icon: CheckCircle, text: "0€ d'abonnement mensuel", delay: "0.4s" },
              { icon: CheckCircle, text: "Accès complet à la plateforme", delay: "0.5s" }
            ].map((item, index) => (
              <div 
                key={index}
                className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 lg:px-6 lg:py-3 rounded-full border border-slate-200 hover:scale-105 transition-all animate-fade-in shadow-lg"
                style={{ animationDelay: item.delay }}
              >
                <item.icon className="w-4 h-4 lg:w-5 lg:h-5 text-green-600" />
                <span className="text-sm lg:text-base text-slate-700 font-medium">{item.text}</span>
              </div>
            ))}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 lg:gap-6 justify-center" style={{ animationDelay: '0.6s' }}>
            <Button 
              size="lg" 
              className="text-lg px-8 py-4 lg:px-12 lg:py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-2xl hover:shadow-3xl transition-all hover:scale-105 border-0 text-white" 
              onClick={onRedirectToDashboard}
            >
              Commencer à gagner dès aujourd'hui
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 py-4 lg:px-12 lg:py-6 border-2 hover:bg-slate-50 shadow-lg hover:scale-105 transition-all backdrop-blur-sm" 
              onClick={onRedirectToDashboard}
            >
              Voir comment ça marche
            </Button>
          </div>

          {/* Social proof with animation */}
          <div className="pt-12 border-t border-slate-200/50" style={{ animationDelay: '0.8s' }}>
            <p className="text-slate-500 text-sm mb-6">Adopté par les entreprises qui veulent des résultats, pas des factures récurrentes</p>
            <div className="flex justify-center items-center gap-6 lg:gap-8 opacity-70">
              <div className="text-2xl lg:text-3xl font-bold text-slate-600 hover:text-blue-600 transition-colors">50M€+</div>
              <div className="w-px h-6 lg:h-8 bg-slate-300"></div>
              <div className="text-base lg:text-lg font-medium text-slate-500">Générés</div>
              <div className="w-px h-6 lg:h-8 bg-slate-300"></div>
              <div className="text-2xl lg:text-3xl font-bold text-green-600">0€</div>
              <div className="w-px h-6 lg:h-8 bg-slate-300"></div>
              <div className="text-base lg:text-lg font-medium text-slate-500">D'avance</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
