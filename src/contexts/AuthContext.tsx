
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier le cache localStorage d'abord
    const cachedUser = localStorage.getItem('auth_user');
    if (cachedUser) {
      console.log('🔥 Cache utilisateur trouvé, chargement instantané');
      setLoading(false);
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('🔥 Auth state changed:', user ? 'Connected' : 'Disconnected');
      setUser(user);
      setLoading(false);
      
      // Cache simple
      if (user) {
        localStorage.setItem('auth_user', 'true');
      } else {
        localStorage.removeItem('auth_user');
      }
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
