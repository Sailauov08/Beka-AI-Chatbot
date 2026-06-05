import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { applyOAuthToken } = useAuth();
  const { t } = usePreferences();
  const [error, setError] = useState('');

  useEffect(() => {
    const err = searchParams.get('error');
    if (err) {
      setError(decodeURIComponent(err));
      return;
    }

    const token = searchParams.get('token');
    if (!token) {
      setError(t('auth.oauthFailed'));
      return;
    }

    applyOAuthToken(token)
      .then(() => navigate('/', { replace: true }))
      .catch((e) => setError(e.message || t('auth.oauthFailed')));
  }, [searchParams, applyOAuthToken, navigate, t]);

  return (
    <div className="aida-auth-page flex items-center justify-center">
      {error ? (
        <div className="aida-auth-card max-w-md text-center">
          <p className="aida-auth-error mb-4">{error}</p>
          <button type="button" className="aida-auth-btn" onClick={() => navigate('/login')}>
            {t('auth.login')}
          </button>
        </div>
      ) : (
        <div className="aida-auth-loading" />
      )}
    </div>
  );
};

export default AuthCallback;
