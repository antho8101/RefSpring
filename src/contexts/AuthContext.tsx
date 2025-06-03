
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
    console.log('🔐 AuthProvider - Initialisation ULTRA-RAPIDE');
    
    // Timeout très court : si Firebase met plus d'1 seconde, on affiche l'interface
    const quickTimeoutId = setTimeout(() => {
      console.log('🔐 Timeout 1s atteint - affichage immédiat de l\'interface');
      setLoading(false);
    }, 1000);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('🔐 Firebase Auth state changed:', user ? 'CONNECTÉ' : 'DÉCONNECTÉ');
      setUser(user);
      setLoading(false);
      clearTimeout(quickTimeoutId); // On annule le timeout si Firebase répond
      
      if (user) {
        console.log('🔐 Utilisateur authentifié:', user.uid);
      } else {
        console.log('🔐 Utilisateur déconnecté');
      }
    });

    return () => {
      unsubscribe();
      clearTimeout(quickTimeoutId);
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
