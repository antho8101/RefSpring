
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Star, DollarSign, TrendingUp, Zap, Globe, ChevronDown, Sparkles } from "lucide-react";
import { useTranslation } from 'react-i18next';

interface HeroSectionProps {
  scrollY: number;
  onRedirectToDashboard: () => void;
}

export const HeroSection = ({ scrollY, onRedirectToDashboard }: HeroSectionProps) => {
  const { t } = useTranslation();

  return (
    <section className="h-screen flex flex-col justify-center bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 relative overflow-hidden">
      {/* Enhanced Grid Pattern Background with animation */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] animate-pulse opacity-60"></div>
      
      {/* Enhanced Floating Icons with more dynamic animations */}
      <div className="absolute inset-0 pointer-events-none">
        <DollarSign 
          className="absolute top-1/4 left-1/4 w-8 h-8 text-green-500/30 animate-bounce opacity-0 animate-fade-in drop-shadow-lg" 
          style={{ 
            animationDelay: '2s', 
            animationDuration: '3s',
            filter: 'drop-shadow(0 0 8px rgba(34, 197, 94, 0.3))'
          }}
        />
        <TrendingUp 
          className="absolute top-1/3 right-1/3 w-6 h-6 text-blue-500/30 animate-bounce opacity-0 animate-fade-in drop-shadow-lg" 
          style={{ 
            animationDelay: '2.5s', 
            animationDuration: '4s',
            filter: 'drop-shadow(0 0 6px rgba(59, 130, 246, 0.3))'
          }}
        />
        <Zap 
          className="absolute bottom-1/3 left-1/5 w-7 h-7 text-purple-500/30 animate-bounce opacity-0 animate-fade-in drop-shadow-lg" 
          style={{ 
            animationDelay: '3s', 
            animationDuration: '3.5s',
            filter: 'drop-shadow(0 0 10px rgba(168, 85, 247, 0.4))'
          }}
        />
        <Globe 
          className="absolute top-1/5 right-1/5 w-9 h-9 text-indigo-500/30 animate-bounce opacity-0 animate-fade-in drop-shadow-lg" 
          style={{ 
            animationDelay: '2.2s', 
            animationDuration: '4.5s',
            filter: 'drop-shadow(0 0 12px rgba(99, 102, 241, 0.3))'
          }}
        />
        <Sparkles 
          className="absolute top-2/3 right-1/4 w-5 h-5 text-pink-500/25 animate-spin opacity-0 animate-fade-in" 
          style={{ 
            animationDelay: '4s', 
            animationDuration: '6s',
            filter: 'drop-shadow(0 0 6px rgba(236, 72, 153, 0.4))'
          }}
        />
        <Star 
          className="absolute bottom-1/4 right-1/6 w-6 h-6 text-yellow-500/25 animate-pulse opacity-0 animate-fade-in" 
          style={{ 
            animationDelay: '3.5s', 
            animationDuration: '5s',
            filter: 'drop-shadow(0 0 8px rgba(234, 179, 8, 0.4))'
          }}
        />
      </div>

      {/* Enhanced floating orbs with glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute top-20 right-10 w-64 h-64 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse"
          style={{ 
            transform: `translateY(${scrollY * 0.1}px)`,
            boxShadow: '0 0 100px rgba(59, 130, 246, 0.2), inset 0 0 100px rgba(168, 85, 247, 0.1)'
          }}
        ></div>
        <div 
          className="absolute top-1/2 left-10 w-48 h-48 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse"
          style={{ 
            transform: `translateY(${scrollY * -0.05}px)`,
            animationDelay: '1s',
            boxShadow: '0 0 80px rgba(168, 85, 247, 0.2), inset 0 0 80px rgba(236, 72, 153, 0.1)'
          }}
        ></div>
        <div 
          className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-full blur-2xl animate-pulse"
          style={{ 
            transform: `translateY(${scrollY * 0.15}px)`,
            animationDelay: '2s',
            boxShadow: '0 0 60px rgba(34, 197, 94, 0.2)'
          }}
        ></div>
      </div>
      
      {/* Main content centered */}
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="space-y-6 lg:space-y-8">
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-slate-900 leading-tight opacity-0 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              {t('hero.title.part1')}
              <br />
              <span className="relative inline-block">
                {/* Enhanced glow background layers with more intensity */}
                <span className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent blur-2xl opacity-60 animate-pulse"></span>
                <span className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-600 bg-clip-text text-transparent blur-xl opacity-40 animate-pulse" style={{ animationDelay: '0.5s' }}></span>
                <span className="absolute inset-0 bg-gradient-to-r from-blue-300 via-purple-300 to-blue-500 bg-clip-text text-transparent blur-lg opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></span>
                {/* Main text with enhanced glow */}
                <span 
                  className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent"
                  style={{ 
                    filter: 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.3)) drop-shadow(0 0 40px rgba(168, 85, 247, 0.2))',
                    textShadow: '0 0 30px rgba(59, 130, 246, 0.5)'
                  }}
                >
                  {t('hero.title.part2')}
                </span>
              </span>
            </h1>
            
            <p className="text-base md:text-lg lg:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed opacity-0 animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <strong className="text-slate-800">{t('hero.subtitle.bold')}</strong>
              <br />
              <span className="text-slate-900 font-semibold">{t('hero.subtitle.normal')}</span>
            </p>

            {/* Enhanced value props with more dynamic animations and glow */}
            <div className="flex flex-wrap justify-center gap-3 lg:gap-4">
              {[
                { text: t('hero.features.noSetupFee'), delay: "0.8s", color: "green" },
                { text: t('hero.features.noMonthlyFee'), delay: "1.0s", color: "blue" },
                { text: t('hero.features.fullAccess'), delay: "1.2s", color: "purple" }
              ].map((item, index) => (
                <div 
                  key={index}
                  className={`flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-2 lg:px-4 lg:py-2 rounded-full border border-slate-200 hover:scale-110 hover:shadow-2xl transition-all duration-300 shadow-lg opacity-0 animate-fade-in hover:bg-white`}
                  style={{ 
                    animationDelay: item.delay,
                    boxShadow: item.color === 'green' 
                      ? '0 4px 20px rgba(34, 197, 94, 0.1), 0 0 0 1px rgba(34, 197, 94, 0.1)' 
                      : item.color === 'blue' 
                      ? '0 4px 20px rgba(59, 130, 246, 0.1), 0 0 0 1px rgba(59, 130, 246, 0.1)'
                      : '0 4px 20px rgba(168, 85, 247, 0.1), 0 0 0 1px rgba(168, 85, 247, 0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.filter = item.color === 'green' 
                      ? 'drop-shadow(0 0 15px rgba(34, 197, 94, 0.3))'
                      : item.color === 'blue'
                      ? 'drop-shadow(0 0 15px rgba(59, 130, 246, 0.3))'
                      : 'drop-shadow(0 0 15px rgba(168, 85, 247, 0.3))';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.filter = 'none';
                  }}
                >
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm lg:text-base text-slate-700 font-medium">{item.text}</span>
                </div>
              ))}
            </div>
            
            {/* Enhanced CTAs with more dramatic effects */}
            <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 justify-center opacity-0 animate-fade-in" style={{ animationDelay: '1.4s' }}>
              <Button 
                size="lg" 
                className="text-base lg:text-lg px-6 py-3 lg:px-8 lg:py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 border-0 text-white group relative overflow-hidden" 
                onClick={onRedirectToDashboard}
                style={{
                  boxShadow: '0 10px 40px rgba(59, 130, 246, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.filter = 'drop-shadow(0 0 25px rgba(59, 130, 246, 0.6))';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.filter = 'none';
                }}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="relative">{t('hero.cta.primary')}</span>
                <ArrowRight className="ml-2 h-4 w-4 lg:h-5 lg:w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-base lg:text-lg px-6 py-3 lg:px-8 lg:py-4 border-2 hover:bg-slate-50 shadow-lg hover:scale-110 transition-all duration-300 backdrop-blur-sm group relative overflow-hidden" 
                onClick={onRedirectToDashboard}
                style={{
                  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.filter = 'drop-shadow(0 0 20px rgba(148, 163, 184, 0.4))';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.filter = 'none';
                }}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-slate-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="relative">{t('hero.cta.secondary')}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced social proof without background and shadow */}
      <div className="absolute bottom-8 left-0 right-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="pt-6 lg:pt-8 border-t border-slate-200/50 opacity-0 animate-fade-in" style={{ animationDelay: '1.6s' }}>
            <p className="text-slate-500 text-sm mb-4 lg:mb-6 text-center">{t('hero.socialProof.text')}</p>
            <div className="flex justify-center items-center gap-4 lg:gap-6 opacity-70">
              <div 
                className="text-xl lg:text-2xl font-bold text-slate-600 hover:text-blue-600 transition-all duration-300 hover:scale-110"
                style={{ filter: 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.0))' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.filter = 'drop-shadow(0 0 15px rgba(59, 130, 246, 0.4))';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.filter = 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.0))';
                }}
              >
                {t('hero.socialProof.revenue')}
              </div>
              <div className="w-px h-5 lg:h-6 bg-slate-300"></div>
              <div className="text-sm lg:text-base font-medium text-slate-500">{t('hero.socialProof.generated')}</div>
              <div className="w-px h-5 lg:h-6 bg-slate-300"></div>
              <div 
                className="text-xl lg:text-2xl font-bold text-green-600 hover:scale-110 transition-all duration-300"
                style={{ filter: 'drop-shadow(0 0 10px rgba(34, 197, 94, 0.0))' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.filter = 'drop-shadow(0 0 15px rgba(34, 197, 94, 0.4))';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.filter = 'drop-shadow(0 0 10px rgba(34, 197, 94, 0.0))';
                }}
              >
                {t('hero.socialProof.upfront')}
              </div>
              <div className="w-px h-5 lg:h-6 bg-slate-300"></div>
              <div className="text-sm lg:text-base font-medium text-slate-500">{t('hero.socialProof.advance')}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
