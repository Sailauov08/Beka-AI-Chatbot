import { useState } from 'react';
import { usePreferences } from '../../context/PreferencesContext';

const OtpVerification = ({
  target,
  channel,
  devCode,
  onVerify,
  onResend,
  onBack,
  loading,
  error,
}) => {
  const { t } = usePreferences();
  const [code, setCode] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onVerify(code.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="aida-auth-form">
      {error && <div className="aida-auth-error">{error}</div>}

      <p className="aida-otp-hint">
        {devCode ? t('auth.otpFallbackHint') : channel === 'phone' ? t('auth.otpSentPhone') : t('auth.otpSentEmail')}
        <br />
        <span className="aida-otp-target">{target}</span>
      </p>

      {devCode && (
        <div className="aida-otp-dev">
          <span className="aida-otp-dev-label">{t('auth.devCode')}</span>
          <strong className="aida-otp-dev-code">{devCode}</strong>
        </div>
      )}

      <label className="aida-auth-label" htmlFor="otp-code">
        {t('auth.otpCode')}
      </label>
      <input
        id="otp-code"
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
        required
        className="aida-auth-input aida-otp-input"
        placeholder="000000"
      />

      <button type="submit" disabled={loading || code.length < 6} className="aida-auth-btn">
        {loading ? t('auth.verifying') : t('auth.confirmCode')}
      </button>

      <div className="aida-otp-actions">
        <button type="button" className="aida-auth-link-btn" onClick={onResend} disabled={loading}>
          {t('auth.resendCode')}
        </button>
        <button type="button" className="aida-auth-link-btn" onClick={onBack} disabled={loading}>
          {t('auth.back')}
        </button>
      </div>
    </form>
  );
};

export default OtpVerification;
