/**
 * 🚀 Production Entry Point
 * Optimized for https://ullrichbau.app deployment
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import UniversalDesktop from './UniversalDesktop'
import './styles/index.css'

// Production Error Boundary
class ProductionErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Production Error:', error, errorInfo);
    
    // Send to monitoring service in production
    if (import.meta.env.PROD) {
      // Analytics/monitoring integration would go here
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="production-error-fallback">
          <div className="error-content">
            <h1>🏗️ ULLRICHBAU - Maintenance Mode</h1>
            <p>The UniversalDesktop is temporarily under maintenance.</p>
            <p>Quality is our standard - we'll be back shortly!</p>
            <button 
              onClick={() => window.location.reload()}
              className="reload-button"
            >
              🔄 Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Performance monitoring
if (import.meta.env.PROD) {
  // Web Vitals monitoring would be initialized here
  // Performance metrics collection for ULLRICHBAU analytics
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ProductionErrorBoundary>
      <UniversalDesktop />
    </ProductionErrorBoundary>
  </React.StrictMode>,
)