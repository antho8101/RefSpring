
import { Link } from 'react-router-dom';
import { RefSpringLogo } from '@/components/RefSpringLogo';

export const DashboardFooter = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200/50 bg-white/60 backdrop-blur-xl py-6 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="relative flex flex-col lg:flex-row items-center justify-center gap-6">
          {/* Logo à gauche */}
          <div className="flex items-center gap-3 lg:absolute lg:left-0">
            <RefSpringLogo width="28" height="28" />
            <div>
              <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                RefSpring
              </h3>
              <p className="text-xs text-slate-500">Plateforme d'affiliation</p>
            </div>
          </div>

          {/* Liens et copyright vraiment centrés */}
          <div className="flex flex-col items-center gap-4">
            <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-500">
              <Link to="/privacy" className="hover:text-slate-700 transition-colors">
                Confidentialité
              </Link>
              <Link to="/terms" className="hover:text-slate-700 transition-colors">
                Conditions
              </Link>
              <Link to="/contact" className="hover:text-slate-700 transition-colors">
                Support
              </Link>
              <Link to="/status" className="hover:text-slate-700 transition-colors">
                Statut
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
