import React from 'react';

// Minimal version to test step by step
const UniversalDesktopMinimal: React.FC = () => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'linear-gradient(135deg, #1a1a1d 0%, #2c2f33 100%)',
      color: '#f4f4f4',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      fontSize: '1.5rem',
      zIndex: 10000
    }}>
      <div>🌌 UniversalDesktop v2.1</div>
      <div style={{ fontSize: '1rem', marginTop: '10px', opacity: 0.8 }}>
        Minimal version loaded successfully!
      </div>
      <div style={{ fontSize: '2rem', marginTop: '20px' }}>
        ☴ ☰ ☵ ☲ ☳ ☷ ☶ ☱
      </div>
    </div>
  );
};

export default UniversalDesktopMinimal;