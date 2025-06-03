
import { useEffect, useState } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { useErrorHandler } from './useErrorHandler';
import { useRetry } from './useRetry';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { handleError } = useErrorHandler();
  const { executeWithRetry } = useRetry({ maxRetries: 2 });

  useEffect(() => {
    console.log('🔐 Initialisation de l\'authentification...');
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('🔐 État d\'authentification changé:', user ? 'Connecté' : 'Déconnecté');
      setUser(user);
      setLoading(false);
    }, (error) => {
      console.error('🚨 Erreur d\'authentification:', error);
      handleError(error, { 
        showToast: true,
        logError: true 
      });
      setLoading(false);
    });

    return unsubscribe;
  }, [handleError]);

  const signInWithEmail = async (email: string, password: string) => {
    console.log('🔐 Tentative de connexion avec email:', email);
    try {
      const result = await executeWithRetry(
        () => signInWithEmailAndPassword(auth, email, password),
        { component: 'useAuth', action: 'signInWithEmail' }
      );
      console.log('✅ Connexion réussie:', result.user.uid);
    } catch (error) {
      console.error('❌ Erreur de connexion:', error);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    console.log('🔐 Tentative de création de compte avec email:', email);
    try {
      const result = await executeWithRetry(
        () => createUserWithEmailAndPassword(auth, email, password),
        { component: 'useAuth', action: 'signUpWithEmail' }
      );
      console.log('✅ Compte créé:', result.user.uid);
    } catch (error) {
      console.error('❌ Erreur de création de compte:', error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    console.log('🔐 Tentative de connexion avec Google');
    try {
      const result = await executeWithRetry(
        () => signInWithPopup(auth, googleProvider),
        { component: 'useAuth', action: 'signInWithGoogle' }
      );
      console.log('✅ Connexion Google réussie:', result.user.uid);
    } catch (error) {
      console.error('❌ Erreur de connexion Google:', error);
      throw error;
    }
  };

  const logout = async () => {
    console.log('🔐 Tentative de déconnexion');
    try {
      await executeWithRetry(
        () => signOut(auth),
        { component: 'useAuth', action: 'logout' }
      );
      console.log('✅ Déconnexion réussie');
    } catch (error) {
      console.error('❌ Erreur de déconnexion:', error);
      throw error;
    }
  };

  return {
    user,
    loading,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    logout
  };
};
