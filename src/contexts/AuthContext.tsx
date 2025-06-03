
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
    console.log('🔐 AuthProvider - Initialisation SIMPLE');
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('🔐 Firebase Auth state changed:', user ? 'CONNECTÉ' : 'DÉCONNECTÉ');
      setUser(user);
      setLoading(false);
      
      if (user) {
        console.log('🔐 Utilisateur authentifié:', user.uid);
      } else {
        console.log('🔐 Utilisateur déconnecté');
      }
    }, (error) => {
      console.error('🚨 Erreur Auth State Changed:', error);
      setLoading(false);
    });

    return () => {
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
