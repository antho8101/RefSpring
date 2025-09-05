import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

// Adaptateur pour maintenir la compatibilité avec Firebase
interface CompatibleUser {
  uid: string;
  email: string | null;
  id: string;
}

interface AuthContextType {
  user: CompatibleUser | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<any>;
  signUpWithEmail: (email: string, password: string) => Promise<any>;
  signInWithGoogle: () => Promise<any>;
  signOut: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

// Fonction pour adapter un utilisateur Supabase vers l'interface compatible
const adaptUser = (supabaseUser: SupabaseUser | null): CompatibleUser | null => {
  if (!supabaseUser) return null;
  
  return {
    uid: supabaseUser.id, // Supabase utilise 'id', Firebase utilise 'uid'
    email: supabaseUser.email || null,
    id: supabaseUser.id,
  };
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<CompatibleUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔐 SUPABASE AUTH: Initialisation du contexte d\'authentification');
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔐 SUPABASE AUTH: Changement d\'état:', event, session ? 'connecté' : 'déconnecté');
        setSession(session);
        setUser(adaptUser(session?.user ?? null));
        setLoading(false);
        
        // Supabase gère automatiquement la persistance via localStorage
        if (session?.user) {
          console.log('🔐 SUPABASE AUTH: Session active pour:', session.user.email);
        } else {
          console.log('🔐 SUPABASE AUTH: Aucune session active');
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('🔐 SUPABASE AUTH: Session initiale:', session ? 'trouvée' : 'absente');
      setSession(session);
      setUser(adaptUser(session?.user ?? null));
      setLoading(false);
    });

    return () => {
      console.log('🔐 SUPABASE AUTH: Nettoyage du listener');
      subscription.unsubscribe();
    };
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    console.log('🔐 SUPABASE AUTH: Tentative de connexion avec email');
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  const signUpWithEmail = async (email: string, password: string) => {
    console.log('🔐 SUPABASE AUTH: Tentative d\'inscription avec email');
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    if (error) throw error;
    return data;
  };

  const signInWithGoogle = async () => {
    console.log('🔐 SUPABASE AUTH: Tentative de connexion avec Google');
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`
      }
    });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    console.log('🔐 SUPABASE AUTH: Déconnexion');
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signInWithEmail, 
      signUpWithEmail, 
      signInWithGoogle,
      signOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};