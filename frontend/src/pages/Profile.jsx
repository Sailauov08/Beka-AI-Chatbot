import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import { useProfileData } from '../hooks/useProfileData';
import { authAPI } from '../services/api';
import ProfileAvatar from '../components/ProfileAvatar';
import AidaShell from '../components/dashboard/AidaShell';

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

const MiniGauge = ({ value, max, label, color }) => {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const r = 28;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;

  return (
    <div className="profile-gauge">
      <svg width="72" height="72" className="-rotate-90">
        <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(148,163,184,0.15)" strokeWidth="6" />
        <circle
          cx="36"
          cy="36"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="profile-gauge-center">
        <span className="text-sm font-bold text-white">{value}</span>
        {max > 10 && <span className="text-[9px] text-slate-500">/{max}</span>}
      </div>
      <p className="mt-2 text-center text-[10px] text-slate-400">{label}</p>
    </div>
  );
};

const TARIFF_MINI = [
  { id: 'free', glow: 'cyan', price: '0 ₽' },
  { id: 'basic', glow: 'gold', price: '50 ₽' },
  { id: 'pro', glow: 'purple', price: '120 ₽' },
];

const Profile = () => {
  const { user, subscription, updateUser } = useAuth();
  const { t, planName, prefs, update: updatePrefs } = usePreferences();
  const { profile, updateProfile } = useProfileData(user);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState('');

  const handleAvatarUpload = async (file) => {
    setAvatarError('');
    if (!file.type.startsWith('image/')) {
      setAvatarError(t('profile.photoInvalid'));
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarError(t('profile.photoTooLarge'));
      return;
    }
    setAvatarUploading(true);
    try {
      const res = await authAPI.uploadAvatar(file);
      updateUser({ avatarUrl: res.data.avatarUrl });
    } catch (err) {
      setAvatarError(err.message || t('profile.photoFailed'));
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleAvatarRemove = async () => {
    setAvatarError('');
    setAvatarUploading(true);
    try {
      await authAPI.deleteAvatar();
      updateUser({ avatarUrl: null });
    } catch (err) {
      setAvatarError(err.message || t('profile.photoFailed'));
    } finally {
      setAvatarUploading(false);
    }
  };
  const planId = subscription?.plan || 'free';
  const renewalDate = subscription?.premiumUntil
    ? new Date(subscription.premiumUntil).toLocaleDateString(
        prefs.language === 'kk' ? 'kk-KZ' : prefs.language === 'ru' ? 'ru-RU' : 'en-US'
      )
    : '—';

  const storageUsed = 1.5;
  const storageMax = 5;
  const tasksCount = 3;
  const devicesCount = 1;

  return (
    <AidaShell>
      <main className="aida-profile-main">
        <div className="aida-profile-top">
          <div>
            <h1 className="aida-pricing-title">{t('profile.title')}</h1>
            <div className="aida-efficiency-badge">
              <span className="text-xs text-slate-400">{t('profile.efficiency')}</span>
              <span className="text-lg font-bold text-cyan-300">94%</span>
              <svg className="h-10 w-10 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(34,211,238,0.15)" strokeWidth="3" />
                <circle cx="18" cy="18" r="15" fill="none" stroke="#22d3ee" strokeWidth="3" strokeDasharray="94 100" strokeLinecap="round" />
              </svg>
            </div>
          </div>
          <div className="aida-orb aida-orb-inline">AI</div>
        </div>

        {/* Header card */}
        <div className="profile-card profile-glow-gold profile-header-card">
          <div className="profile-header-avatar-wrap">
            <ProfileAvatar
              name={user?.name}
              avatarUrl={user?.avatarUrl}
              editable
              uploading={avatarUploading}
              onUpload={handleAvatarUpload}
              onRemove={handleAvatarRemove}
              uploadLabel={t('profile.uploadPhoto')}
              removeLabel={t('profile.removePhoto')}
            />
            <p className="profile-avatar-hint">{t('profile.uploadPhotoHint')}</p>
            {avatarError && <p className="profile-avatar-error">{avatarError}</p>}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-semibold text-white">{user?.name}</h2>
            <p className="text-sm text-slate-400">{user?.email}</p>
          </div>
          <div className="profile-status-box">
            <p className="text-xs text-slate-400">{t('profile.accountStatus')}</p>
            <p className="text-lg font-bold text-emerald-400">{t('profile.active')}</p>
          </div>
        </div>

        <div className="aida-profile-grid">
          {/* Left: Personal */}
          <div className="profile-card profile-glow-cyan">
            <h3>{t('profile.personalInfo')}</h3>
            <label className="aida-settings-label">{t('profile.fullName')}</label>
            <input
              className="aida-settings-input mb-3"
              value={profile.fullName}
              onChange={(e) => updateProfile({ fullName: e.target.value })}
            />
            <label className="aida-settings-label">{t('profile.username')}</label>
            <input
              className="aida-settings-input mb-3"
              value={profile.username}
              placeholder="@username"
              onChange={(e) => updateProfile({ username: e.target.value })}
            />
            <label className="aida-settings-label">{t('profile.phone')}</label>
            <input
              className="aida-settings-input mb-3"
              value={profile.phone}
              placeholder="+7 ..."
              onChange={(e) => updateProfile({ phone: e.target.value })}
            />
            <label className="aida-settings-label">{t('profile.timezone')}</label>
            <select
              className="aida-settings-select mb-4"
              value={profile.timezone}
              onChange={(e) => updateProfile({ timezone: e.target.value })}
            >
              <option value="Asia/Almaty">{t('profile.tzAlmaty')}</option>
              <option value="Europe/Moscow">{t('profile.tzMoscow')}</option>
              <option value="Europe/London">{t('profile.tzLondon')}</option>
            </select>

            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              {t('profile.yourTariffs')}
            </p>
            <div className="profile-tariff-mini-grid">
              {TARIFF_MINI.map((tar) => (
                <Link
                  key={tar.id}
                  to="/pricing"
                  className={`profile-tariff-mini glow-${tar.glow} ${planId === tar.id ? 'current' : ''}`}
                >
                  <span className="text-[9px] font-bold uppercase tracking-wide">
                    {t(`pricing.labels.${tar.id === 'basic' ? 'standard' : tar.id}`)}
                  </span>
                  <span className="text-xs font-semibold text-white">{planName(tar.id)}</span>
                  <span className="text-[10px] text-slate-400">{tar.price}</span>
                </Link>
              ))}
            </div>
            <Link to="/pricing" className="mt-3 block text-center text-xs text-cyan-400 hover:underline">
              {t('profile.viewTariffs')}
            </Link>
          </div>

          <div className="aida-profile-col">
            <div className="profile-card profile-glow-gold">
              <h3>{t('profile.subscription')}</h3>
              <p className="text-xs text-slate-400">{t('profile.currentPlan')}</p>
              <p className="text-2xl font-bold text-amber-300">{planName(planId).toUpperCase()}</p>
              <p className="mt-3 text-xs text-slate-400">{t('profile.nextRenewal')}</p>
              <p className="text-sm text-slate-200">{renewalDate}</p>
              <p className="mt-3 text-xs text-slate-400">{t('profile.paymentMethod')}</p>
              <p className="text-sm text-slate-500 blur-[3px] select-none">{t('profile.paymentHidden')}</p>
              <Link to="/pricing" className="profile-outline-btn mt-4 block text-center">
                {t('profile.manageSub')}
              </Link>
            </div>

            <div className="profile-card profile-glow-magenta">
              <h3>{t('profile.security')}</h3>
              <button
                type="button"
                className="profile-security-row"
                onClick={() => alert(t('profile.passwordSoon'))}
              >
                <span>🔑</span>
                <span>{t('profile.changePassword')}</span>
                <span className="ml-auto text-slate-500">›</span>
              </button>
              <div className="profile-security-row">
                <span>🔒</span>
                <span>{t('profile.twoFactor')}</span>
                <button
                  type="button"
                  className={`aida-toggle ml-auto ${profile.twoFactor ? 'on' : ''}`}
                  onClick={() => updateProfile({ twoFactor: !profile.twoFactor })}
                />
              </div>
              <div className="profile-security-row border-0">
                <span>👤</span>
                <div>
                  <p className="text-sm text-slate-200">{t('profile.loginMethods')}</p>
                  <p className="text-xs text-slate-500">{t('profile.loginEmail')}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="aida-profile-col">
            <div className="profile-card profile-glow-purple">
              <h3>{t('profile.usage')}</h3>
              <div className="flex justify-around gap-2 pt-2">
                <MiniGauge value={storageUsed} max={storageMax} label={t('profile.storage')} color="#fbbf24" />
                <MiniGauge value={tasksCount} max={10} label={t('profile.activeTasks')} color="#22d3ee" />
                <MiniGauge value={devicesCount} max={5} label={t('profile.devices')} color="#a855f7" />
              </div>
            </div>

            <div className="profile-card profile-glow-blue">
              <h3>{t('profile.integration')}</h3>
              <label className="aida-settings-label">{t('profile.personality')}</label>
              <select
                className="aida-settings-select mb-4"
                value={profile.aidaPersonality}
                onChange={(e) => {
                  updateProfile({ aidaPersonality: e.target.value });
                  updatePrefs({ responseStyle: e.target.value });
                }}
              >
                <option value="concise">{t('settings.concise')}</option>
                <option value="detailed">{t('settings.detailed')}</option>
                <option value="creative">{t('settings.creative')}</option>
              </select>
              <div className="profile-security-row">
                <span>{t('profile.notifications')}</span>
                <button
                  type="button"
                  className={`aida-toggle ${prefs.notifyGeneral ? 'on' : ''}`}
                  onClick={() => updatePrefs({ notifyGeneral: !prefs.notifyGeneral })}
                />
              </div>
              <p className="mt-4 mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                {t('profile.connectedInteg')}
              </p>
              {[
                { key: 'integCalendar', field: 'integCalendar' },
                { key: 'integEmail', field: 'integEmail' },
                { key: 'integSlack', field: 'integSlack' },
              ].map(({ key, field }) => (
                <label key={field} className="profile-check-row">
                  <input
                    type="checkbox"
                    checked={profile[field]}
                    onChange={(e) => updateProfile({ [field]: e.target.checked })}
                    className="accent-cyan-500"
                  />
                  <span>{t(`profile.${key}`)}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </main>
    </AidaShell>
  );
};

export default Profile;
