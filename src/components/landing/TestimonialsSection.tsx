
import { Star } from "lucide-react";

export const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Marie Laurent",
      company: "TechFlow SaaS",
      revenue: "€12K",
      quote: "En 4 mois, je suis passée de 0€ à 12K€ de revenus d'affiliation. Le fait que RefSpring ne gagne que quand je gagne m'a convaincue immédiatement.",
      avatar: "ML"
    },
    {
      name: "Thomas Dubois", 
      company: "EcoCommerce",
      revenue: "€28K",
      quote: "Fini les 299€/mois à payer sans savoir si ça va marcher. Mon programme d'affiliation génère maintenant plus que mes ventes directes.",
      avatar: "TD"
    },
    {
      name: "Sophie Chen",
      company: "FinanceApp",
      revenue: "€45K",
      quote: "Le modèle transparent de RefSpring correspond parfaitement à ma mentalité d'entrepreneur. Je paie seulement pour les résultats, pas pour des promesses.",
      avatar: "SC"
    }
  ];

  return (
    <section id="testimonials" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Des entrepreneurs qui réussissent
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Découvrez comment d'autres solo-preneurs et petites équipes développent leurs revenus avec RefSpring
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-gradient-to-br from-slate-50 to-white p-8 rounded-2xl shadow-lg border border-slate-100 hover:shadow-xl transition-all hover:scale-105">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-bold text-slate-900">{testimonial.name}</div>
                  <div className="text-sm text-slate-500">{testimonial.company}</div>
                </div>
                <div className="ml-auto text-2xl font-bold text-green-600">{testimonial.revenue}</div>
              </div>
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                ))}
              </div>
              <p className="text-slate-600 leading-relaxed italic">"{testimonial.quote}"</p>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
          <p className="text-slate-600 text-lg">
            <strong>Rejoignez plus de 2 400+ entrepreneurs</strong> qui ont choisi un modèle équitable pour développer leurs revenus d'affiliation.
          </p>
        </div>
      </div>
    </section>
  );
};
