
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import { RefSpringLogo } from '@/components/RefSpringLogo';

export const PublicDashboardHeader = () => {
  return (
    <header className="relative z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl shadow-lg">
      <div className="w-full px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-16 min-w-0">
          {/* Logo */}
          <Link to="/landing" className="animate-fade-in hover:opacity-80 transition-opacity flex-shrink-0 min-w-0">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <RefSpringLogo width="28" height="28" className="flex-shrink-0" />
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent truncate">
                  RefSpring
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 font-medium truncate">Dashboard</p>
              </div>
            </div>
          </Link>

          {/* Login Button */}
          <Link to="/auth">
            <Button 
              variant="outline" 
              size="sm" 
              className="rounded-full hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur-sm border-slate-300 bg-white/90 hover:bg-white/95 flex-shrink-0"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Se connecter
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};
