/**
 * 🔐 Secure Authentication Hook
 * Enhanced authentication with security monitoring and rate limiting
 */

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { secureStorage } from '@/utils/secureClientStorage';
import { rateLimiters } from '@/utils/inputValidation';
import { securityMonitoring } from '@/utils/security';
import { toast } from 'sonner';

interface SecureAuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  authenticated: boolean;
}

interface AuthAttemptLog {
  timestamp: number;
  success: boolean;
  method: string;
  ip?: string;
}

export const useSecureAuth = () => {
  const [authState, setAuthState] = useState<SecureAuthState>({
    user: null,
    session: null,
    loading: true,
    authenticated: false
  });

  // Monitor authentication attempts
  const logAuthAttempt = useCallback((method: string, success: boolean, details?: any) => {
    const attemptLog: AuthAttemptLog = {
      timestamp: Date.now(),
      success,
      method
    };

    // Store in secure storage for monitoring
    secureStorage.setAuthData(`auth_attempt_${Date.now()}`, attemptLog, 1);

    // Log security event
    securityMonitoring.logSuspiciousActivity({
      type: success ? 'successful_authentication' : 'failed_authentication',
      details: {
        method,
        ...details,
        timestamp: attemptLog.timestamp
      }
    });

    if (!success) {
      console.warn('🔐 AUTH: Authentication attempt failed', { method, details });
    }
  }, []);

  // Check for rate limiting on auth attempts
  const checkAuthRateLimit = useCallback((ip: string = 'unknown') => {
    const isAllowed = rateLimiters.auth.isAllowed({ ip });
    
    if (!isAllowed) {
      securityMonitoring.logSuspiciousActivity({
        type: 'auth_rate_limit_exceeded',
        ip,
        details: {
          timestamp: Date.now(),
          maxRequests: 10,
          windowMs: 15 * 60 * 1000
        }
      });
      
      toast.error('Too many authentication attempts. Please wait before trying again.');
      throw new Error('Rate limit exceeded');
    }
    
    return true;
  }, []);

  // Secure sign up with comprehensive validation
  const signUp = useCallback(async (email: string, password: string) => {
    try {
      // Rate limiting check
      checkAuthRateLimit();

      // Input validation
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Invalid email format');
      }

      // Check for common weak passwords
      const weakPasswords = ['password', '12345678', 'qwerty123', 'password123'];
      if (weakPasswords.includes(password.toLowerCase())) {
        throw new Error('Password is too weak. Please choose a stronger password.');
      }

      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) {
        logAuthAttempt('signup', false, { error: error.message, email });
        throw error;
      }

      logAuthAttempt('signup', true, { email, userId: data.user?.id });
      
      return { data, error: null };
      
    } catch (error: any) {
      logAuthAttempt('signup', false, { error: error.message, email });
      console.error('🔐 AUTH: Sign up error:', error);
      return { data: null, error };
    }
  }, [checkAuthRateLimit, logAuthAttempt]);

  // Secure sign in with monitoring
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      // Rate limiting check
      checkAuthRateLimit();

      // Input validation
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password
      });

      if (error) {
        logAuthAttempt('signin', false, { error: error.message, email });
        throw error;
      }

      // Store secure session data
      if (data.session) {
        secureStorage.setAuthData('last_signin', {
          timestamp: Date.now(),
          userId: data.user?.id,
          email: data.user?.email
        }, 24);
      }

      logAuthAttempt('signin', true, { email, userId: data.user?.id });
      
      return { data, error: null };
      
    } catch (error: any) {
      logAuthAttempt('signin', false, { error: error.message, email });
      console.error('🔐 AUTH: Sign in error:', error);
      return { data: null, error };
    }
  }, [checkAuthRateLimit, logAuthAttempt]);

  // Secure sign out with cleanup
  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('🔐 AUTH: Sign out error:', error);
        throw error;
      }

      // Clear sensitive data from secure storage
      const currentUser = authState.user;
      if (currentUser) {
        logAuthAttempt('signout', true, { userId: currentUser.id });
        
        // Clean up user-specific secure storage
        secureStorage.removeSecure('auth_last_signin');
        secureStorage.cleanExpiredData();
      }

      return { error: null };
      
    } catch (error: any) {
      logAuthAttempt('signout', false, { error: error.message });
      return { error };
    }
  }, [authState.user, logAuthAttempt]);

  // Initialize auth state and monitoring
  useEffect(() => {
    let mounted = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('🔐 AUTH: State change event:', event);

        // Security monitoring for auth events
        if (event === 'SIGNED_IN' && session?.user) {
          securityMonitoring.logSuspiciousActivity({
            type: 'user_session_started',
            userId: session.user.id,
            details: {
              event,
              timestamp: Date.now(),
              userAgent: navigator.userAgent
            }
          });
        }

        if (event === 'SIGNED_OUT') {
          securityMonitoring.logSuspiciousActivity({
            type: 'user_session_ended',
            details: {
              event,
              timestamp: Date.now()
            }
          });
        }

        setAuthState({
          user: session?.user ?? null,
          session: session,
          loading: false,
          authenticated: !!session?.user
        });
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        setAuthState({
          user: session?.user ?? null,
          session: session,
          loading: false,
          authenticated: !!session?.user
        });
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Session validation
  const validateSession = useCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        console.warn('🔐 AUTH: Session validation failed');
        return false;
      }

      // Check if session is close to expiring (refresh if less than 5 minutes left)
      const expiresAt = session.expires_at ? session.expires_at * 1000 : 0;
      const fiveMinutes = 5 * 60 * 1000;
      
      if (expiresAt - Date.now() < fiveMinutes) {
        console.log('🔐 AUTH: Refreshing session');
        const { error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError) {
          console.error('🔐 AUTH: Session refresh failed:', refreshError);
          return false;
        }
      }

      return true;
      
    } catch (error) {
      console.error('🔐 AUTH: Session validation error:', error);
      return false;
    }
  }, []);

  return {
    ...authState,
    signUp,
    signIn,
    signOut,
    validateSession,
    isLoading: authState.loading
  };
};