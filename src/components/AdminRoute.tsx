
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Shield, UserX } from 'lucide-react';

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute = ({ children }: AdminRouteProps) => {
  const { isAdmin, isAuthenticated, loading, currentEmail } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification des droits administrateur...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <UserX className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Accès Refusé</h1>
          <p className="text-gray-600 mb-6">Authentification requise pour accéder à cette zone.</p>
          <button 
            onClick={() => window.location.href = '/app'}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Accès Administrateur Requis</h1>
          <p className="text-gray-600 mb-4">Cette zone est réservée aux administrateurs.</p>
          <div className="bg-gray-100 rounded-lg p-3 mb-6">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Compte connecté :</span><br />
              {currentEmail}
            </p>
          </div>
          <button 
            onClick={() => window.location.href = '/'}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
