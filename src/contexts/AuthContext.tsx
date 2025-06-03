
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
    console.log('🔐 AuthProvider - Initialisation ULTRA-RAPIDE optimisée');
    
    // Vérifier d'abord le cache local pour un affichage immédiat
    const cachedAuthState = localStorage.getItem('firebase_auth_cache');
    if (cachedAuthState) {
      console.log('🔐 Cache auth trouvé - affichage immédiat');
      setLoading(false);
    }
    
    // Timeout encore plus court : 500ms maximum
    const ultraQuickTimeoutId = setTimeout(() => {
      console.log('🔐 Timeout 500ms atteint - FORCER l\'affichage');
      setLoading(false);
    }, 500);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('🔐 Firebase Auth state changed:', user ? 'CONNECTÉ' : 'DÉCONNECTÉ');
      setUser(user);
      setLoading(false);
      clearTimeout(ultraQuickTimeoutId);
      
      // Mettre en cache l'état d'authentification
      localStorage.setItem('firebase_auth_cache', user ? 'authenticated' : 'anonymous');
      
      if (user) {
        console.log('🔐 Utilisateur authentifié:', user.uid);
      } else {
        console.log('🔐 Utilisateur déconnecté');
        localStorage.removeItem('firebase_auth_cache');
      }
    });

    return () => {
      unsubscribe();
      clearTimeout(ultraQuickTimeoutId);
    };
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    console.log('🔐 Tentative connexion email...');
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signUpWithEmail = async (email: string, password: string) => {
    console.log('🔐 Tentative création compte...');
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = async () => {
    console.log('🔐 Tentative connexion Google...');
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
