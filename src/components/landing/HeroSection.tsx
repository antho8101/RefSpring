
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
    <section className="h-screen flex flex-col justify-center bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 relative">
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
      
      {/* Main content centered */}
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="space-y-6 lg:space-y-8">
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-slate-900 leading-tight opacity-0 animate-fade-in" style={{ animationDelay: '0.4s' }}>
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
            
            <p className="text-base md:text-lg lg:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed opacity-0 animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <strong>{t('hero.subtitle.bold')}</strong>
              <br />
              <span className="text-slate-900 font-semibold">{t('hero.subtitle.normal')}</span>
            </p>

            {/* Value props with staggered animations */}
            <div className="flex flex-wrap justify-center gap-3 lg:gap-4">
              {[
                { text: t('hero.features.noSetupFee'), delay: "0.8s" },
                { text: t('hero.features.noMonthlyFee'), delay: "1.0s" },
                { text: t('hero.features.fullAccess'), delay: "1.2s" }
              ].map((item, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-2 lg:px-4 lg:py-2 rounded-full border border-slate-200 hover:scale-105 transition-all shadow-lg opacity-0 animate-fade-in"
                  style={{ animationDelay: item.delay }}
                >
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm lg:text-base text-slate-700 font-medium">{item.text}</span>
                </div>
              ))}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 justify-center opacity-0 animate-fade-in" style={{ animationDelay: '1.4s' }}>
              <Button 
                size="lg" 
                className="text-base lg:text-lg px-6 py-3 lg:px-8 lg:py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-2xl hover:shadow-3xl transition-all hover:scale-105 border-0 text-white" 
                onClick={onRedirectToDashboard}
              >
                {t('hero.cta.primary')}
                <ArrowRight className="ml-2 h-4 w-4 lg:h-5 lg:w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-base lg:text-lg px-6 py-3 lg:px-8 lg:py-4 border-2 hover:bg-slate-50 shadow-lg hover:scale-105 transition-all backdrop-blur-sm" 
                onClick={onRedirectToDashboard}
              >
                {t('hero.cta.secondary')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Social proof moved to bottom */}
      <div className="absolute bottom-8 left-0 right-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="pt-6 lg:pt-8 border-t border-slate-200/50 opacity-0 animate-fade-in" style={{ animationDelay: '1.6s' }}>
            <p className="text-slate-500 text-sm mb-4 lg:mb-6 text-center">{t('hero.socialProof.text')}</p>
            <div className="flex justify-center items-center gap-4 lg:gap-6 opacity-70">
              <div className="text-xl lg:text-2xl font-bold text-slate-600 hover:text-blue-600 transition-colors">{t('hero.socialProof.revenue')}</div>
              <div className="w-px h-5 lg:h-6 bg-slate-300"></div>
              <div className="text-sm lg:text-base font-medium text-slate-500">{t('hero.socialProof.generated')}</div>
              <div className="w-px h-5 lg:h-6 bg-slate-300"></div>
              <div className="text-xl lg:text-2xl font-bold text-green-600">{t('hero.socialProof.upfront')}</div>
              <div className="w-px h-5 lg:h-6 bg-slate-300"></div>
              <div className="text-sm lg:text-base font-medium text-slate-500">{t('hero.socialProof.advance')}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
