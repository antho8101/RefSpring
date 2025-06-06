
import { Link } from 'react-router-dom';

export const DashboardFooter = () => {
  return (
    <footer className="border-t border-slate-200/50 bg-white/60 backdrop-blur-xl py-4 mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex flex-wrap gap-4 text-sm text-slate-500">
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
    </footer>
  );
};
