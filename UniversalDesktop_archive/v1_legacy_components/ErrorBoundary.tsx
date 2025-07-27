import { Component, ErrorInfo, ReactNode } from 'react';
import '../styles/ErrorBoundary.css';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="error-boundary">
          <div className="error-content">
            <h2>🚨 Oops! Something went wrong</h2>
            <p>The application encountered an error. Please try refreshing the page.</p>
            <details style={{ whiteSpace: 'pre-wrap', marginTop: '16px' }}>
              <summary>Error Details (for developers)</summary>
              <strong>Error:</strong> {this.state.error?.message}
              <br />
              <strong>Stack:</strong> {this.state.error?.stack}
              <br />
              <strong>Component Stack:</strong> {this.state.errorInfo?.componentStack}
            </details>
            <button 
              onClick={() => window.location.reload()}
              className="error-refresh-btn"
            >
              🔄 Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;