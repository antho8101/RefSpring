
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from '@/components/ui/carousel';
import { DashboardBackground } from '@/components/DashboardBackground';
import { RefSpringLogo } from '@/components/RefSpringLogo';
import { CheckCircle, Shield, TrendingUp, Rocket } from 'lucide-react';

interface OnboardingCarouselProps {
  onComplete: () => void;
}

const slides = [
  {
    id: 1,
    icon: TrendingUp,
    title: "Commission de 2,5%",
    subtitle: "Notre modèle économique",
    description: "RefSpring prend une commission de 2,5% sur votre chiffre d'affaires généré via les affiliés. Pas d'abonnement, pas de frais cachés.",
    color: "from-green-500 to-emerald-600"
  },
  {
    id: 2,
    icon: Shield,
    title: "Outil de tracking uniquement",
    subtitle: "Notre périmètre d'action",
    description: "RefSpring est un outil de suivi et d'analyse. Nous ne gérons pas les paiements entre vous et vos affiliés.",
    color: "from-blue-500 to-cyan-600"
  },
  {
    id: 3,
    icon: CheckCircle,
    title: "Votre responsabilité",
    subtitle: "Transparence totale",
    description: "Il est de votre responsabilité de payer vos affiliés. RefSpring se dégage de tout litige pouvant survenir en cas de non-paiement des commissions.",
    color: "from-orange-500 to-red-600"
  },
  {
    id: 4,
    icon: Rocket,
    title: "Bienvenue sur RefSpring !",
    subtitle: "Prêt à commencer ?",
    description: "Créez votre première campagne et commencez à suivre vos performances d'affiliation en temps réel.",
    color: "from-purple-500 to-indigo-600"
  }
];

export const OnboardingCarousel = ({ onComplete }: OnboardingCarouselProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [api, setApi] = useState<CarouselApi>();

  useEffect(() => {
    if (!api) {
      return;
    }

    setCurrentSlide(api.selectedScrollSnap());

    api.on('select', () => {
      setCurrentSlide(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 relative overflow-hidden">
      <DashboardBackground />
      
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-4xl">
          {/* Header avec logo */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <RefSpringLogo width="48" height="48" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                RefSpring
              </h1>
            </div>
            <p className="text-slate-600">Découvrez comment fonctionne votre plateforme d'affiliation</p>
          </div>

          <Carousel className="w-full" setApi={setApi}>
            <CarouselContent>
              {slides.map((slide, index) => {
                const IconComponent = slide.icon;
                return (
                  <CarouselItem key={slide.id}>
                    <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-2xl">
                      <CardContent className="p-12 text-center">
                        {/* Icône avec gradient */}
                        <div className={`w-24 h-24 mx-auto mb-8 bg-gradient-to-r ${slide.color} rounded-full flex items-center justify-center shadow-xl`}>
                          <IconComponent className="w-12 h-12 text-white" />
                        </div>

                        {/* Contenu */}
                        <div className="space-y-6">
                          <div>
                            <h2 className="text-3xl font-bold text-slate-900 mb-2">
                              {slide.title}
                            </h2>
                            <p className="text-lg text-slate-600 font-medium">
                              {slide.subtitle}
                            </p>
                          </div>
                          
                          <p className="text-lg text-slate-700 leading-relaxed max-w-2xl mx-auto">
                            {slide.description}
                          </p>
                        </div>

                        {/* Bouton sur la dernière slide */}
                        {index === slides.length - 1 && (
                          <div className="mt-8">
                            <Button 
                              size="lg" 
                              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg shadow-xl hover:shadow-2xl transition-all"
                              onClick={onComplete}
                            >
                              Commencer l'aventure
                              <Rocket className="ml-2 h-5 w-5" />
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            
            {/* Navigation */}
            <div className="flex justify-center items-center gap-4 mt-8">
              <CarouselPrevious className="static translate-y-0" />
              
              {/* Points indicateurs */}
              <div className="flex gap-2">
                {slides.map((_, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentSlide 
                        ? 'bg-blue-600 w-8' 
                        : 'bg-slate-300 hover:bg-slate-400'
                    }`}
                  />
                ))}
              </div>
              
              <CarouselNext className="static translate-y-0" />
            </div>
          </Carousel>

          {/* Bouton passer */}
          <div className="text-center mt-6">
            <Button 
              variant="link" 
              onClick={onComplete}
              className="text-slate-500 hover:text-slate-700"
            >
              Passer l'introduction
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
