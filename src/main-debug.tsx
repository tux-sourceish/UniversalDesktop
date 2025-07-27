import React from 'react';
import ReactDOM from 'react-dom/client';

// Minimal test component
function DebugApp() {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'red',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '2rem',
      zIndex: 10000
    }}>
      🚀 REACT APP MOUNTED SUCCESSFULLY!
    </div>
  );
}

console.log('🔍 Debug: Starting React mount...');

try {
  const root = ReactDOM.createRoot(document.getElementById('root')!);
  console.log('🔍 Debug: Root created successfully');
  
  root.render(
    <React.StrictMode>
      <DebugApp />
    </React.StrictMode>
  );
  console.log('🔍 Debug: React render called');
} catch (error) {
  console.error('🚨 Debug: React mount failed:', error);
}