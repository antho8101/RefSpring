
import { Button } from '@/components/ui/button';
import { LogOut, Menu, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { RefSpringLogo } from '@/components/RefSpringLogo';
import { AccountSettingsDialog } from '@/components/AccountSettingsDialog';
import { StatsPeriodToggle } from '@/components/StatsPeriodToggle';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { StatsPeriod } from '@/hooks/useStatsFilters';

interface DashboardHeaderProps {
  user: any;
  onLogout: () => Promise<void>;
  period: StatsPeriod;
  onPeriodChange: (period: StatsPeriod) => void;
}

export const DashboardHeader = ({ user, onLogout, period, onPeriodChange }: DashboardHeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Rediriger vers la landing page
      window.location.href = '/';
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <header className="relative z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl shadow-lg">
      <div className="w-full px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-16 min-w-0">
          {/* Logo - Fixed to prevent overflow */}
          <a href="https://www.refspring.com" className="animate-fade-in hover:opacity-80 transition-opacity flex-shrink-0 min-w-0">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <RefSpringLogo width="28" height="28" className="flex-shrink-0" />
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent truncate">
                  RefSpring
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 font-medium truncate">Dashboard</p>
              </div>
            </div>
          </a>

          {/* Desktop Navigation - Hidden on mobile to prevent overflow */}
          <div className="hidden lg:flex items-center space-x-3 xl:space-x-4 flex-shrink-0">
            <AccountSettingsDialog>
              <button className="flex items-center gap-2 text-sm text-slate-700 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-full border border-slate-200 hover:bg-white/95 hover:border-slate-300 transition-all duration-300 hover:scale-105 hover:shadow-lg min-w-0">
                <span className="whitespace-nowrap">Bonjour, <span className="font-semibold">{user?.displayName || user?.email}</span></span>
                <Settings className="h-4 w-4 text-slate-500 flex-shrink-0" />
              </button>
            </AccountSettingsDialog>
            
            <div data-tour="period-toggle">
              <StatsPeriodToggle period={period} onPeriodChange={onPeriodChange} />
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="rounded-full hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur-sm border-slate-300 bg-white/90 hover:bg-white/95 flex-shrink-0"
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span className="hidden xl:inline">Déconnexion</span>
            </Button>
          </div>

          {/* Mobile Menu Button - Fixed positioning */}
          <Button
            variant="outline"
            size="sm"
            className="lg:hidden rounded-full shadow-lg border-slate-300 flex-shrink-0"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>

        {/* Mobile Menu - Improved layout */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200/80 bg-white/95 backdrop-blur-xl rounded-b-lg overflow-hidden">
            <div className="py-4 space-y-3 px-2">
              <AccountSettingsDialog>
                <button className="flex items-center gap-2 text-sm text-slate-700 px-3 py-2 bg-slate-50 rounded-lg w-full hover:bg-slate-100 transition-colors min-w-0">
                  <span className="flex-1 text-left whitespace-nowrap overflow-hidden">Bonjour, <span className="font-semibold">{user?.displayName || user?.email}</span></span>
                  <Settings className="h-4 w-4 text-slate-500 flex-shrink-0" />
                </button>
              </AccountSettingsDialog>
              
              <div className="flex justify-center px-2" data-tour="period-toggle">
                <StatsPeriodToggle period={period} onPeriodChange={onPeriodChange} />
              </div>
              
              <div className="px-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogout}
                  className="w-full justify-start rounded-full shadow-lg border-slate-300 hover:scale-105 transition-all duration-300"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Déconnexion
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
