/**
 * 🎭 useQuickDemo - Instant Demo Authentication
 * 
 * Bypasses complex authentication for immediate demo access.
 * Perfect for development and quick testing.
 */

import { useState, useEffect } from 'react';
import type { User, Session } from '@supabase/supabase-js';

// Demo user for instant access
const DEMO_USER: User = {
  id: 'demo-user-quickstart',
  email: 'demo@ullrichbau.app',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  email_confirmed_at: new Date().toISOString(),
  app_metadata: { 
    provider: 'demo',
    role: 'developer'
  },
  user_metadata: { 
    name: 'ULLRICHBAU Demo User',
    avatar_url: '🏗️',
    role: 'developer'
  },
  aud: 'authenticated',
  role: 'authenticated'
} as User;

const DEMO_SESSION: Session = {
  access_token: 'demo-access-token-ullrichbau',
  refresh_token: 'demo-refresh-token-ullrichbau',
  expires_in: 3600,
  expires_at: Date.now() + 3600000,
  token_type: 'bearer',
  user: DEMO_USER
} as Session;

interface QuickDemoReturn {
  user: User;
  session: Session;
  loading: boolean;
  isAuthenticated: boolean;
  authMethod: 'demo';
}

export const useQuickDemo = (): QuickDemoReturn => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate quick initialization
    const timer = setTimeout(() => {
      setLoading(false);
      console.log('🎭 Quick Demo Authentication activated!');
      console.log('🏗️ ULLRICHBAU Demo User ready for UniversalDesktop');
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return {
    user: DEMO_USER,
    session: DEMO_SESSION,
    loading,
    isAuthenticated: true,
    authMethod: 'demo'
  };
};