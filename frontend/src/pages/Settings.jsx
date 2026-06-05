import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePreferences, ACCENT_COLORS } from '../context/PreferencesContext';
import AidaShell from '../components/dashboard/AidaShell';

const Toggle = ({ on, onChange, label, icon }) => (
  <div className="aida-toggle-row">
    <span>
      {icon}
      {label}
    </span>
    <button type="button" role="switch" aria-checked={on} className={`aida-toggle ${on ? 'on' : ''}`} onClick={() => onChange(!on)} />
  </div>
);

const Settings = () => {
  const { user, subscription, logout, refreshSubscription } = useAuth();
  const { prefs, update, setLanguage, t, planName } = usePreferences();
  const [langSaved, setLangSaved] = useState(false);

  const dailyLimit = subscription?.dailyLimit;
  const dailyUsed = subscription?.dailyUsed ?? 0;
  const dailyRemaining = subscription?.dailyRemaining;
  const planLabel = planName(subscription?.plan || 'free');

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
    setLangSaved(true);
    window.setTimeout(() => setLangSaved(false), 2500);
  };

  return (
    <AidaShell>
      <main className="aida-settings-main">
        <div className="aida-settings-header">
          <h1 className="aida-settings-title">{t('settings.title')}</h1>
          <div className="aida-orb aida-orb-inline shrink-0">AI</div>
        </div>

        {langSaved && (
          <p className="aida-bg-accent-banner mb-4 rounded-md border px-4 py-2 text-sm">
            {t('settings.langChanged')}
          </p>
        )}

        <div className="aida-settings-grid">
          <div className="aida-account-strip">
            <div>
              <p className="text-sm font-medium text-white">{user?.name}</p>
              <p className="text-xs text-slate-400">{user?.email}</p>
              <p className="mt-1 text-xs text-amber-200/90">
                {planLabel}
                {dailyLimit != null && ` · ${dailyRemaining}/${dailyLimit} ${t('settings.msgs')}`}
                {dailyLimit == null && ` · ${t('settings.unlimited')}`}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to="/pricing" className="aida-settings-btn !mt-0 !w-auto px-4">
                {t('settings.tariff')}
              </Link>
              <button type="button" onClick={() => refreshSubscription()} className="aida-settings-btn !mt-0 !w-auto px-4">
                {t('settings.refresh')}
              </button>
              <button
                type="button"
                onClick={logout}
                className="aida-settings-btn !mt-0 !w-auto border-red-500/30 text-red-300"
              >
                {t('settings.logout')}
              </button>
            </div>
          </div>

          <div className="aida-settings-card">
            <h3>{t('settings.voiceAssistant')}</h3>
            <label className="aida-settings-label">{t('settings.voice')}</label>
            <div className="relative mb-4">
              <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </span>
              <select className="aida-settings-select" value={prefs.voice} onChange={(e) => update({ voice: e.target.value })}>
                <option value="clean">{t('settings.voiceClean')}</option>
                <option value="warm">{t('settings.voiceWarm')}</option>
                <option value="neutral">{t('settings.voiceNeutral')}</option>
              </select>
            </div>
            <label className="aida-settings-label">{t('settings.responseStyle')}</label>
            <div className="aida-segment mb-4">
              {[
                { id: 'concise', key: 'settings.concise' },
                { id: 'detailed', key: 'settings.detailed' },
                { id: 'creative', key: 'settings.creative' },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={prefs.responseStyle === s.id ? 'active' : ''}
                  onClick={() => update({ responseStyle: s.id })}
                >
                  {t(s.key)}
                </button>
              ))}
            </div>
            <label className="aida-settings-label">{t('settings.speechSensitivity')}</label>
            <input
              type="range"
              min={0}
              max={100}
              value={prefs.speechSensitivity}
              onChange={(e) => update({ speechSensitivity: Number(e.target.value) })}
              className="aida-range"
            />
          </div>

          <div className="aida-settings-card">
            <h3>{t('settings.notifications')}</h3>
            <Toggle label={t('settings.notifyTasks')} on={prefs.notifyTasks} onChange={(v) => update({ notifyTasks: v })} icon={<span className="h-4 w-4 text-emerald-400">✓</span>} />
            <Toggle label={t('settings.notifySchedule')} on={prefs.notifySchedule} onChange={(v) => update({ notifySchedule: v })} icon={<span className="h-4 w-4 aida-text-accent">🔔</span>} />
            <Toggle label={t('settings.notifyNews')} on={prefs.notifyNews} onChange={(v) => update({ notifyNews: v })} icon={<span className="h-4 w-4 aida-text-accent-soft">📰</span>} />
            <Toggle label={t('settings.notifyGeneral')} on={prefs.notifyGeneral} onChange={(v) => update({ notifyGeneral: v })} icon={<span className="h-4 w-4 aida-text-accent-muted">💬</span>} />
          </div>

          <div className="aida-settings-card">
            <h3>{t('settings.appearance')}</h3>
            <label className="aida-settings-label">{t('settings.theme')}</label>
            <div className="aida-theme-pill mb-4">
              <button type="button" className={prefs.theme === 'light' ? 'active' : ''} onClick={() => update({ theme: 'light' })}>
                {t('settings.themeLight')}
              </button>
              <button type="button" className={prefs.theme === 'dark' ? 'active' : ''} onClick={() => update({ theme: 'dark' })}>
                {t('settings.themeDark')}
              </button>
            </div>
            <label className="aida-settings-label">{t('settings.accent')}</label>
            <div className="mb-4 flex gap-2">
              {ACCENT_COLORS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`aida-swatch ${prefs.accentColor === c.id ? 'active' : ''}`}
                  style={{ backgroundColor: c.color, color: c.color }}
                  onClick={() => update({ accentColor: c.id })}
                  aria-label={c.id}
                />
              ))}
            </div>
            <label className="aida-settings-label">{t('settings.fontSize')}</label>
            <div className="flex items-center gap-2">
              <button type="button" className="aida-icon-btn !h-8 !w-8 text-sm" onClick={() => update({ fontSize: Math.max(12, prefs.fontSize - 1) })}>−</button>
              <input type="range" min={12} max={18} value={prefs.fontSize} onChange={(e) => update({ fontSize: Number(e.target.value) })} className="aida-range flex-1" />
              <button type="button" className="aida-icon-btn !h-8 !w-8 text-sm" onClick={() => update({ fontSize: Math.min(18, prefs.fontSize + 1) })}>+</button>
            </div>
          </div>

          <div className="aida-settings-card">
            <h3>{t('settings.devices')}</h3>
            <div className="aida-device-row">
              <span>{t('settings.smartphone')}</span>
              <span className="aida-status-dot" />
            </div>
            <button type="button" className="aida-settings-btn" onClick={() => alert(t('settings.deviceSoon'))}>
              {t('settings.addDevice')}
            </button>
          </div>

          <div className="aida-settings-card">
            <h3>{t('settings.languageLocale')}</h3>
            <label className="aida-settings-label">{t('settings.language')}</label>
            <div className="relative mb-3">
              <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </span>
              <select className="aida-settings-select" value={prefs.language} onChange={handleLanguageChange}>
                <option value="kk">Қазақша</option>
                <option value="ru">Русский</option>
                <option value="en">English</option>
              </select>
            </div>
            <label className="aida-settings-label">{t('settings.region')}</label>
            <select className="aida-settings-select" value={prefs.region} onChange={(e) => update({ region: e.target.value })}>
              <option value="KZ">{t('regions.KZ')}</option>
              <option value="RU">{t('regions.RU')}</option>
              <option value="EU">{t('regions.EU')}</option>
            </select>
          </div>

          <div className="aida-settings-card">
            <h3>{t('settings.about')}</h3>
            <p className="text-sm text-slate-300">
              {t('settings.version')}: <span className="font-mono aida-text-accent-soft">1.0.0</span>
            </p>
            <p className="aida-about-text">{t('settings.aboutText')}</p>
            <button type="button" className="aida-settings-btn" onClick={() => alert(t('settings.upToDate'))}>
              {t('settings.checkUpdates')}
            </button>
          </div>
        </div>
      </main>
    </AidaShell>
  );
};

export default Settings;
