
import { useAuth } from '@/hooks/useAuth';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useAffiliates } from '@/hooks/useAffiliates';
import { useGlobalStats } from '@/hooks/useGlobalStats';
import { DashboardBackground } from '@/components/DashboardBackground';
import { DashboardHeader } from '@/components/DashboardHeader';
import { DashboardStats } from '@/components/DashboardStats';
import { DashboardContent } from '@/components/DashboardContent';

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const { campaigns } = useCampaigns();
  const { affiliates } = useAffiliates();
  const { stats: globalStats, loading: globalStatsLoading } = useGlobalStats();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const activeCampaigns = campaigns.filter(c => c.isActive).length;
  const totalAffiliates = affiliates.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 relative overflow-hidden">
      <DashboardBackground />

      <DashboardHeader user={user} onLogout={handleLogout} />

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <DashboardStats 
          activeCampaigns={activeCampaigns}
          totalCampaigns={campaigns.length}
          totalAffiliates={totalAffiliates}
          globalStats={globalStats}
          globalStatsLoading={globalStatsLoading}
        />

        <DashboardContent />
      </main>
    </div>
  );
};
