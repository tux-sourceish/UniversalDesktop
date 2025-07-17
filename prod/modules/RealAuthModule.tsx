/**
 * 🔐 RealAuthModule - Real Supabase Authentication
 * 
 * Uses actual Supabase credentials with fallback to demo authentication.
 * Supports ull-admin user and graceful error handling.
 */

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import type { UniversalDesktopSession } from '../types';

interface RealAuthModuleProps {
  children: (sessionData: UniversalDesktopSession) => React.ReactNode;
}

// Demo user for fallback
const DEMO_USER = {
  id: 'ull-admin-demo',
  email: 'ull-admin@ullrichbau.app',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  email_confirmed_at: new Date().toISOString(),
  app_metadata: { provider: 'demo', role: 'admin' },
  user_metadata: { name: 'ULLRICHBAU Admin', role: 'admin' },
  aud: 'authenticated',
  role: 'authenticated'
};

const DEMO_SESSION = {
  access_token: 'demo-admin-token',
  refresh_token: 'demo-admin-refresh',
  expires_in: 3600,
  expires_at: Date.now() + 3600000,
  token_type: 'bearer',
  user: DEMO_USER
};

export const RealAuthModule: React.FC<RealAuthModuleProps> = ({ children }) => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authMethod, setAuthMethod] = useState<'supabase' | 'demo'>('demo');

  // Initialize with demo auth immediately
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Try to create Supabase client
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

        if (supabaseUrl && supabaseKey && supabaseUrl !== 'https://demo.supabase.co') {
          console.log('🔐 Attempting real Supabase authentication...');
          
          const supabase = createClient(supabaseUrl, supabaseKey);
          
          // Try to get existing session
          const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
          
          if (!sessionError && sessionData.session) {
            console.log('✅ Supabase session found');
            setSession(sessionData.session);
            setAuthMethod('supabase');
          } else {
            // Try to sign in with demo credentials
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
              email: 'ull-admin',
              password: 'test123'
            });
            
            if (!signInError && signInData.session) {
              console.log('✅ Supabase sign in successful');
              setSession(signInData.session);
              setAuthMethod('supabase');
            } else {
              throw new Error('Supabase authentication failed');
            }
          }
        } else {
          throw new Error('Supabase not configured');
        }
      } catch (err) {
        console.warn('🎭 Falling back to demo authentication:', err);
        
        // Fallback to demo authentication
        setSession(DEMO_SESSION);
        setAuthMethod('demo');
        setError(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="auth-loading">
        <div className="loading-content">
          <div className="loading-spinner">🔐</div>
          <div className="loading-text">Authenticating...</div>
          <div className="loading-subtext">ULLRICHBAU Security Check</div>
        </div>
        
        <style>{`
          .auth-loading {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: linear-gradient(135deg, #1a7f56 0%, #0f5132 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            z-index: 10000;
          }
          
          .loading-content {
            text-align: center;
          }
          
          .loading-spinner {
            font-size: 3rem;
            margin-bottom: 1rem;
            animation: pulse 2s infinite;
          }
          
          .loading-text {
            font-size: 1.2rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
          }
          
          .loading-subtext {
            font-size: 0.9rem;
            opacity: 0.8;
          }
          
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
        `}</style>
      </div>
    );
  }

  // Success - render children with session
  return (
    <>
      {children({ session, user: session?.user })}
      
      {/* Auth Status Indicator */}
      <div style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        background: authMethod === 'supabase' ? 'rgba(26, 127, 86, 0.9)' : 'rgba(255, 193, 7, 0.9)',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '6px',
        fontSize: '11px',
        fontWeight: 'bold',
        zIndex: 10000,
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <div>🔐 {authMethod === 'supabase' ? 'Supabase' : 'Demo'} Auth</div>
        <div>🏗️ ULLRICHBAU Quality</div>
        <div>👤 {session?.user?.email || 'ull-admin@ullrichbau.app'}</div>
        {error && <div style={{ color: '#ffcccb', fontSize: '10px' }}>⚠️ {error}</div>}
      </div>
    </>
  );
};