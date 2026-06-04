import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import AuthFormCard from '../components/auth/AuthFormCard';

const Login = () => {
  const [email, setEmail] = useState('');
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
      await login(email, password);
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

        <label className="aida-auth-label" htmlFor="login-email">
          {t('auth.email')}
        </label>
        <input
          id="login-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="aida-auth-input"
          placeholder="email@example.com"
        />

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
    </AuthFormCard>
  );
};

export default Login;
