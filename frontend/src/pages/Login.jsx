import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import AuthFormCard from '../components/auth/AuthFormCard';
import SocialAuthButtons from '../components/auth/SocialAuthButtons';
import OtpVerification from '../components/auth/OtpVerification';

const Login = () => {
  const [step, setStep] = useState('credentials');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [otpTarget, setOtpTarget] = useState('');
  const [otpChannel, setOtpChannel] = useState('email');
  const [devCode, setDevCode] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginSendCode, loginVerify } = useAuth();
  const { t } = usePreferences();
  const navigate = useNavigate();

  const handleCredentials = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await loginSendCode(identifier, password);
      setOtpTarget(res.data.target);
      setOtpChannel(res.data.channel);
      setDevCode(res.data.devCode || null);
      setStep('otp');
    } catch (err) {
      setError(err.message || t('auth.loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (code) => {
    setError('');
    setLoading(true);
    try {
      await loginVerify(otpTarget, code);
      navigate('/');
    } catch (err) {
      setError(err.message || t('auth.loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await loginSendCode(identifier, password);
      setDevCode(res.data.devCode || null);
    } catch (err) {
      setError(err.message || t('auth.loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthFormCard subtitle={step === 'otp' ? t('auth.verifyTitle') : t('auth.loginTitle')}>
      {step === 'otp' ? (
        <OtpVerification
          target={otpTarget}
          channel={otpChannel}
          devCode={devCode}
          onVerify={handleVerify}
          onResend={handleResend}
          onBack={() => setStep('credentials')}
          loading={loading}
          error={error}
        />
      ) : (
        <>
          <form onSubmit={handleCredentials} className="aida-auth-form">
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
              {loading ? t('auth.sendingCode') : t('auth.login')}
            </button>

            <p className="aida-auth-footer">
              {t('auth.noAccount')}{' '}
              <Link to="/register" className="aida-auth-link">
                {t('auth.register')}
              </Link>
            </p>
          </form>
          <SocialAuthButtons />
        </>
      )}
    </AuthFormCard>
  );
};

export default Login;
