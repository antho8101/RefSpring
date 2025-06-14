
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useCallback, useEffect } from 'react';

interface UseAuthGuardOptions {
  redirectTo?: string;
  requireAuth?: boolean;
  onUnauthorized?: () => void;
}

export const useAuthGuard = (options: UseAuthGuardOptions = {}) => {
  const { 
    redirectTo = '/auth', 
    requireAuth = true,
    onUnauthorized 
  } = options;
  
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Vérification de l'authentification
  const checkAuth = useCallback(() => {
    if (!loading && requireAuth && !user) {
      console.log('🔐 SECURITY - Auth guard triggered - unauthorized access attempt');
      
      if (onUnauthorized) {
        onUnauthorized();
      } else {
        console.log('🔐 SECURITY - Redirecting to auth page');
        navigate(redirectTo, { replace: true });
      }
      return false;
    }
    return true;
  }, [loading, requireAuth, user, navigate, redirectTo, onUnauthorized]);

  // Vérification automatique au montage
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Fonction pour vérifier l'autorisation d'une action
  const requireAuthentication = useCallback((action: string = 'cette action') => {
    // CORRECTION: Ne pas lancer d'exception si l'authentification est encore en cours de chargement
    if (loading) {
      console.log(`🔐 SECURITY - Auth still loading for action: ${action}`);
      return false; // Retourner false au lieu de lancer une exception
    }
    
    if (!user) {
      console.log(`🔐 SECURITY - Blocked unauthorized attempt: ${action}`);
      throw new Error(`Authentification requise pour ${action}`);
    }
    
    console.log(`🔐 SECURITY - Authorized action: ${action} for user:`, user.uid);
    return true;
  }, [user, loading]);

  // Fonction pour vérifier la propriété d'une ressource
  const requireOwnership = useCallback((resourceUserId: string, resourceType: string = 'ressource') => {
    // CORRECTION: Vérifier d'abord que l'authentification est terminée
    if (loading) {
      console.log(`🔐 SECURITY - Auth still loading for ownership check: ${resourceType}`);
      return false;
    }
    
    if (!requireAuthentication(`accéder à cette ${resourceType}`)) {
      return false;
    }
    
    if (user?.uid !== resourceUserId) {
      console.log(`🔐 SECURITY - Blocked unauthorized access to ${resourceType}:`, {
        currentUser: user?.uid,
        resourceOwner: resourceUserId
      });
      throw new Error(`Accès non autorisé à cette ${resourceType}`);
    }
    
    return true;
  }, [user, requireAuthentication, loading]);

  return {
    isAuthenticated: !!user && !loading,
    isLoading: loading,
    user,
    checkAuth,
    requireAuthentication,
    requireOwnership,
  };
};
