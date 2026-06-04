import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { translations, getNested, SPEECH_LOCALES, DATE_LOCALES } from '../i18n/translations';

const STORAGE_KEY = 'beka_settings_prefs';

const defaults = {
  voice: 'clean',
  responseStyle: 'concise',
  speechSensitivity: 70,
  notifyTasks: true,
  notifySchedule: true,
  notifyNews: true,
  notifyGeneral: true,
  theme: 'dark',
  accentColor: 'blue',
  fontSize: 14,
  language: 'kk',
  region: 'KZ',
};

const loadPrefs = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...defaults, ...JSON.parse(raw) } : { ...defaults };
  } catch {
    return { ...defaults };
  }
};

const PreferencesContext = createContext(null);

export const PreferencesProvider = ({ children }) => {
  const [prefs, setPrefs] = useState(loadPrefs);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    document.documentElement.style.fontSize = `${prefs.fontSize}px`;
    document.documentElement.lang = prefs.language;
  }, [prefs]);

  const update = useCallback((patch) => {
    setPrefs((p) => ({ ...p, ...patch }));
  }, []);

  const setLanguage = useCallback((language) => {
    update({ language });
  }, [update]);

  const t = useCallback(
    (key, fallback = key) => {
      const lang = translations[prefs.language] || translations.kk;
      const value = getNested(lang, key);
      return value != null ? value : getNested(translations.kk, key) ?? fallback;
    },
    [prefs.language]
  );

  const planName = useCallback(
    (planId) => t(`plans.${planId}`, planId),
    [t]
  );

  const locale = useMemo(
    () => DATE_LOCALES[prefs.language] || 'kk-KZ',
    [prefs.language]
  );

  const speechLocale = useMemo(
    () => SPEECH_LOCALES[prefs.language] || 'kk-KZ',
    [prefs.language]
  );

  const months = useMemo(
    () => translations[prefs.language]?.months || translations.kk.months,
    [prefs.language]
  );

  const weekdays = useMemo(
    () => translations[prefs.language]?.weekdays || translations.kk.weekdays,
    [prefs.language]
  );

  const value = useMemo(
    () => ({
      prefs,
      update,
      setLanguage,
      language: prefs.language,
      t,
      planName,
      locale,
      speechLocale,
      months,
      weekdays,
    }),
    [prefs, update, setLanguage, t, planName, locale, speechLocale, months, weekdays]
  );

  return (
    <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
  );
};

export const usePreferences = () => {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error('usePreferences requires PreferencesProvider');
  return ctx;
};

/** Кері үйлесімдік: Settings hook */
export const useSettingsPrefs = () => {
  const { prefs, update } = usePreferences();
  return { prefs, update };
};

export const ACCENT_COLORS = [
  { id: 'white', color: '#f8fafc' },
  { id: 'blue', color: '#3b82f6' },
  { id: 'teal', color: '#14b8a6' },
  { id: 'purple', color: '#a855f7' },
  { id: 'magenta', color: '#ec4899' },
];
