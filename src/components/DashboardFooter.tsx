
import { Link } from 'react-router-dom';
import { LogOut } from 'lucide-react';

export const DashboardFooter = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200/50 bg-white/60 backdrop-blur-xl py-6 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="relative flex flex-col lg:flex-row items-center justify-center gap-6">
          {/* Bouton déconnexion à gauche */}
          <div className="flex items-center lg:absolute lg:left-0">
            <button 
              onClick={() => {
                import('firebase/auth').then(({ signOut }) => {
                  import('@/lib/firebase').then(({ auth }) => {
                    signOut(auth).then(() => {
                      window.location.href = '/';
                    });
                  });
                });
              }}
              className="flex items-center gap-2 text-sm text-slate-700 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-[10px] border border-slate-200 hover:bg-white/95 hover:border-slate-300 transition-all duration-300 hover:scale-105"
            >
              <LogOut className="h-4 w-4 text-slate-500" />
              <span>Déconnexion</span>
            </button>
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
