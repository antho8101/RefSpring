
import { Button } from '@/components/ui/button';
import { LogOut, Menu, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { RefSpringLogo } from '@/components/RefSpringLogo';
import { AccountSettingsDialog } from '@/components/AccountSettingsDialog';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface DashboardHeaderProps {
  user: any;
  onLogout: () => Promise<void>;
}

export const DashboardHeader = ({ user, onLogout }: DashboardHeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/landing" className="animate-fade-in hover:opacity-80 transition-opacity flex-shrink-0">
            <div className="flex items-center gap-3">
              <RefSpringLogo width="32" height="32" />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  RefSpring
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 font-medium">Dashboard</p>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-4">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-2 text-sm text-slate-700 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200 hover:bg-white/95 hover:border-slate-300 transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              <span>Bonjour, <span className="font-semibold">{user?.displayName || user?.email}</span></span>
              <Settings className="h-4 w-4 text-slate-500" />
            </button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="rounded-full hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur-sm border-slate-300 bg-white/90 hover:bg-white/95"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="outline"
            size="sm"
            className="lg:hidden rounded-full shadow-lg border-slate-300"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200/80 bg-white/95 backdrop-blur-xl rounded-b-lg">
            <div className="py-4 space-y-3">
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="flex items-center gap-2 text-sm text-slate-700 px-4 py-2 bg-slate-50 rounded-lg w-full hover:bg-slate-100 transition-colors"
              >
                <span>Bonjour, <span className="font-semibold">{user?.displayName || user?.email}</span></span>
                <Settings className="h-4 w-4 text-slate-500 ml-auto" />
              </button>
              <div className="px-4">
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

      {/* Dialog des paramètres */}
      <AccountSettingsDialog />
    </header>
  );
};
