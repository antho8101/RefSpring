
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<any>;
  signUpWithEmail: (email: string, password: string) => Promise<any>;
  signInWithGoogle: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  signInWithGoogle: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔐 AuthProvider - Démarrage simple');
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('🔐 Auth state:', user ? 'CONNECTÉ' : 'DÉCONNECTÉ');
      setUser(user);
      setLoading(false);
    }, (error) => {
      console.error('🚨 Erreur Auth:', error);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    console.log('🔐 Connexion email simple...');
    return await signInWithEmailAndPassword(auth, email, password);
  };

  const signUpWithEmail = async (email: string, password: string) => {
    console.log('🔐 Création compte simple...');
    return await createUserWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = async () => {
    console.log('🔐 Connexion Google simple...');
    return await signInWithPopup(auth, googleProvider);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signInWithEmail, 
      signUpWithEmail, 
      signInWithGoogle 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
