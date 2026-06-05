import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import AuthFormCard from '../components/auth/AuthFormCard';
import SocialAuthButtons from '../components/auth/SocialAuthButtons';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { t } = usePreferences();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(identifier, password);
      navigate('/');
    } catch (err) {
      setError(err.message || t('auth.loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthFormCard subtitle={t('auth.loginTitle')}>
      <form onSubmit={handleSubmit} className="aida-auth-form">
        {error && <div className="aida-auth-error">{error}</div>}

        <label className="aida-auth-label" htmlFor="login-identifier">
          {t('auth.emailOrPhone')}
        </label>
        <input
          id="login-identifier"
          type="text"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
          autoComplete="username"
          className="aida-auth-input"
          placeholder={t('auth.identifierPlaceholder')}
        />
        <p className="aida-auth-field-hint">{t('auth.phoneHint')}</p>

        <label className="aida-auth-label" htmlFor="login-password">
          {t('auth.password')}
        </label>
        <input
          id="login-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          className="aida-auth-input aida-auth-input-last"
        />

        <button type="submit" disabled={loading} className="aida-auth-btn">
          {loading ? t('auth.loggingIn') : t('auth.login')}
        </button>

        <p className="aida-auth-footer">
          {t('auth.noAccount')}{' '}
          <Link to="/register" className="aida-auth-link">
            {t('auth.register')}
          </Link>
        </p>
      </form>
      <SocialAuthButtons />
    </AuthFormCard>
  );
};

export default Login;
