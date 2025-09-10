import React, { useState } from 'react';
import { supabase } from '../services/μ8_supabaseClient';
import '../styles/LoginPage.css';

interface LoginPageProps {
  onLogin: (session: any) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let result;
      
      if (isSignUp) {
        // Registrierung
        result = await supabase.auth.signUp({
          email,
          password,
        });
        
        if (result.error) throw result.error;
        
        if (result.data.user && !result.data.session) {
          setError('Bestätigungs-E-Mail wurde gesendet. Bitte prüfen Sie Ihr Postfach.');
          setLoading(false);
          return;
        }
      } else {
        // Anmeldung
        result = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (result.error) throw result.error;
      }

      if (result.data.session) {
        onLogin(result.data.session);
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      setError(error.message || 'Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError('');

    try {
      // Demo-Account verwenden
      const demoEmail = import.meta.env.VITE_DEMO_USER_EMAIL || 'demo@universaldesktop.com';
      const demoPassword = import.meta.env.VITE_DEMO_USER_PASSWORD || 'demo123456';

      const result = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPassword,
      });

      if (result.error) {
        // Falls Demo-Account nicht existiert, erstelle ihn
        const signUpResult = await supabase.auth.signUp({
          email: demoEmail,
          password: demoPassword,
        });

        if (signUpResult.error) throw signUpResult.error;
        
        if (signUpResult.data.session) {
          onLogin(signUpResult.data.session);
        } else {
          setError('Demo-Account wurde erstellt. Bitte verwenden Sie "demo@universaldesktop.com" mit "demo123456".');
        }
      } else if (result.data.session) {
        onLogin(result.data.session);
      }
    } catch (error: any) {
      console.error('Demo login error:', error);
      setError('Demo-Login fehlgeschlagen: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="login-form-container">
          <div className="login-header">
            <div className="login-logo">🌌</div>
            <h1>UniversalDesktop</h1>
            <p className="login-subtitle">
              Infinite intelligent workspace
            </p>
          </div>

          <div className="login-form">
            <div className="auth-tabs">
              <button 
                className={`auth-tab ${!isSignUp ? 'active' : ''}`}
                onClick={() => setIsSignUp(false)}
              >
                Anmelden
              </button>
              <button 
                className={`auth-tab ${isSignUp ? 'active' : ''}`}
                onClick={() => setIsSignUp(true)}
              >
                Registrieren
              </button>
            </div>

            <form onSubmit={handleAuth}>
              <div className="input-group">
                <input
                  type="email"
                  placeholder="E-Mail-Adresse"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="login-input"
                />
              </div>

              <div className="input-group">
                <input
                  type="password"
                  placeholder="Passwort"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="login-input"
                  minLength={6}
                />
              </div>

              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                className="login-button primary"
                disabled={loading}
              >
                {loading ? (
                  <div className="loading-spinner">
                    <div className="spinner"></div>
                    {isSignUp ? 'Registriere...' : 'Melde an...'}
                  </div>
                ) : (
                  isSignUp ? 'Registrieren' : 'Anmelden'
                )}
              </button>
            </form>

            <div className="divider">
              <span>oder</span>
            </div>

            <button 
              onClick={handleDemoLogin}
              className="login-button demo"
              disabled={loading}
            >
              🚀 Demo-Modus starten
            </button>

            <div className="login-footer">
              <p>
                {isSignUp 
                  ? 'Haben Sie bereits ein Konto?' 
                  : 'Noch kein Konto?'
                }
                <button 
                  type="button"
                  className="link-button"
                  onClick={() => setIsSignUp(!isSignUp)}
                >
                  {isSignUp ? 'Hier anmelden' : 'Hier registrieren'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;