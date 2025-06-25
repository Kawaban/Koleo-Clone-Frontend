import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateAccountPage.css';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

const CreateAccountPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email jest wymagany';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Proszę podać prawidłowy adres email';
    }

    if (!formData.password) {
      newErrors.password = 'Hasło jest wymagane';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Hasło musi mieć co najmniej 8 znaków';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Hasła nie są takie same';
    }

    if (!formData.acceptTerms) {
      newErrors.general = 'Musisz zaakceptować Regulamin';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:8000/auth/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error) {
          // Handle structured error messages from the backend
          if (typeof data.error === 'object') {
            const newErrors: FormErrors = {};
            Object.entries(data.error).forEach(([key, value]) => {
              newErrors[key as keyof FormErrors] = Array.isArray(value) ? value[0] : value as string;
            });
            setErrors(newErrors);
          } else {
            setErrors({
              general: data.error
            });
          }
          throw new Error('Registration failed');
        }
        throw new Error('Registration failed');
      }

      // Registration successful
      navigate('/login');
    } catch (error) {
      if (!errors.general && !errors.email) {
        setErrors({
          general: error instanceof Error ? error.message : 'Registration failed'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-account-container">
      <div className="create-account-box">
        <h1>Załóż konto</h1>
        <p className="create-account-description">
          Załóż konto, aby uzyskać dostęp do wszystkich funkcji.
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
                name="email"
                value={formData.email}
                onChange={handleChange}
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
                name="password"
                value={formData.password}
                onChange={handleChange}
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

          <div className="form-group">
            <label htmlFor="confirmPassword">Powtórz hasło</label>
            <div className="input-with-icon">
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••••"
                required
                className={errors.confirmPassword ? 'error' : ''}
              />
              <span className="password-icon">🔒</span>
            </div>
            {errors.confirmPassword && (
              <div className="field-error">{errors.confirmPassword}</div>
            )}
          </div>

          <div className="terms-container">
            <label className="checkbox-container">
              <input
                type="checkbox"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleChange}
                required
              />
              <span className="checkmark"></span>
              Akceptuję <a href="/terms">Regulamin</a> oraz <a href="/privacy">Politykę Prywatności</a>
            </label>
          </div>

          <button 
            type="submit" 
            className="create-account-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Tworzenie konta...' : 'Załóż konto'}
          </button>

          <div className="login-link">
            Masz już konto?{' '}
            <a href="/login" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>
              Zaloguj się
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAccountPage; 