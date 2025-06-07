
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Zap, MousePointer, Eye } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';

interface HeroSectionProps {
  scrollY: number;
  onRedirectToDashboard: () => void;
}

export const HeroSection = ({ scrollY, onRedirectToDashboard }: HeroSectionProps) => {
  const { t } = useTranslation();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleEasterEggClick = () => {
    setClickCount(prev => prev + 1);
    if (clickCount === 6) {
      alert('🎉 Félicitations ! Vous avez trouvé notre easter egg ! Bientôt une surprise pour les plus curieux...');
      setClickCount(0);
    }
  };

  return (
    <section className="relative min-h-screen flex flex-col justify-between px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Simple Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50"></div>
      
      <div className="max-w-6xl mx-auto text-center relative z-20 flex-grow flex flex-col justify-center">
        {/* Clear explanation badge */}
        <div className="mb-8 animate-bounce-in" style={{ animationDelay: '0.2s' }}>
          <span className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-100 to-purple-100 border-2 border-blue-300 rounded-full text-blue-800 font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105">
            <Zap className="w-6 h-6 animate-pulse text-yellow-500" />
            PLATEFORME D'AFFILIATION RÉVOLUTIONNAIRE
            <Eye className="w-5 h-5 animate-bounce" />
          </span>
        </div>

        {/* Super clear main title */}
        <h1 className="text-4xl md:text-6xl font-bold mb-8 animate-fade-in-scale leading-tight">
          <span className="bg-gradient-to-r from-slate-900 via-blue-600 to-purple-600 bg-clip-text text-transparent">
            Créez votre programme d'affiliation
          </span>
          <br />
          <span className="relative text-slate-900">
            et payez{" "}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-black animate-pulse text-shadow-none" style={{ textShadow: '0 4px 8px rgba(59, 130, 246, 0.3)' }}>
                SEULEMENT
              </span>
            </span>
            {" "}quand ça marche ! 
          </span>
        </h1>

        {/* Ultra simple explanation */}
        <p className="text-xl md:text-2xl text-slate-700 mb-12 max-w-5xl mx-auto leading-relaxed animate-fade-in font-medium" style={{ animationDelay: '0.4s' }}>
          <span className="text-2xl">Créez votre programme d'affiliation et ne payez que quand vos affiliés vous ramènent des ventes ! 💰</span>
        </p>

        {/* Enhanced CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <Button 
            size="lg" 
            className="group relative text-lg px-12 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-2xl hover:shadow-blue-500/25 transition-all hover:scale-105 active:scale-95 overflow-hidden" 
            onClick={onRedirectToDashboard}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
            <span className="relative flex items-center gap-2">
              Créer mon programme d'affiliation
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              <Sparkles className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity animate-spin" />
            </span>
          </Button>
          
          <Button 
            size="lg" 
            variant="outline" 
            className="text-lg px-12 py-6 border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 shadow-lg hover:shadow-xl transition-all hover:scale-105 group"
            onClick={() => document.getElementById('dashboard')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <span className="flex items-center gap-2">
              Voir comment ça marche
              <Eye className="w-5 h-5 group-hover:animate-bounce" />
            </span>
          </Button>
        </div>
      </div>

      {/* Fun Stats with Easter Eggs - Moved to bottom */}
      <div className="grid md:grid-cols-3 gap-8 mb-8 animate-fade-in relative z-20" style={{ animationDelay: '0.8s' }}>
        <div className="group text-center hover:scale-110 transition-transform cursor-default">
          <div className="text-4xl font-bold text-blue-600 mb-2 group-hover:animate-bounce">€50M+</div>
          <div className="text-slate-600">Revenus générés par nos utilisateurs</div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-slate-400 mt-1">
            🎯 Et ce n'est que le début !
          </div>
        </div>
        <div className="group text-center hover:scale-110 transition-transform cursor-default">
          <div className="text-4xl font-bold text-green-600 mb-2 group-hover:animate-pulse">€0</div>
          <div className="text-slate-600">Frais mensuels à payer</div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-slate-400 mt-1">
            💰 Gardez votre argent pour vous !
          </div>
        </div>
        <div className="group text-center hover:scale-110 transition-transform cursor-default">
          <div className="text-4xl font-bold text-purple-600 mb-2 group-hover:animate-spin">2.5%</div>
          <div className="text-slate-600">Notre commission sur vos revenus générés</div>
          <div className="text-xs text-slate-500 mt-1">
            Le reste : pour vous et vos affiliés ! 🤝
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-slate-400 mt-1">
            🏢 Vous fixez librement vos taux affiliés !
          </div>
        </div>
      </div>
    </section>
  );
};
