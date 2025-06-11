
import { useAuth } from '@/hooks/useAuth';
import { useMemo } from 'react';

const ADMIN_EMAIL = 'carayon.anthony@gmail.com';

export const useAdminAuth = () => {
  const { user, loading } = useAuth();

  const isAdmin = useMemo(() => {
    if (!user?.email) return false;
    return user.email === ADMIN_EMAIL;
  }, [user?.email]);

  const requireAdmin = () => {
    if (!user) {
      throw new Error('Authentification requise');
    }
    if (!isAdmin) {
      throw new Error('Accès administrateur requis');
    }
    return true;
  };

  return {
    isAdmin,
    isAuthenticated: !!user,
    loading,
    adminEmail: ADMIN_EMAIL,
    currentEmail: user?.email,
    requireAdmin,
  };
};
