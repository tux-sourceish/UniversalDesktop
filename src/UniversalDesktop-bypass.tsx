import React from 'react';

// Minimal version that bypasses all hooks to test rendering
const UniversalDesktopBypass: React.FC = () => {
  console.log('🚀 Bypass component rendering');

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: '#1a1a1d',
      color: '#f4f4f4',
      position: 'relative'
    }}>
      {/* Visible indicator */}
      <div style={{
        position: 'fixed',
        top: '10px',
        left: '10px',
        background: 'lime',
        color: 'black',
        padding: '10px 20px',
        borderRadius: '4px',
        zIndex: 99999,
        fontSize: '16px',
        fontWeight: 'bold'
      }}>
        🟢 BYPASS DESKTOP RENDERING
      </div>

      {/* Simple content */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        fontSize: '2rem'
      }}>
        <div>🌌 UniversalDesktop v2.1</div>
        <div style={{fontSize: '1rem', marginTop: '20px', opacity: 0.8}}>
          Bypass mode - no hooks loaded
        </div>
        <div style={{fontSize: '2rem', marginTop: '20px'}}>
          ☴ ☰ ☵ ☲ ☳ ☷ ☶ ☱
        </div>
      </div>
    </div>
  );
};

export default UniversalDesktopBypass;