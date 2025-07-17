/**
 * 🔐 AuthModuleV2 - Enhanced Authentication with Fallback Support
 * Extracted from monolithic structure with intelligent fallback systems
 */

import React from 'react';
import { useAuthWithFallback } from '../hooks/useAuthWithFallback';
import LoginPage from '../components/LoginPage';
import type { UniversalDesktopSession } from '../types';

interface AuthModuleProps {
  children: (sessionData: UniversalDesktopSession) => React.ReactNode;
  onAuthStateChange?: (session: any) => void;
}

export const AuthModuleV2: React.FC<AuthModuleProps> = ({ 
  children, 
  onAuthStateChange 
}) => {
  const { auth, signInWithDemo } = useAuthWithFallback();

  // Notify parent of auth state changes
  React.useEffect(() => {
    if (auth.user) {
      onAuthStateChange?.(auth.session);
    }
  }, [auth.user, auth.session, onAuthStateChange]);

  // Loading state
  if (auth.loading) {
    return (
      <div className="auth-loading">
        <div className="loading-content">
          <div className="loading-spinner">🌌</div>
          <div className="loading-text">Loading UniversalDesktop...</div>
          <div className="loading-subtext">
            {auth.authMethod === 'demo' && 'Demo mode active'}
            {auth.authMethod === 'fallback' && 'Fallback authentication'}
            {auth.authMethod === 'supabase' && 'Supabase authentication'}
          </div>
        </div>
      </div>
    );
  }

  // Authentication required
  if (!auth.isAuthenticated) {
    return (
      <div className="auth-wrapper">
        <LoginPage />
        
        {/* Development Demo Button */}
        {import.meta.env.DEV && (
          <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 10000
          }}>
            <button
              onClick={signInWithDemo}
              style={{
                background: 'rgba(26, 127, 86, 0.9)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '10px 15px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 'bold'
              }}
            >
              🎭 Demo Login
            </button>
          </div>
        )}
      </div>
    );
  }

  // Success - render children with session data
  return (
    <>
      {children({ 
        session: auth.session, 
        user: auth.user 
      })}
      
      {/* Auth Status Indicator */}
      {import.meta.env.DEV && (
        <div style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '11px',
          zIndex: 10000
        }}>
          <div>🔐 {auth.authMethod} auth</div>
          <div>👤 {auth.user?.email || 'Demo User'}</div>
          {auth.error && <div style={{ color: '#ff6b6b' }}>⚠️ {auth.error}</div>}
        </div>
      )}
    </>
  );
};