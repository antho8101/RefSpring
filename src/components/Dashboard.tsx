
import { useAuth } from '@/hooks/useAuth';
import { useTawkTo } from '@/hooks/useTawkTo';
import { useStatsFilters } from '@/hooks/useStatsFilters';
import { DashboardHeader } from './DashboardHeader';
import { PublicDashboardHeader } from './PublicDashboardHeader';
import { DashboardBackground } from './DashboardBackground';
import { DashboardContent } from './DashboardContent';
import { DashboardFooter } from './DashboardFooter';
import { AuthRequiredDialog } from './AuthRequiredDialog';
import { useState } from 'react';

export const Dashboard = () => {
  const { user, loading } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(!user && !loading);
  const { period, setPeriod } = useStatsFilters();
  
  // Initialiser Tawk.to uniquement dans le dashboard privé
  useTawkTo(!!user);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de votre tableau de bord...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <PublicDashboardHeader />
        <DashboardBackground />
        <AuthRequiredDialog 
          open={showAuthDialog} 
          onOpenChange={setShowAuthDialog}
          action="accéder au tableau de bord"
        />
        <DashboardFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <DashboardHeader 
        user={user}
        onLogout={async () => {}}
        period={period}
        onPeriodChange={setPeriod}
      />
      <DashboardBackground />
      <DashboardContent />
      <DashboardFooter />
    </div>
  );
};
