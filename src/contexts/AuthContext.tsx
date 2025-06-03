
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
    console.log('🔐 AuthProvider - Initialisation RAPIDE');
    
    // Pas de cache localStorage qui ralentit - Firebase est assez rapide
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('🔐 Firebase Auth state changed:', user ? 'CONNECTÉ' : 'DÉCONNECTÉ');
      setUser(user);
      setLoading(false); // AUTH TERMINÉE - Interface peut s'afficher
      
      if (user) {
        console.log('🔐 Utilisateur authentifié:', user.uid);
      } else {
        console.log('🔐 Utilisateur déconnecté');
      }
    });

    // Timeout de sécurité : si Firebase met plus de 3 secondes, on affiche quand même l'interface
    const timeoutId = setTimeout(() => {
      console.log('🔐 Timeout atteint - affichage forcé de l\'interface');
      setLoading(false);
    }, 3000);

    return () => {
      unsubscribe();
      clearTimeout(timeoutId);
    };
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signUpWithEmail = async (email: string, password: string) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = async () => {
    return signInWithPopup(auth, googleProvider);
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
