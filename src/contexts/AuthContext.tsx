
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
    console.log('🔐 AuthProvider - TIMEOUT COURT de 2 secondes');
    
    // TIMEOUT AGRESSIF : Si pas de réponse en 2 secondes, on force l'affichage
    const forceTimeout = setTimeout(() => {
      console.log('🔐 TIMEOUT 2s atteint - FORCER l\'affichage immédiatement');
      setLoading(false);
    }, 2000); // 2 secondes seulement !

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('🔐 Firebase Auth réponse reçue:', user ? 'CONNECTÉ' : 'DÉCONNECTÉ');
      clearTimeout(forceTimeout); // Annuler le timeout si on a une réponse
      setUser(user);
      setLoading(false);
    }, (error) => {
      console.error('🚨 Erreur Auth:', error);
      clearTimeout(forceTimeout); // Annuler le timeout même en cas d'erreur
      setLoading(false);
    });

    // Cleanup
    return () => {
      clearTimeout(forceTimeout);
      unsubscribe();
    };
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    console.log('🔐 Tentative connexion email...');
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Connexion email réussie');
      return result;
    } catch (error) {
      console.error('❌ Erreur connexion email:', error);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    console.log('🔐 Tentative création compte...');
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      console.log('✅ Création compte réussie');
      return result;
    } catch (error) {
      console.error('❌ Erreur création compte:', error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    console.log('🔐 Tentative connexion Google...');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log('✅ Connexion Google réussie');
      return result;
    } catch (error) {
      console.error('❌ Erreur connexion Google:', error);
      throw error;
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
