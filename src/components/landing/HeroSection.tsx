
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Star, DollarSign, TrendingUp, Zap, Globe, ChevronDown } from "lucide-react";
import { useTranslation } from 'react-i18next';

interface HeroSectionProps {
  scrollY: number;
  onRedirectToDashboard: () => void;
}

export const HeroSection = ({ scrollY, onRedirectToDashboard }: HeroSectionProps) => {
  const { t } = useTranslation();

  return (
    <section className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 relative">
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] animate-pulse"></div>
      
      {/* Floating Icons */}
      <div className="absolute inset-0 pointer-events-none">
        <DollarSign 
          className="absolute top-1/4 left-1/4 w-8 h-8 text-green-500/20 animate-bounce opacity-0 animate-fade-in" 
          style={{ animationDelay: '2s', animationDuration: '3s' }}
        />
        <TrendingUp 
          className="absolute top-1/3 right-1/3 w-6 h-6 text-blue-500/20 animate-bounce opacity-0 animate-fade-in" 
          style={{ animationDelay: '2.5s', animationDuration: '4s' }}
        />
        <Zap 
          className="absolute bottom-1/3 left-1/5 w-7 h-7 text-purple-500/20 animate-bounce opacity-0 animate-fade-in" 
          style={{ animationDelay: '3s', animationDuration: '3.5s' }}
        />
        <Globe 
          className="absolute top-1/5 right-1/5 w-9 h-9 text-indigo-500/20 animate-bounce opacity-0 animate-fade-in" 
          style={{ animationDelay: '2.2s', animationDuration: '4.5s' }}
        />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="space-y-12">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 px-6 py-3 rounded-full text-sm font-medium border border-blue-200/50 backdrop-blur-sm opacity-0 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <CheckCircle className="w-4 h-4" />
            {t('hero.badge')}
            <Star className="w-4 h-4 text-yellow-500" />
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-slate-900 leading-tight opacity-0 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            {t('hero.title.part1')}
            <br />
            <span className="relative inline-block">
              {/* Glow background layers */}
              <span className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent blur-xl opacity-50 animate-pulse"></span>
              <span className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-600 bg-clip-text text-transparent blur-md opacity-30 animate-pulse" style={{ animationDelay: '0.5s' }}></span>
              {/* Main text */}
              <span className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                {t('hero.title.part2')}
              </span>
            </span>
          </h1>
          
          <p className="text-lg md:text-xl lg:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed opacity-0 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <strong>{t('hero.subtitle.bold')}</strong>
            <br />
            <span className="text-slate-900 font-semibold">{t('hero.subtitle.normal')}</span>
          </p>

          {/* Value props with staggered animations */}
          <div className="flex flex-wrap justify-center gap-4 lg:gap-6">
            {[
              { text: t('hero.features.noSetupFee'), delay: "0.8s" },
              { text: t('hero.features.noMonthlyFee'), delay: "1.0s" },
              { text: t('hero.features.fullAccess'), delay: "1.2s" }
            ].map((item, index) => (
              <div 
                key={index}
                className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 lg:px-6 lg:py-3 rounded-full border border-slate-200 hover:scale-105 transition-all shadow-lg opacity-0 animate-fade-in"
                style={{ animationDelay: item.delay }}
              >
                <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5 text-green-600" />
                <span className="text-sm lg:text-base text-slate-700 font-medium">{item.text}</span>
              </div>
            ))}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 lg:gap-6 justify-center opacity-0 animate-fade-in" style={{ animationDelay: '1.4s' }}>
            <Button 
              size="lg" 
              className="text-lg px-8 py-4 lg:px-12 lg:py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-2xl hover:shadow-3xl transition-all hover:scale-105 border-0 text-white" 
              onClick={onRedirectToDashboard}
            >
              {t('hero.cta.primary')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 py-4 lg:px-12 lg:py-6 border-2 hover:bg-slate-50 shadow-lg hover:scale-105 transition-all backdrop-blur-sm" 
              onClick={onRedirectToDashboard}
            >
              {t('hero.cta.secondary')}
            </Button>
          </div>

          {/* Social proof with delayed animation */}
          <div className="pt-12 border-t border-slate-200/50 opacity-0 animate-fade-in" style={{ animationDelay: '1.6s' }}>
            <p className="text-slate-500 text-sm mb-6">{t('hero.socialProof.text')}</p>
            <div className="flex justify-center items-center gap-6 lg:gap-8 opacity-70">
              <div className="text-2xl lg:text-3xl font-bold text-slate-600 hover:text-blue-600 transition-colors">{t('hero.socialProof.revenue')}</div>
              <div className="w-px h-6 lg:h-8 bg-slate-300"></div>
              <div className="text-base lg:text-lg font-medium text-slate-500">{t('hero.socialProof.generated')}</div>
              <div className="w-px h-6 lg:h-8 bg-slate-300"></div>
              <div className="text-2xl lg:text-3xl font-bold text-green-600">{t('hero.socialProof.upfront')}</div>
              <div className="w-px h-6 lg:h-8 bg-slate-300"></div>
              <div className="text-base lg:text-lg font-medium text-slate-500">{t('hero.socialProof.advance')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 animate-fade-in" style={{ animationDelay: '2s' }}>
        <div className="flex flex-col items-center gap-2 animate-bounce">
          <span className="text-slate-500 text-sm font-medium">Scroll</span>
          <div className="w-6 h-10 border-2 border-slate-300 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-slate-400 rounded-full mt-2 animate-pulse"></div>
          </div>
          <ChevronDown className="w-5 h-5 text-slate-400" />
        </div>
      </div>
    </section>
  );
};
