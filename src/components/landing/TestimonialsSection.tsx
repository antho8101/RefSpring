
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
      company: "E-commerce Fashion",
      revenue: "€8K",
      quote: "Enfin une plateforme honnête ! Je paie seulement sur mes ventes réelles. Plus jamais de frais fixes qui me ruinent !",
      avatar: "ML",
      mood: "🤩",
      beforeAfter: "De 299€ de frais à 0€ fixe",
      secretTip: "Le dashboard me fait gagner 2h par semaine !"
    },
    {
      name: "Thomas Dubois", 
      company: "SaaS B2B",
      revenue: "€15K",
      quote: "Setup en 10 minutes, premiers affiliés en 2 jours. RefSpring tient ses promesses, c'est vraiment simple ! 🙏",
      avatar: "TD",
      mood: "😍",
      beforeAfter: "10 min de setup vs 3 semaines avant",
      secretTip: "Mes affiliés adorent l'interface !"
    },
    {
      name: "Sophie Chen",
      company: "Formation en ligne",
      revenue: "€22K",
      quote: "Je recommande à tous mes collègues entrepreneurs. Fini les plateformes qui vous arnaquent avec des frais cachés !",
      avatar: "SC",
      mood: "🚀",
      beforeAfter: "x3 mon chiffre d'affiliation",
      secretTip: "Le tracking est ultra-précis !"
    }
  ];

  return (
    <section ref={sectionRef} id="testimonials" className="py-24 px-4 sm:px-6 lg:px-8 bg-white relative overflow-hidden">
      <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full blur-3xl opacity-60 animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-48 h-48 bg-gradient-to-r from-blue-100 to-green-100 rounded-full blur-2xl opacity-40 animate-bounce"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-gradient-to-r from-green-100 to-blue-100 rounded-full border border-green-200">
            <Heart className="w-5 h-5 text-red-500 animate-pulse" />
            <span className="text-green-700 font-semibold">Témoignages Vrais</span>
            <Zap className="w-4 h-4 text-yellow-600 animate-bounce" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Ils l'ont testé... et adopté ! 🎯
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Découvrez pourquoi ces entrepreneurs 
            <span className="font-bold text-green-600"> ne reviendront jamais</span> aux plateformes à frais fixes.
            <br />
            <span className="text-blue-600 font-semibold">Leurs retours sont sans filtre ! 😎</span>
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
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-purple-50/0 group-hover:from-blue-50/70 group-hover:to-purple-50/70 transition-all duration-300"></div>
                
                <div className="relative z-10">
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

                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className="w-5 h-5 text-yellow-500 fill-current group-hover:animate-spin" 
                        style={{ animationDelay: `${i * 0.1}s` }}
                      />
                    ))}
                  </div>

                  <p className="text-slate-600 leading-relaxed italic mb-4 group-hover:text-slate-700 transition-colors">
                    "{testimonial.quote}"
                  </p>

                  <div className="bg-gradient-to-r from-green-100 to-blue-100 p-3 rounded-lg border border-green-200 mb-4">
                    <div className="text-sm font-bold text-green-700">📈 Résultat</div>
                    <div className="text-xs text-green-600">{testimonial.beforeAfter}</div>
                  </div>

                  <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-3 rounded-lg border border-yellow-200">
                      <div className="text-sm text-orange-700 font-medium">💡 Son conseil :</div>
                      <div className="text-xs text-orange-600 mt-1">{testimonial.secretTip}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12 group cursor-default">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100 p-6 hover:shadow-xl transition-all">
            <p className="text-slate-600 text-lg">
              <strong className="text-green-600">Rejoignez ces entrepreneurs malins</strong> qui ont arrêté de payer des frais fixes pour rien.
              <br />
              <span className="text-blue-600 font-semibold">Testez gratuitement, vous verrez la différence ! 🧠✨</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
