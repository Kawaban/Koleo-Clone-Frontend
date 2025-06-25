import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './LoginPage.css';

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

interface LocationState {
  returnTo: string;
  trainNumber?: string;
  from?: string;
  to?: string;
  departureTime?: string;
  arrivalTime?: string;
  price?: string;
}

// Custom event for auth state changes
const AUTH_STATE_CHANGE_EVENT = 'authStateChange';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await fetch('http://localhost:8000/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.detail) {
          throw new Error(data.detail);
        }
        throw new Error('Niepoprawne dane logowania');
      }

      // Store tokens
      localStorage.setItem('token', data.access);
      if (rememberMe) {
        localStorage.setItem('refreshToken', data.refresh);
      }

      // Dispatch auth state change event
      window.dispatchEvent(new Event('storage-changed'));

      // Redirect to the intended destination or home page
      if (state?.returnTo) {
        // Remove returnTo from state before navigating
        const { returnTo, ...restState } = state;
        navigate(returnTo, { 
          replace: true,
          state: restState
        });
      } else {
        navigate('/', { replace: true });
      }
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'Niepoprawne dane logowania'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Zaloguj się</h1>
        <p className="login-description">
          Zaloguj się podając swój adres email i hasło.
        </p>

        {errors.general && (
          <div className="error-message">{errors.general}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Adres email</label>
            <div className="input-with-icon">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@address.com"
                required
                className={errors.email ? 'error' : ''}
              />
              <span className="email-icon">✉</span>
            </div>
            {errors.email && (
              <div className="field-error">{errors.email}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Hasło</label>
            <div className="input-with-icon">
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••"
                required
                className={errors.password ? 'error' : ''}
              />
              <span className="password-icon">🔒</span>
            </div>
            {errors.password && (
              <div className="field-error">{errors.password}</div>
            )}
          </div>

          <div className="forgot-password">
            <a href="/forgot-password">Zapomniałeś hasła?</a>
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Logowanie...' : 'Zaloguj się'}
          </button>

          <div className="remember-me">
            <label className="checkbox-container">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span className="checkmark"></span>
              Zapamiętaj mnie
            </label>
          </div>

          <button 
            type="button" 
            className="new-account-button"
            onClick={() => navigate('/register')}
          >
            Załóż nowe konto
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage; 