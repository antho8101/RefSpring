
import { CampaignDeletionUtility } from '@/components/CampaignDeletionUtility';
import { DashboardHeader } from '@/components/DashboardHeader';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { useStatsFilters } from '@/hooks/useStatsFilters';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

const CleanupPage = () => {
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
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <DashboardHeader 
          user={user} 
          onLogout={handleLogout} 
          period={period} 
          onPeriodChange={setPeriod} 
        />
        <main className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Nettoyage des données
            </h1>
            <p className="text-slate-600">
              Utilisez cet outil pour nettoyer les campagnes en brouillon qui ne sont plus nécessaires.
            </p>
          </div>
          <CampaignDeletionUtility />
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default CleanupPage;
