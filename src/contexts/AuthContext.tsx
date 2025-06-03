
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
    console.log('🔐 AuthProvider - DÉMARRAGE avec timeout de 1.5 secondes');
    
    // TIMEOUT ULTRA COURT : 1.5 secondes max
    const forceTimeout = setTimeout(() => {
      console.log('🔐 TIMEOUT 1.5s atteint - FORCER l\'affichage immédiatement');
      setLoading(false);
    }, 1500); // 1.5 secondes seulement !

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('🔐 Firebase Auth réponse reçue:', user ? 'CONNECTÉ' : 'DÉCONNECTÉ');
      clearTimeout(forceTimeout);
      setUser(user);
      setLoading(false);
    }, (error) => {
      console.error('🚨 Erreur Auth:', error);
      clearTimeout(forceTimeout);
      setLoading(false);
    });

    return () => {
      clearTimeout(forceTimeout);
      unsubscribe();
    };
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    console.log('🔐 Tentative connexion email AVEC RETRY...');
    
    // RETRY automatique en cas d'erreur réseau
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`🔐 Tentative ${attempt}/3...`);
        const result = await signInWithEmailAndPassword(auth, email, password);
        console.log('✅ Connexion email réussie');
        return result;
      } catch (error: any) {
        console.error(`❌ Erreur tentative ${attempt}:`, error.code, error.message);
        
        if (attempt === 3) {
          // Si c'est une erreur réseau, message plus clair
          if (error.code === 'auth/network-request-failed') {
            throw new Error('Problème de connexion réseau. Vérifiez votre connexion internet.');
          }
          throw error;
        }
        
        // Attendre avant retry
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    console.log('🔐 Tentative création compte AVEC RETRY...');
    
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`🔐 Création tentative ${attempt}/3...`);
        const result = await createUserWithEmailAndPassword(auth, email, password);
        console.log('✅ Création compte réussie');
        return result;
      } catch (error: any) {
        console.error(`❌ Erreur création tentative ${attempt}:`, error.code, error.message);
        
        if (attempt === 3) {
          if (error.code === 'auth/network-request-failed') {
            throw new Error('Problème de connexion réseau. Vérifiez votre connexion internet.');
          }
          throw error;
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  };

  const signInWithGoogle = async () => {
    console.log('🔐 Tentative connexion Google AVEC RETRY...');
    
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`🔐 Google tentative ${attempt}/3...`);
        const result = await signInWithPopup(auth, googleProvider);
        console.log('✅ Connexion Google réussie');
        return result;
      } catch (error: any) {
        console.error(`❌ Erreur Google tentative ${attempt}:`, error.code, error.message);
        
        if (attempt === 3) {
          if (error.code === 'auth/network-request-failed') {
            throw new Error('Problème de connexion réseau. Vérifiez votre connexion internet.');
          }
          throw error;
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
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
