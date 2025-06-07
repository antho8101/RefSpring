
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Globe, Menu } from 'lucide-react';
import { StatsPeriodToggle } from '@/components/StatsPeriodToggle';
import { Campaign } from '@/types';
import { StatsPeriod } from '@/hooks/useStatsFilters';

interface AdvancedStatsPageHeaderProps {
  campaign: Campaign;
  period: StatsPeriod;
  onPeriodChange: (period: StatsPeriod) => void;
  getPeriodLabel: () => string;
}

export const AdvancedStatsPageHeader = ({ 
  campaign, 
  period, 
  onPeriodChange, 
  getPeriodLabel 
}: AdvancedStatsPageHeaderProps) => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 shadow-sm sticky top-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 truncate">RefSpring</h1>
            <p className="text-xs sm:text-sm text-slate-600">Statistiques Avancées - {getPeriodLabel()}</p>
          </div>

          {/* Desktop controls */}
          <div className="hidden lg:flex items-center space-x-4">
            <StatsPeriodToggle 
              period={period}
              onPeriodChange={onPeriodChange}
            />
            <div className="text-sm text-slate-700 bg-slate-100 px-3 py-1 rounded-full max-w-[300px] truncate">
              Campagne : <span className="font-semibold">{campaign.name}</span>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard')}
              className="hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="outline"
            size="sm"
            className="lg:hidden ml-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white">
            <div className="py-4 space-y-3">
              <div className="flex justify-center">
                <StatsPeriodToggle 
                  period={period}
                  onPeriodChange={onPeriodChange}
                />
              </div>
              <div className="text-sm text-slate-700 px-3 py-2 bg-slate-50 rounded-lg">
                Campagne : <span className="font-semibold">{campaign.name}</span>
              </div>
              <Button 
                variant="outline" 
                onClick={() => {
                  navigate('/dashboard');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full justify-start"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour au dashboard
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
