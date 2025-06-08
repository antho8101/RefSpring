
import { useAuth } from '@/hooks/useAuth';
import { AuthForm } from '@/components/AuthForm';
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  allowGuest?: boolean;
}

export const ProtectedRoute = ({ 
  children, 
  redirectTo = '/auth',
  allowGuest = false 
}: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Log de sécurité
    console.log('🔐 SECURITY - Route protection check:', {
      path: location.pathname,
      authenticated: !!user,
      loading,
      allowGuest
    });

    // Si pas en cours de chargement et pas d'utilisateur et pas autorisé pour invités
    if (!loading && !user && !allowGuest) {
      console.log('🔐 SECURITY - Redirecting unauthenticated user to auth');
      // Sauvegarder l'URL de destination pour redirection après connexion
      sessionStorage.setItem('redirectAfterAuth', location.pathname + location.search);
      navigate(redirectTo, { replace: true });
    }
  }, [user, loading, allowGuest, navigate, redirectTo, location]);

  // Affichage du loader pendant la vérification
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  // Si pas d'utilisateur et pas autorisé pour invités, on affiche le formulaire d'auth
  if (!user && !allowGuest) {
    return <AuthForm />;
  }

  // Utilisateur authentifié ou route autorisée pour invités
  return <>{children}</>;
};
