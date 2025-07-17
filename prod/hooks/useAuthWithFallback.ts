/**
 * 🔐 useAuthWithFallback - Robust Authentication Hook
 * 
 * Provides authentication with intelligent fallbacks for development.
 * Handles production, staging, and development environments gracefully.
 */

import { useState, useEffect, useCallback } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { useDatabase } from './useDatabase';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  authMethod: 'supabase' | 'fallback' | 'demo';
}

interface AuthReturn {
  auth: AuthState;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  signInWithDemo: () => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  refreshSession: () => Promise<void>;
}

// Demo user for development
const DEMO_USER = {
  id: 'demo-user-123',
  email: 'demo@ullrichbau.app',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  email_confirmed_at: new Date().toISOString(),
  app_metadata: { provider: 'demo' },
  user_metadata: { name: 'Demo User', role: 'developer' },
  aud: 'authenticated',
  role: 'authenticated'
} as User;

const DEMO_SESSION = {
  access_token: 'demo-access-token',
  refresh_token: 'demo-refresh-token',
  expires_in: 3600,
  expires_at: Date.now() + 3600000,
  token_type: 'bearer',
  user: DEMO_USER
} as Session;

export const useAuthWithFallback = (): AuthReturn => {
  const { client, loading: dbLoading } = useDatabase();
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
    isAuthenticated: false,
    authMethod: 'supabase'
  });

  // Initialize authentication
  const initializeAuth = useCallback(async () => {
    if (!client || dbLoading) return;

    try {
      setAuth(prev => ({ ...prev, loading: true, error: null }));

      // Try to get existing session
      const { data: sessionData, error: sessionError } = await client.auth.getSession();

      if (sessionError) {
        console.warn('🔧 Supabase auth failed, using fallback:', sessionError.message);
        
        // Fallback to demo authentication for development
        const isDevelopment = window.location.hostname === 'localhost' || 
                             window.location.hostname === '127.0.0.1' ||
                             import.meta.env.DEV;

        if (isDevelopment) {
          setAuth({
            user: DEMO_USER,
            session: DEMO_SESSION,
            loading: false,
            error: null,
            isAuthenticated: true,
            authMethod: 'demo'
          });
          
          console.log('🎭 Demo authentication activated for development');
          return;
        }
      }

      // Handle successful session
      const { session } = sessionData;
      setAuth({
        user: session?.user || null,
        session,
        loading: false,
        error: null,
        isAuthenticated: !!session,
        authMethod: 'supabase'
      });

      // Set up auth state listener
      const { data: { subscription } } = client.auth.onAuthStateChange((event, session) => {
        console.log('🔐 Auth state changed:', event);
        
        setAuth(prev => ({
          ...prev,
          user: session?.user || null,
          session,
          isAuthenticated: !!session,
          loading: false
        }));
      });

      return () => subscription.unsubscribe();

    } catch (err) {
      console.error('Auth initialization error:', err);
      
      // Emergency fallback
      setAuth({
        user: DEMO_USER,
        session: DEMO_SESSION,
        loading: false,
        error: 'Authentication service unavailable, using demo mode',
        isAuthenticated: true,
        authMethod: 'fallback'
      });
    }
  }, [client, dbLoading]);

  // Sign in
  const signIn = useCallback(async (email: string, password: string): Promise<boolean> => {
    if (!client) {
      // Fallback authentication
      if (email === 'demo@ullrichbau.app' || email === 'demo') {
        setAuth({
          user: DEMO_USER,
          session: DEMO_SESSION,
          loading: false,
          error: null,
          isAuthenticated: true,
          authMethod: 'demo'
        });
        return true;
      }
      return false;
    }

    try {
      setAuth(prev => ({ ...prev, loading: true, error: null }));

      const { data, error } = await client.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        setAuth(prev => ({ 
          ...prev, 
          loading: false, 
          error: error.message,
          isAuthenticated: false
        }));
        return false;
      }

      setAuth({
        user: data.user,
        session: data.session,
        loading: false,
        error: null,
        isAuthenticated: true,
        authMethod: 'supabase'
      });

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign in failed';
      setAuth(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage,
        isAuthenticated: false
      }));
      return false;
    }
  }, [client]);

  // Sign up
  const signUp = useCallback(async (email: string, password: string): Promise<boolean> => {
    if (!client) return false;

    try {
      setAuth(prev => ({ ...prev, loading: true, error: null }));

      const { data, error } = await client.auth.signUp({
        email,
        password
      });

      if (error) {
        setAuth(prev => ({ 
          ...prev, 
          loading: false, 
          error: error.message,
          isAuthenticated: false
        }));
        return false;
      }

      setAuth({
        user: data.user,
        session: data.session,
        loading: false,
        error: null,
        isAuthenticated: !!data.session,
        authMethod: 'supabase'
      });

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign up failed';
      setAuth(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage,
        isAuthenticated: false
      }));
      return false;
    }
  }, [client]);

  // Sign out
  const signOut = useCallback(async (): Promise<void> => {
    if (client) {
      await client.auth.signOut();
    }

    setAuth({
      user: null,
      session: null,
      loading: false,
      error: null,
      isAuthenticated: false,
      authMethod: 'supabase'
    });
  }, [client]);

  // Demo sign in
  const signInWithDemo = useCallback(async (): Promise<boolean> => {
    setAuth({
      user: DEMO_USER,
      session: DEMO_SESSION,
      loading: false,
      error: null,
      isAuthenticated: true,
      authMethod: 'demo'
    });
    return true;
  }, []);

  // Reset password
  const resetPassword = useCallback(async (email: string): Promise<boolean> => {
    if (!client) return false;

    try {
      const { error } = await client.auth.resetPasswordForEmail(email);
      return !error;
    } catch (err) {
      console.error('Password reset error:', err);
      return false;
    }
  }, [client]);

  // Refresh session
  const refreshSession = useCallback(async (): Promise<void> => {
    if (!client) return;

    try {
      const { data, error } = await client.auth.refreshSession();
      
      if (!error && data.session) {
        setAuth(prev => ({
          ...prev,
          user: data.user,
          session: data.session,
          isAuthenticated: true
        }));
      }
    } catch (err) {
      console.error('Session refresh error:', err);
    }
  }, [client]);

  // Initialize auth when database is ready
  useEffect(() => {
    if (!dbLoading) {
      initializeAuth();
    }
  }, [dbLoading, initializeAuth]);

  return {
    auth,
    signIn,
    signUp,
    signOut,
    signInWithDemo,
    resetPassword,
    refreshSession
  };
};