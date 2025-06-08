
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
    if (!user) {
      console.log(`🔐 SECURITY - Blocked unauthorized attempt: ${action}`);
      throw new Error(`Authentification requise pour ${action}`);
    }
    
    console.log(`🔐 SECURITY - Authorized action: ${action} for user:`, user.uid);
    return true;
  }, [user]);

  // Fonction pour vérifier la propriété d'une ressource
  const requireOwnership = useCallback((resourceUserId: string, resourceType: string = 'ressource') => {
    requireAuthentication(`accéder à cette ${resourceType}`);
    
    if (user?.uid !== resourceUserId) {
      console.log(`🔐 SECURITY - Blocked unauthorized access to ${resourceType}:`, {
        currentUser: user?.uid,
        resourceOwner: resourceUserId
      });
      throw new Error(`Accès non autorisé à cette ${resourceType}`);
    }
    
    return true;
  }, [user, requireAuthentication]);

  return {
    isAuthenticated: !!user && !loading,
    isLoading: loading,
    user,
    checkAuth,
    requireAuthentication,
    requireOwnership,
  };
};
