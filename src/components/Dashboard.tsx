
import { Helmet } from "react-helmet-async";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DashboardContent } from "@/components/DashboardContent";
import { DashboardFooter } from "@/components/DashboardFooter";
import { DashboardBackground } from "@/components/DashboardBackground";
import { ConfettiCelebration } from "@/components/ConfettiCelebration";
import { useGlobalConfetti } from "@/hooks/useCampaignForm";
import { useAuth } from "@/hooks/useAuth";
import { useStatsFilters } from "@/hooks/useStatsFilters";
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export const Dashboard = () => {
  const { showConfetti, setShowConfetti } = useGlobalConfetti();
  const { user } = useAuth();
  const { period, setPeriod } = useStatsFilters();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.href = '/';
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <>
      {/* Confettis globaux pour les créations de campagne */}
      <ConfettiCelebration 
        trigger={showConfetti} 
        onComplete={() => setShowConfetti(false)} 
      />
      
      <Helmet>
        <title>RefSpring - Dashboard</title>
        <meta name="description" content="Gérez vos campagnes d'affiliation RefSpring" />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
        <DashboardBackground />
        
        <div className="relative z-10 flex flex-col min-h-screen">
          <DashboardHeader 
            user={user}
            onLogout={handleLogout}
            period={period}
            onPeriodChange={setPeriod}
          />
          <main className="flex-1">
            <DashboardContent />
          </main>
          <DashboardFooter />
        </div>
      </div>
    </>
  );
};
