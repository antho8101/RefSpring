
import { Button } from "@/components/ui/button";
import { ArrowRight, PlayCircle } from "lucide-react";

interface CTASectionProps {
  onRedirectToDashboard: () => void;
}

export const CTASection = ({ onRedirectToDashboard }: CTASectionProps) => {
  return (
    <section className="py-24 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgPGcgZmlsbD0iIzAwMCIgZmlsbC1vcGFjaXR5PSIwLjA1Ij4KICAgICAgPGNpcmNsZSBjeD0iNyIgY3k9IjciIHI9IjEiLz4KICAgIDwvZz4KICA8L2c+Cjwvc3ZnPg==')] opacity-30"></div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
          Vos concurrents sont <br />
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            déjà ici
          </span>
        </h2>
        
        <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
          Pendant que d'autres paient des frais mensuels pour des résultats incertains, 
          les entreprises intelligentes gagnent déjà avec le modèle basé sur les performances de RefSpring. 
          Ne les laissez pas prendre de l'avance.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Button 
            onClick={onRedirectToDashboard}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-4 text-lg shadow-2xl hover:shadow-blue-500/25 hover:scale-105 transition-all duration-300 border-0"
          >
            Commencer gratuitement
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          
          <Button 
            variant="outline" 
            size="lg"
            className="border-2 border-white/20 text-white hover:bg-white/10 backdrop-blur-sm px-8 py-4 text-lg hover:scale-105 transition-all duration-300"
          >
            <PlayCircle className="mr-2 h-5 w-5" />
            Voir la démo live
          </Button>
        </div>

        <div className="mt-12 text-blue-200/80 text-sm">
          ✓ Configuration en 3 minutes • ✓ Aucun frais d'avance • ✓ Support 24/7
        </div>
      </div>
    </section>
  );
};
