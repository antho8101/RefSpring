
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { RefSpringLogo } from "@/components/RefSpringLogo";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface UnifiedHeaderProps {
  onRedirectToDashboard: () => void;
  currentPage?: 'landing' | 'pricing' | 'status';
}

export const UnifiedHeader = ({ onRedirectToDashboard, currentPage = 'landing' }: UnifiedHeaderProps) => {
  const { user } = useAuth();
  
  const handleLoginClick = () => {
    if (user) {
      // Si l'utilisateur est connecté, rediriger vers le dashboard
      onRedirectToDashboard();
    } else {
      // Si pas connecté, rediriger vers la page de connexion
      window.location.href = '/app';
    }
  };

  return (
    <header className="fixed top-0 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-xl z-50 transition-all">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 animate-fade-in hover:opacity-80 transition-opacity">
            <RefSpringLogo width="32" height="32" />
            <div className="font-bold text-2xl text-slate-900">RefSpring</div>
          </Link>
          <nav className="hidden md:flex space-x-8" role="navigation" aria-label="Navigation principale">
            <Link to="/#features" className="text-slate-600 hover:text-slate-900 font-medium transition-all hover:scale-105">
              Fonctionnalités
            </Link>
            <Link 
              to="/pricing" 
              className={`font-medium transition-all hover:scale-105 ${
                currentPage === 'pricing' ? 'text-slate-900 font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tarifs
            </Link>
            <Link to="/#dashboard" className="text-slate-600 hover:text-slate-900 font-medium transition-all hover:scale-105">
              Dashboard
            </Link>
            <Link to="/#testimonials" className="text-slate-600 hover:text-slate-900 font-medium transition-all hover:scale-105">
              Témoignages
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="hidden md:flex hover:scale-105 transition-transform" onClick={handleLoginClick}>
              {user ? "My Dashboard" : "Se connecter"}
            </Button>
            <Button 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6 py-2 shadow-lg hover:shadow-xl hover:scale-105 transition-all animate-pulse"
              onClick={onRedirectToDashboard}
            >
              Commencer gratuitement
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
