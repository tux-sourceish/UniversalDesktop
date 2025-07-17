/**
 * 🔐 AuthModule - Authentication & Session Management
 * Extracted from monolithic structure for reusability
 */

import React, { useState, useEffect } from 'react';
import { enhancedSupabase } from '../services/supabaseClient';
import LoginPage from '../components/LoginPage';
import type { UniversalDesktopSession } from '../types';

interface AuthModuleProps {
  children: (sessionData: UniversalDesktopSession) => React.ReactNode;
  onAuthStateChange?: (session: any) => void;
}

export const AuthModule: React.FC<AuthModuleProps> = ({ 
  children, 
  onAuthStateChange 
}) => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    enhancedSupabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      onAuthStateChange?.(session);
    });

    // Listen for auth changes
    const { data: { subscription } } = enhancedSupabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setLoading(false);
        onAuthStateChange?.(session);
      }
    );

    return () => subscription.unsubscribe();
  }, [onAuthStateChange]);

  if (loading) {
    return (
      <div className="auth-loading">
        <div className="loading-spinner">🌌 Loading UniversalDesktop...</div>
      </div>
    );
  }

  if (!session) {
    return <LoginPage />;
  }

  return <>{children({ session, user: session.user })}</>;
};