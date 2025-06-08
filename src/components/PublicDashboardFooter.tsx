
import { RefSpringLogo } from "@/components/RefSpringLogo";
import { ExternalLink, Zap } from "lucide-react";
import { Link } from "react-router-dom";

export const PublicDashboardFooter = () => {
  return (
    <footer className="w-full mt-16 border-t border-slate-200/80 bg-gradient-to-r from-slate-50 to-slate-100/50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <RefSpringLogo width="24" height="24" />
              <div className="text-sm">
                <p className="font-medium text-slate-700">Propulsé par RefSpring</p>
                <p className="text-slate-500">0€ d'abonnement, que du gagnant-gagnant</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-sm text-amber-600">
                <Zap className="h-4 w-4" />
                <span className="font-medium">100% basé sur vos performances</span>
              </div>
              
              <a 
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-medium rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md"
              >
                <span>Créer ma campagne</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
          
          {/* Liens légaux */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200/60">
            <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-sm text-slate-500">
              <Link to="/privacy" className="hover:text-slate-700 transition-colors">
                Politique de confidentialité
              </Link>
              <Link to="/terms" className="hover:text-slate-700 transition-colors">
                Conditions d'utilisation
              </Link>
              <Link to="/legal" className="hover:text-slate-700 transition-colors">
                Mentions légales
              </Link>
              <Link to="/contact" className="hover:text-slate-700 transition-colors">
                Contact
              </Link>
            </div>
            
            <p className="text-sm text-slate-400">
              © {new Date().getFullYear()} RefSpring
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
