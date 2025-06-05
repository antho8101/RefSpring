
import { Star } from "lucide-react";

export const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Marie Laurent",
      company: "TechFlow SaaS",
      revenue: "€45K",
      quote: "We went from €0 to €45K in affiliate revenue in 6 months. The fact that RefSpring only earns when we earn made the decision so easy.",
      avatar: "ML"
    },
    {
      name: "Thomas Dubois", 
      company: "EcoCommerce",
      revenue: "€78K",
      quote: "No monthly fees means we could test and scale without fear. Our affiliate program now generates more revenue than our direct sales.",
      avatar: "TD"
    },
    {
      name: "Sophie Chen",
      company: "FinanceApp",
      revenue: "€120K",
      quote: "RefSpring's transparent model aligned perfectly with our startup mindset. We only pay for actual results, not promises.",
      avatar: "SC"
    }
  ];

  return (
    <section id="testimonials" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Success stories that inspire
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Real companies, real results, real revenue growth.
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
      </div>
    </section>
  );
};
