import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import AuthFormCard from '../components/auth/AuthFormCard';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { t } = usePreferences();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError(t('auth.passwordMismatch'));
      return;
    }
    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || t('auth.registerFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthFormCard subtitle={t('auth.registerTitle')} tall>
      <form onSubmit={handleSubmit} className="aida-auth-form">
        {error && <div className="aida-auth-error">{error}</div>}

        <label className="aida-auth-label" htmlFor="reg-name">
          {t('auth.fullName')}
        </label>
        <input
          id="reg-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoComplete="name"
          className="aida-auth-input"
          placeholder={t('auth.namePlaceholder')}
        />

        <label className="aida-auth-label" htmlFor="reg-email">
          {t('auth.email')}
        </label>
        <input
          id="reg-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="aida-auth-input"
          placeholder="email@example.com"
        />

        <label className="aida-auth-label" htmlFor="reg-password">
          {t('auth.password')}
        </label>
        <input
          id="reg-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          autoComplete="new-password"
          className="aida-auth-input"
        />

        <label className="aida-auth-label" htmlFor="reg-confirm">
          {t('auth.confirmPassword')}
        </label>
        <input
          id="reg-confirm"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={6}
          autoComplete="new-password"
          className="aida-auth-input aida-auth-input-last"
        />

        <button type="submit" disabled={loading} className="aida-auth-btn">
          {loading ? t('auth.registering') : t('auth.register')}
        </button>

        <p className="aida-auth-footer">
          {t('auth.hasAccount')}{' '}
          <Link to="/login" className="aida-auth-link">
            {t('auth.login')}
          </Link>
        </p>
      </form>
    </AuthFormCard>
  );
};

export default Register;
