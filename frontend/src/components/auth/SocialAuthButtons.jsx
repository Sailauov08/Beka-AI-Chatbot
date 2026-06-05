import { useEffect, useState } from 'react';
import { usePreferences } from '../../context/PreferencesContext';
import { authAPI } from '../../services/api';

const IconGoogle = () => (
  <svg className="aida-social-icon" viewBox="0 0 24 24" aria-hidden>
    <path fill="#EA4335" d="M12 11.2v2.4h5.9c-.2 1.2-1.5 3.6-5.9 3.6-3.6 0-6.5-3-6.5-6.7S8.4 4.4 12 4.4c2 0 3.4.9 4.2 1.6l2.8-2.7C16.9 1.9 14.6 1 12 1 6.5 1 2 5.5 2 11s4.5 10 10 10c5.8 0 9.6-4.1 9.6-9.9 0-.7-.1-1.2-.2-1.9H12z" />
  </svg>
);

const IconVk = () => (
  <svg className="aida-social-icon" viewBox="0 0 24 24" aria-hidden>
    <path fill="#4C75A3" d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.8 11.2c.4.4.8.8 1.1 1.2.1.2.3.4.1.7-.2.4-.9.4-1.2.4h-1.5c-.8 0-1.1-.6-2.6-2.1-1.3-1.3-1.9-1.5-2.2-1.5-.4 0-.5.1-.5.6v1.9c0 .4-.1.7-1.1.7-1.6 0-3.4-.9-4.7-2.7-1.9-2.7-2.4-4.7-2.4-4.8 0-.2.1-.4.4-.4h1.5c.3 0 .5.2.6.5.7 2.2 1.9 4.1 2.4 4.1.2 0 .3-.1.3-.7V9.8c-.1-.9-.5-1-.5-1.3 0-.2.2-.3.4-.3h2.4c.3 0 .4.1.4.4v2.6c0 .3.1.4.3.4.2 0 .5-.1 1.1-.9.7-1 1.2-2.5 1.2-2.5.1-.2.3-.4.6-.4h1.5c.5 0 .6.2.5.5-.2.9-1.9 3.5-1.9 3.5-.2.3-.2.4 0 .7z" />
  </svg>
);

const IconFacebook = () => (
  <svg className="aida-social-icon" viewBox="0 0 24 24" aria-hidden>
    <path fill="#1877F2" d="M22 12a10 10 0 10-11.6 9.9v-7h-2v-3h2v-2.3c0-2 1.2-3.1 3-3.1.9 0 1.8.1 1.8.1v2h-1c-1 0-1.3.6-1.3 1.2V12h2.2l-.4 3h-1.8v7A10 10 0 0022 12z" />
  </svg>
);

const IconApple = () => (
  <svg className="aida-social-icon" viewBox="0 0 24 24" aria-hidden>
    <path fill="#f1f5f9" d="M16.7 13.1c-.1-2.1 1.7-3.1 1.8-3.2-1-.1-2-.6-2.5-1.4-.6-.8-.7-1.9-.4-2.9 1.3.1 2.5.7 3.2 1.7-.9.5-1.5 1.4-1.4 2.4.1 1 .8 1.8 1.7 2.2-.7 1-1.7 1.8-2.9 1.7-.7 0-1.3-.2-1.8-.5-.5.7-1.2 1.2-2 1.4-1.5.4-3-.3-3.7-1.7 1.9-1.2 3.2-3.3 3.1-5.7 0-1.3.5-2.5 1.3-3.4.8-.9 2-1.4 3.2-1.3.1 1.2-.4 2.4-1.3 3.2-.9.7-2 1-3.1.8.3 1.5 1.5 2.6 3.1 2.7.4 0 .8-.1 1.2-.2z" />
  </svg>
);

const icons = {
  google: IconGoogle,
  vk: IconVk,
  facebook: IconFacebook,
  apple: IconApple,
};

const providers = [
  { id: 'google', label: 'Google', iconClass: 'aida-social-google' },
  { id: 'vk', label: 'VK', iconClass: 'aida-social-vk', alwaysDisabled: true },
  { id: 'facebook', label: 'Facebook', iconClass: 'aida-social-facebook', alwaysDisabled: true },
  { id: 'apple', label: 'Apple', iconClass: 'aida-social-apple', alwaysDisabled: true },
];

const SocialAuthButtons = () => {
  const { t } = usePreferences();
  const [googleEnabled, setGoogleEnabled] = useState(false);

  useEffect(() => {
    authAPI.getOAuthProviders().then((res) => setGoogleEnabled(!!res.data?.google)).catch(() => {});
  }, []);

  const isClickable = (p) => {
    if (p.alwaysDisabled) return false;
    if (p.id === 'google') return googleEnabled;
    return false;
  };

  const getTitle = (p) => {
    if (p.alwaysDisabled) return t('auth.socialSoon');
    if (p.id === 'google' && googleEnabled) return p.label;
    return t('auth.oauthNotConfigured');
  };

  return (
    <div className="aida-social-auth">
      <p className="aida-social-divider">
        <span>{t('auth.orContinueWith')}</span>
      </p>
      <div className="aida-social-grid">
        {providers.map((p) => {
          const Icon = icons[p.id];
          const active = isClickable(p);

          return (
            <button
              key={p.id}
              type="button"
              className={`aida-social-btn ${p.iconClass} ${active ? '' : 'aida-social-btn--disabled'}`}
              onClick={active ? () => { window.location.href = `/api/auth/oauth/${p.id}`; } : undefined}
              disabled={!active}
              title={getTitle(p)}
              aria-disabled={!active}
            >
              <Icon />
              <span className="aida-social-label">{p.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SocialAuthButtons;
