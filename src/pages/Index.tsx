
import { useAuth } from '@/hooks/useAuth';
import { AuthForm } from '@/components/AuthForm';
import { Dashboard } from '@/components/Dashboard';
import { useTranslation } from 'react-i18next';

const Index = () => {
  const { user, loading, initialized } = useAuth();
  const { t } = useTranslation();

  console.log('🔍 Index render - user:', !!user, 'loading:', loading, 'initialized:', initialized);

  // Pendant l'initialisation de Firebase
  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return user ? <Dashboard /> : <AuthForm />;
};

export default Index;
