
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
    console.log('🔐 AUTH: Initialisation du contexte d\'authentification');
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('🔐 AUTH: Changement d\'état d\'authentification:', user ? 'connecté' : 'déconnecté');
      setUser(user);
      setLoading(false);
      
      // Sauvegarder l'état d'authentification simplement
      if (user) {
        const userData = {
          uid: user.uid,
          email: user.email,
          timestamp: Date.now()
        };
        localStorage.setItem('auth_user', JSON.stringify(userData));
        console.log('🔐 AUTH: Session sauvegardée');
      } else {
        localStorage.removeItem('auth_user');
        console.log('🔐 AUTH: Session supprimée');
      }
    });

    // Vérifier si on a une session sauvegardée au démarrage
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        // Vérifier que la session n'est pas trop ancienne (24h max)
        if (Date.now() - userData.timestamp < 24 * 60 * 60 * 1000) {
          console.log('🔐 AUTH: Session locale trouvée, attente de la vérification Firebase');
        } else {
          console.log('🔐 AUTH: Session locale expirée, suppression');
          localStorage.removeItem('auth_user');
        }
      } catch (error) {
        console.error('🔐 AUTH: Erreur lecture session locale:', error);
        localStorage.removeItem('auth_user');
      }
    }

    return unsubscribe;
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    console.log('🔐 AUTH: Tentative de connexion avec email');
    return await signInWithEmailAndPassword(auth, email, password);
  };

  const signUpWithEmail = async (email: string, password: string) => {
    console.log('🔐 AUTH: Tentative d\'inscription avec email');
    return await createUserWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = async () => {
    console.log('🔐 AUTH: Tentative de connexion avec Google');
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
