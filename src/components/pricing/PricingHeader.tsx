
import { Shield, Star } from "lucide-react";

export const PricingHeader = () => {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 relative">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] animate-pulse"></div>
      
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-100 to-blue-100 text-green-800 px-6 py-3 rounded-full text-sm font-medium mb-8 border border-green-200/50 backdrop-blur-sm animate-scale-in">
          <Shield className="w-4 h-4" />
          Tarifs transparents
          <Star className="w-4 h-4 text-yellow-500" />
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold text-slate-900 leading-tight mb-8 animate-fade-in">
          Un modèle de <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">pricing équitable</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-4xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
          Pas de frais mensuels, vous ne payez que sur vos gains réels. 
          Simple, transparent et aligné sur votre succès.
        </p>
      </div>
    </section>
  );
};
