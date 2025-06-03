
import { useEffect, useState, useRef } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Empêcher les initialisations multiples
    if (hasInitialized.current) {
      return;
    }

    console.log('🔐 Initialisation de l\'authentification...');
    hasInitialized.current = true;
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('🔐 État d\'authentification changé:', user ? 'Connecté' : 'Déconnecté');
      setUser(user);
      setLoading(false);
    }, (error) => {
      console.error('🚨 Erreur d\'authentification:', error);
      setLoading(false);
    });

    return unsubscribe;
  }, []); // Pas de dépendances !

  const signInWithEmail = async (email: string, password: string) => {
    console.log('🔐 Tentative de connexion avec email:', email);
    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Connexion réussie:', result.user.uid);
    } catch (error) {
      console.error('❌ Erreur de connexion:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    console.log('🔐 Tentative de création de compte avec email:', email);
    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      console.log('✅ Compte créé:', result.user.uid);
    } catch (error) {
      console.error('❌ Erreur de création de compte:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    console.log('🔐 Tentative de connexion avec Google');
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log('✅ Connexion Google réussie:', result.user.uid);
    } catch (error) {
      console.error('❌ Erreur de connexion Google:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    console.log('🔐 Tentative de déconnexion');
    setLoading(true);
    try {
      await signOut(auth);
      console.log('✅ Déconnexion réussie');
    } catch (error) {
      console.error('❌ Erreur de déconnexion:', error);
      throw error;
    } finally {
      setLoading(false);
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
