
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Badge } from '@/components/ui/badge';
import { 
  Rocket, 
  Users, 
  BarChart3, 
  CreditCard, 
  Trophy 
} from 'lucide-react';

const slides = [
  {
    icon: Rocket,
    title: "Bienvenue sur RefSpring !",
    description: "La plateforme d'affiliation qui transforme vos visiteurs en revenus récurrents.",
    color: "bg-gradient-to-br from-blue-500 to-purple-600"
  },
  {
    icon: Users,
    title: "Créez vos campagnes",
    description: "Configurez facilement vos campagnes d'affiliation avec nos outils intuitifs.",
    color: "bg-gradient-to-br from-green-500 to-blue-500"
  },
  {
    icon: BarChart3,
    title: "Suivez vos performances",
    description: "Analysez en temps réel vos conversions, revenus et l'activité de vos affiliés.",
    color: "bg-gradient-to-br from-purple-500 to-pink-500"
  },
  {
    icon: CreditCard,
    title: "Paiements automatisés",
    description: "Les commissions sont calculées et versées automatiquement à vos affiliés.",
    color: "bg-gradient-to-br from-orange-500 to-red-500"
  },
  {
    icon: Trophy,
    title: "Prêt à commencer ?",
    description: "Créez votre première campagne et commencez à générer des revenus dès aujourd'hui !",
    color: "bg-gradient-to-br from-yellow-500 to-orange-500"
  }
];

export const OnboardingCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Protection contre les erreurs de DOM
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  // Log pour debug
  console.log('Current slide:', currentSlide, 'Total slides:', slides.length);

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <Carousel className="w-full" opts={{ align: "start", loop: true }}>
        <CarouselContent className="ml-0">
          {slides.map((slide, index) => {
            const IconComponent = slide.icon;
            
            console.log(`CarouselContent children found: ${slides.length}`);
            
            return (
              <CarouselItem key={index} className="pl-0">
                <Card className={`${slide.color} border-0 text-white overflow-hidden relative`}>
                  <CardContent className="p-8 text-center relative z-10">
                    <div className="mb-6">
                      <div className="w-16 h-16 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-4">
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                      <Badge variant="secondary" className="mb-4 bg-white/20 text-white border-white/30">
                        Étape {index + 1} sur {slides.length}
                      </Badge>
                    </div>
                    <h3 className="text-2xl font-bold mb-4">{slide.title}</h3>
                    <p className="text-lg text-white/90 leading-relaxed">{slide.description}</p>
                  </CardContent>
                  <div className="absolute inset-0 bg-white/5 backdrop-blur-sm" />
                </Card>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselPrevious className="left-2" />
        <CarouselNext className="right-2" />
      </Carousel>
      
      {/* Indicateurs de slides */}
      <div className="flex justify-center mt-6 space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide 
                ? 'bg-blue-600 scale-125' 
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
            aria-label={`Aller à la slide ${index + 1}`}
          />
        ))}
      </div>
      
      {/* Log pour debug total slides */}
      {console.log('Total slides detected:', slides.length)}
    </div>
  );
};
