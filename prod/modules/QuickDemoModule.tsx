/**
 * 🎭 QuickDemoModule - Instant Demo Access
 * 
 * Bypasses complex authentication for immediate UniversalDesktop access.
 * Perfect for development, testing, and quick demos.
 */

import React from 'react';
import { useQuickDemo } from '../hooks/useQuickDemo';
import type { UniversalDesktopSession } from '../types';

interface QuickDemoModuleProps {
  children: (sessionData: UniversalDesktopSession) => React.ReactNode;
}

export const QuickDemoModule: React.FC<QuickDemoModuleProps> = ({ children }) => {
  const { user, session, loading } = useQuickDemo();

  // Loading state
  if (loading) {
    return (
      <div className="quick-demo-loading">
        <div className="loading-content">
          <div className="loading-spinner">🏗️</div>
          <div className="loading-text">ULLRICHBAU Demo Loading...</div>
          <div className="loading-subtext">Initializing UniversalDesktop v2.0</div>
          <div className="loading-progress">
            <div className="progress-bar">
              <div className="progress-fill" style={{
                width: '100%',
                background: 'linear-gradient(90deg, #1a7f56, #0f5132)',
                height: '4px',
                borderRadius: '2px',
                animation: 'shimmer 1s ease-in-out infinite'
              }}></div>
            </div>
          </div>
        </div>
        
        <style>{`
          .quick-demo-loading {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: linear-gradient(135deg, #1a7f56 0%, #0f5132 100%);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: white;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            z-index: 10000;
          }
          
          .loading-content {
            text-align: center;
            max-width: 400px;
          }
          
          .loading-spinner {
            font-size: 4rem;
            margin-bottom: 1rem;
            animation: pulse 2s infinite;
          }
          
          .loading-text {
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
          }
          
          .loading-subtext {
            font-size: 1rem;
            opacity: 0.8;
            margin-bottom: 2rem;
          }
          
          .loading-progress {
            width: 300px;
            height: 4px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 2px;
            overflow: hidden;
            margin: 0 auto;
          }
          
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
          
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}</style>
      </div>
    );
  }

  // Success - render children with demo session
  return (
    <>
      {children({ session, user })}
      
      {/* Demo Status Indicator */}
      <div style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        background: 'rgba(26, 127, 86, 0.9)',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '6px',
        fontSize: '11px',
        fontWeight: 'bold',
        zIndex: 10000,
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <div>🎭 Demo Mode Active</div>
        <div>🏗️ ULLRICHBAU Quality</div>
        <div>👤 {user.email}</div>
      </div>
    </>
  );
};