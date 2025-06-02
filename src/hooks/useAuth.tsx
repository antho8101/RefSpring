
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
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    }, (error) => {
      handleError(error, { 
        showToast: true,
        logError: true 
      });
      setLoading(false);
    });

    return unsubscribe;
  }, [handleError]);

  const signInWithEmail = async (email: string, password: string) => {
    try {
      await executeWithRetry(
        () => signInWithEmailAndPassword(auth, email, password),
        { component: 'useAuth', action: 'signInWithEmail' }
      );
    } catch (error) {
      throw error; // L'erreur a déjà été gérée par executeWithRetry
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    try {
      await executeWithRetry(
        () => createUserWithEmailAndPassword(auth, email, password),
        { component: 'useAuth', action: 'signUpWithEmail' }
      );
    } catch (error) {
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      await executeWithRetry(
        () => signInWithPopup(auth, googleProvider),
        { component: 'useAuth', action: 'signInWithGoogle' }
      );
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await executeWithRetry(
        () => signOut(auth),
        { component: 'useAuth', action: 'logout' }
      );
    } catch (error) {
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
