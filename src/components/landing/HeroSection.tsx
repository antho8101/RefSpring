
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
    <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Simple Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50"></div>
      
      <div className="max-w-6xl mx-auto text-center relative z-20">
        {/* Easter Egg Logo */}
        <div 
          className="mb-8 cursor-pointer transition-transform hover:scale-110 active:scale-95"
          onClick={handleEasterEggClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="flex items-center justify-center gap-2 text-6xl mb-4">
            <span className={`transition-all duration-300 ${clickCount > 3 ? 'animate-spin' : ''}`}>🌸</span>
            <span className="font-bold text-slate-900 hover:text-blue-600 transition-colors">RefSpring</span>
            {clickCount > 0 && <Sparkles className="w-8 h-8 text-yellow-500 animate-bounce" />}
          </div>
        </div>

        {/* Animated Subtitle Badge */}
        <div className="mb-8 animate-bounce-in" style={{ animationDelay: '0.2s' }}>
          <span className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-full text-blue-700 font-medium shadow-lg hover:shadow-xl transition-all hover:scale-105">
            <Zap className="w-5 h-5 animate-pulse text-yellow-500" />
            {t('hero.badge')} 
            <Eye className="w-4 h-4 animate-bounce" />
          </span>
        </div>

        {/* Main Title with Gradient Animation */}
        <h1 className="text-5xl md:text-7xl font-bold mb-8 animate-fade-in-scale leading-tight">
          <span className="bg-gradient-to-r from-slate-900 via-blue-600 to-purple-600 bg-clip-text text-transparent animate-pulse">
            {t('hero.title.part1')}
          </span>
          <br />
          <span className="relative">
            {t('hero.title.part2')}
            <div className="absolute -inset-2 bg-gradient-to-r from-blue-400 to-purple-400 opacity-20 blur-xl rounded-lg animate-pulse"></div>
          </span>
        </h1>

        {/* Animated Description */}
        <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-4xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <span className="font-semibold text-slate-900">Fini les 99-299€/mois à balancer dans le vide ! 💸</span>
          <br />
          Avec RefSpring, on gagne seulement quand <em>vous</em> gagnez. 
          <span className="inline-flex items-center gap-1 ml-2 text-green-600 font-bold">
            Malin, non ? 😉 <MousePointer className="w-5 h-5 animate-bounce" />
          </span>
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
              {t('hero.cta.start')}
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
              {t('hero.cta.demo')}
              <Eye className="w-5 h-5 group-hover:animate-bounce" />
            </span>
          </Button>
        </div>

        {/* Fun Stats with Easter Eggs */}
        <div className="grid md:grid-cols-3 gap-8 mt-16 animate-fade-in" style={{ animationDelay: '0.8s' }}>
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
            <div className="text-slate-600">Commission uniquement sur les ventes</div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-slate-400 mt-1">
              🤝 Équitable pour tous !
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
