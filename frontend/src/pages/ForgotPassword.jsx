import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import AuthFormCard from '../components/auth/AuthFormCard';

const ForgotPassword = () => {
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [devCode, setDevCode] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { forgotPasswordSendCode, forgotPasswordReset } = useAuth();
  const { t } = usePreferences();
  const navigate = useNavigate();

  const handleSendCode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await forgotPasswordSendCode(email);
      setDevCode(res.data.devCode || null);
      setStep('reset');
    } catch (err) {
      setError(err.message || t('auth.forgotFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError(t('auth.passwordMismatch'));
      return;
    }
    setLoading(true);
    try {
      await forgotPasswordReset({ email, code, password, confirmPassword });
      navigate('/');
    } catch (err) {
      setError(err.message || t('auth.forgotFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await forgotPasswordSendCode(email);
      setDevCode(res.data.devCode || null);
    } catch (err) {
      setError(err.message || t('auth.forgotFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthFormCard
      subtitle={step === 'email' ? t('auth.forgotTitle') : t('auth.forgotResetTitle')}
    >
      {step === 'email' ? (
        <form onSubmit={handleSendCode} className="aida-auth-form">
          {error && <div className="aida-auth-error">{error}</div>}

          <p className="aida-otp-hint">{t('auth.forgotHint')}</p>

          <label className="aida-auth-label" htmlFor="forgot-email">
            {t('auth.email')}
          </label>
          <input
            id="forgot-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="aida-auth-input aida-auth-input-last"
            placeholder="name@mail.com"
          />

          <button type="submit" disabled={loading} className="aida-auth-btn">
            {loading ? t('auth.sendingCode') : t('auth.sendResetCode')}
          </button>

          <p className="aida-auth-footer">
            <Link to="/login" className="aida-auth-link">
              {t('auth.backToLogin')}
            </Link>
          </p>
        </form>
      ) : (
        <form onSubmit={handleReset} className="aida-auth-form">
          {error && <div className="aida-auth-error">{error}</div>}

          <p className="aida-otp-hint">
            {devCode ? t('auth.otpFallbackHint') : t('auth.otpSentEmail')}
            <br />
            <span className="aida-otp-target">{email}</span>
          </p>

          {devCode && (
            <div className="aida-otp-dev">
              <span className="aida-otp-dev-label">{t('auth.devCode')}</span>
              <strong className="aida-otp-dev-code">{devCode}</strong>
            </div>
          )}

          <label className="aida-auth-label" htmlFor="forgot-code">
            {t('auth.otpCode')}
          </label>
          <input
            id="forgot-code"
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            required
            className="aida-auth-input aida-otp-input"
            placeholder="000000"
          />

          <label className="aida-auth-label" htmlFor="forgot-password">
            {t('auth.newPassword')}
          </label>
          <input
            id="forgot-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
            className="aida-auth-input"
          />

          <label className="aida-auth-label" htmlFor="forgot-confirm">
            {t('auth.confirmPassword')}
          </label>
          <input
            id="forgot-confirm"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
            className="aida-auth-input aida-auth-input-last"
          />

          <button
            type="submit"
            disabled={loading || code.length < 6}
            className="aida-auth-btn"
          >
            {loading ? t('auth.resetting') : t('auth.resetPassword')}
          </button>

          <div className="aida-otp-actions">
            <button
              type="button"
              className="aida-auth-link-btn"
              onClick={handleResend}
              disabled={loading}
            >
              {t('auth.resendCode')}
            </button>
            <button
              type="button"
              className="aida-auth-link-btn"
              onClick={() => setStep('email')}
              disabled={loading}
            >
              {t('auth.back')}
            </button>
          </div>
        </form>
      )}
    </AuthFormCard>
  );
};

export default ForgotPassword;
