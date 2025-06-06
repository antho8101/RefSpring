
import { useAuth } from '@/hooks/useAuth';
import { useOnboarding } from '@/hooks/useOnboarding';
import { AuthForm } from '@/components/AuthForm';
import { Dashboard } from '@/components/Dashboard';
import { OnboardingCarousel } from '@/components/OnboardingCarousel';
import { useTranslation } from 'react-i18next';

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const { hasSeenOnboarding, markOnboardingCompleted, loading: onboardingLoading } = useOnboarding();
  const { t } = useTranslation();

  const loading = authLoading || onboardingLoading;

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
    return <AuthForm />;
  }

  // Si connecté mais n'a pas vu l'onboarding, afficher le carousel
  if (!hasSeenOnboarding) {
    return <OnboardingCarousel onComplete={markOnboardingCompleted} />;
  }

  // Sinon afficher le dashboard
  return <Dashboard />;
};

export default Index;
