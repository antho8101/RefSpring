import { PrivacyDashboard } from '@/components/PrivacyDashboard';
import { DashboardHeader } from '@/components/DashboardHeader';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { useStatsFilters } from '@/hooks/useStatsFilters';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Helmet } from 'react-helmet-async';

const PrivacyDashboardPage = () => {
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
      <Helmet>
        <title>RefSpring - Confidentialité et Données Personnelles</title>
        <meta name="description" content="Gérez vos données personnelles et préférences de confidentialité avec RefSpring. Contrôle total sur vos cookies et données RGPD." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
          <DashboardHeader 
            user={user} 
            onLogout={handleLogout} 
            period={period} 
            onPeriodChange={setPeriod} 
          />
          <main className="container mx-auto px-4 py-8">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Confidentialité et Données
              </h1>
              <p className="text-muted-foreground">
                Gérez vos données personnelles et préférences de confidentialité en toute transparence.
              </p>
            </div>
            <PrivacyDashboard />
          </main>
        </div>
      </ProtectedRoute>
    </>
  );
};

export default PrivacyDashboardPage;