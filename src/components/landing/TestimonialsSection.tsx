
import { Star, Heart, Zap } from "lucide-react";
import { useState, useEffect, useRef } from 'react';

export const TestimonialsSection = () => {
  const [visibleTestimonials, setVisibleTestimonials] = useState<number[]>([]);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const testimonialIndex = parseInt(entry.target.getAttribute('data-testimonial') || '0');
            setTimeout(() => {
              setVisibleTestimonials(prev => [...prev, testimonialIndex]);
            }, testimonialIndex * 200);
          }
        });
      },
      { threshold: 0.3 }
    );

    const testimonials = sectionRef.current?.querySelectorAll('[data-testimonial]');
    testimonials?.forEach(testimonial => observer.observe(testimonial));

    return () => observer.disconnect();
  }, []);

  const testimonials = [
    {
      name: "Marie Laurent",
      company: "TechFlow SaaS",
      revenue: "€12K",
      quote: "En 4 mois, je suis passée de 0€ à 12K€ ! Le fait que RefSpring ne gagne que quand je gagne m'a convaincue. Enfin une plateforme honnête !",
      avatar: "ML",
      mood: "🤩",
      beforeAfter: "De 0€ à 12K€ en 4 mois",
      secretTip: "Le secret ? Des affiliés motivés par de vrais outils !"
    },
    {
      name: "Thomas Dubois", 
      company: "EcoCommerce",
      revenue: "€28K",
      quote: "Fini les 299€/mois dans le vide ! Mon programme d'affiliation génère maintenant plus que mes ventes directes. Merci RefSpring ! 🙏",
      avatar: "TD",
      mood: "😍",
      beforeAfter: "Plus de CA que les ventes directes",
      secretTip: "Les analytics en temps réel changent tout !"
    },
    {
      name: "Sophie Chen",
      company: "FinanceApp",
      revenue: "€45K",
      quote: "Le modèle transparent correspond parfaitement à ma mentalité d'entrepreneur. Je paie pour les résultats, pas pour des promesses vides !",
      avatar: "SC",
      mood: "🚀",
      beforeAfter: "x5 en 6 mois",
      secretTip: "L'IA prédit mes meilleures conversions !"
    }
  ];

  return (
    <section ref={sectionRef} id="testimonials" className="py-24 px-4 sm:px-6 lg:px-8 bg-white relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full blur-3xl opacity-60 animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-48 h-48 bg-gradient-to-r from-blue-100 to-green-100 rounded-full blur-2xl opacity-40 animate-bounce"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-gradient-to-r from-green-100 to-blue-100 rounded-full border border-green-200">
            <Heart className="w-5 h-5 text-red-500 animate-pulse" />
            <span className="text-green-700 font-semibold">Success Stories</span>
            <Zap className="w-4 h-4 text-yellow-600 animate-bounce" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Ils ont osé... et ça marche ! 🎯
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Découvrez comment ces entrepreneurs malins ont 
            <span className="font-bold text-green-600"> explosé leurs revenus</span> avec RefSpring.
            <br />
            <span className="text-blue-600 font-semibold">Leur secret ? Ils ont arrêté de payer pour rien ! 😎</span>
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              data-testimonial={index}
              className={`group transition-all duration-700 ${
                visibleTestimonials.includes(index) 
                  ? 'animate-fade-in-scale opacity-100' 
                  : 'opacity-0 translate-y-10'
              }`}
            >
              <div className="bg-gradient-to-br from-slate-50 to-white p-8 rounded-2xl shadow-lg border border-slate-100 hover:shadow-2xl transition-all hover:scale-105 h-full relative overflow-hidden">
                {/* Hover glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-purple-50/0 group-hover:from-blue-50/70 group-hover:to-purple-50/70 transition-all duration-300"></div>
                
                <div className="relative z-10">
                  {/* Header with avatar and mood */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold group-hover:animate-pulse">
                      {testimonial.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-slate-500">{testimonial.company}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-2xl font-bold text-green-600 group-hover:scale-110 transition-transform">
                        {testimonial.revenue}
                      </div>
                      <div className="text-2xl group-hover:animate-bounce">{testimonial.mood}</div>
                    </div>
                  </div>

                  {/* Stars with animation */}
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className="w-5 h-5 text-yellow-500 fill-current group-hover:animate-spin" 
                        style={{ animationDelay: `${i * 0.1}s` }}
                      />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-slate-600 leading-relaxed italic mb-4 group-hover:text-slate-700 transition-colors">
                    "{testimonial.quote}"
                  </p>

                  {/* Before/After badge */}
                  <div className="bg-gradient-to-r from-green-100 to-blue-100 p-3 rounded-lg border border-green-200 mb-4">
                    <div className="text-sm font-bold text-green-700">📈 Résultat</div>
                    <div className="text-xs text-green-600">{testimonial.beforeAfter}</div>
                  </div>

                  {/* Secret tip (appears on hover) */}
                  <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-3 rounded-lg border border-yellow-200">
                      <div className="text-sm text-orange-700 font-medium">🤫 Le secret :</div>
                      <div className="text-xs text-orange-600 mt-1">{testimonial.secretTip}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Enhanced social proof */}
        <div className="text-center mt-12 group cursor-default">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100 p-6 hover:shadow-xl transition-all">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="flex -space-x-2">
                {[...Array(8)].map((_, i) => (
                  <div 
                    key={i} 
                    className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 border-2 border-white flex items-center justify-center text-white text-xs font-bold hover:scale-110 transition-transform"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-slate-600 text-xs font-bold group-hover:animate-bounce">
                  +2K
                </div>
              </div>
            </div>
            <p className="text-slate-600 text-lg">
              <strong className="text-green-600">Rejoignez plus de 2 400+ entrepreneurs malins</strong> qui ont choisi 
              de garder leur argent et de payer seulement sur les résultats.
              <br />
              <span className="text-blue-600 font-semibold">C'est ça, l'intelligence ! 🧠✨</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
