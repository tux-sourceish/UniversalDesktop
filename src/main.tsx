import React from 'react'
import ReactDOM from 'react-dom/client'
import UniversalDesktop from './UniversalDesktop'
import ErrorBoundary from './components/ErrorBoundary'
import './index.css'

// Hide loading screen when app loads
const hideLoadingScreen = () => {
  const loadingScreen = document.querySelector('.loading-screen');
  if (loadingScreen) {
    (loadingScreen as HTMLElement).style.opacity = '0';
    (loadingScreen as HTMLElement).style.transition = 'opacity 0.5s ease-out';
    setTimeout(() => {
      loadingScreen.remove();
    }, 500);
  }
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <UniversalDesktop />
    </ErrorBoundary>
  </React.StrictMode>,
)

// Hide loading screen after component mounts
setTimeout(hideLoadingScreen, 1000);