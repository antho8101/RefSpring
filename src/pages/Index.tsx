
import { useAuth } from '@/hooks/useAuth';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { AuthForm } from '@/components/AuthForm';
import { Dashboard } from '@/components/Dashboard';
import { OnboardingCarousel } from '@/components/OnboardingCarousel';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const { hasSeenOnboarding, markOnboardingCompleted, loading: onboardingLoading } = useOnboarding();
  const { isAuthenticated, checkAuth } = useAuthGuard({ requireAuth: false });
  const { t } = useTranslation();

  const loading = authLoading || onboardingLoading;

  // Vérification de sécurité au montage
  useEffect(() => {
    console.log('🔐 SECURITY - Index page mounted, performing security check');
    // Vérifier l'état de l'authentification et les redirections
    checkAuth();
  }, [checkAuth]);

  // Gérer les redirections après authentification
  useEffect(() => {
    if (user && !loading) {
      const redirectPath = sessionStorage.getItem('redirectAfterAuth');
      if (redirectPath && redirectPath !== '/') {
        console.log('🔐 SECURITY - Redirecting after auth to:', redirectPath);
        sessionStorage.removeItem('redirectAfterAuth');
        window.location.href = redirectPath;
      }
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  // Si pas connecté, afficher le formulaire d'auth
  if (!user) {
    console.log('🔐 SECURITY - No user detected, showing auth form');
    return <AuthForm />;
  }

  // Si connecté mais n'a pas vu l'onboarding, afficher le carousel (protégé)
  if (!hasSeenOnboarding) {
    console.log('🔐 SECURITY - User authenticated but onboarding not completed');
    return (
      <ProtectedRoute>
        <OnboardingCarousel onComplete={markOnboardingCompleted} />
      </ProtectedRoute>
    );
  }

  // Sinon afficher le dashboard (protégé)
  console.log('🔐 SECURITY - User authenticated and onboarded, showing dashboard');
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
};

export default Index;
