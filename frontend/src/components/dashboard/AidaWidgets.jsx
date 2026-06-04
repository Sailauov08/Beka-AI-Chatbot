import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePreferences } from '../../context/PreferencesContext';
import { useWeather, WEATHER_REFRESH_MS } from '../../hooks/useWeather';
import { getWeatherPresentation, formatWeatherHour } from '../../utils/weatherCodes';
import { WEATHER_CITIES, DEFAULT_WEATHER_CITY_ID } from '../../data/weatherCities';
import ProfileAvatar from '../ProfileAvatar';

const STORAGE_KEY = 'beka_weather_city';

const loadCityId = () => {
  try {
    const id = localStorage.getItem(STORAGE_KEY);
    return WEATHER_CITIES.some((c) => c.id === id) ? id : DEFAULT_WEATHER_CITY_ID;
  } catch {
    return DEFAULT_WEATHER_CITY_ID;
  }
};

const AidaWidgets = () => {
  const { user, subscription } = useAuth();
  const { t, prefs, locale } = usePreferences();
  const [cityId, setCityId] = useState(loadCityId);
  const city = WEATHER_CITIES.find((c) => c.id === cityId) || WEATHER_CITIES[0];
  const { weather, loading, refreshing, error, refresh } = useWeather(
    city.id,
    city.query,
    prefs.language
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, cityId);
  }, [cityId]);

  const presentation = weather
    ? getWeatherPresentation(weather.code, weather.isDay)
    : null;

  const updatedLabel = useMemo(() => {
    if (!weather?.updatedAt) return '';
    const d = new Date(weather.updatedAt);
    return d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  }, [weather?.updatedAt, locale]);

  const refreshMinutes = WEATHER_REFRESH_MS / 60000;

  return (
    <aside className="aida-widget hidden flex-col gap-4 p-4 pr-6 xl:flex">
      <div className="aida-glass-panel p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {t('weather.title')}
          </p>
          {weather && (
            <button
              type="button"
              onClick={refresh}
              disabled={refreshing}
              className="aida-weather-refresh text-[10px] text-cyan-400/80 hover:text-cyan-300 disabled:opacity-50"
              title={t('weather.refresh')}
            >
              {refreshing ? '↻' : '⟳'}
            </button>
          )}
        </div>

        <label className="sr-only" htmlFor="weather-city">
          {t('weather.selectCity')}
        </label>
        <select
          id="weather-city"
          className="aida-weather-select mt-2 w-full"
          value={cityId}
          onChange={(e) => setCityId(e.target.value)}
        >
          {WEATHER_CITIES.map((c) => (
            <option key={c.id} value={c.id}>
              {t(`weather.cities.${c.id}`)}
            </option>
          ))}
        </select>

        <div className={`mt-3 min-h-[3.5rem] ${refreshing ? 'aida-weather-pulse' : ''}`}>
          {loading && !weather && (
            <p className="text-xs text-slate-400 animate-pulse">{t('weather.loading')}</p>
          )}
          {!loading && error && !weather && (
            <p className="text-xs text-red-300">{t('weather.error')}</p>
          )}
          {weather && presentation && (
            <>
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-2xl ${
                    weather.isDay ? 'bg-amber-500/20' : 'bg-indigo-500/25'
                  }`}
                >
                  {presentation.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xl font-semibold text-white">
                    {weather.temp}°C
                    {weather.feelsLike !== weather.temp && (
                      <span className="ml-1 text-sm font-normal text-slate-400">
                        ({t('weather.feelsLike')} {weather.feelsLike}°)
                      </span>
                    )}
                  </p>
                  <p className="text-xs font-medium text-cyan-200/90">
                    {t(presentation.descKey)}
                  </p>
                  <p className="truncate text-[10px] text-slate-500">
                    {t(`weather.cities.${cityId}`)} · {t('weather.humidity')} {weather.humidity}% ·{' '}
                    {t('weather.wind')} {weather.wind} {t('weather.windUnit')}
                  </p>
                </div>
              </div>

              {weather.hourly?.length > 1 && (
                <div className="mt-3 border-t border-white/10 pt-3">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    {t('weather.nextHours')}
                  </p>
                  <div className="aida-weather-hourly">
                    {weather.hourly.map((slot, idx) => {
                      const slotPres = getWeatherPresentation(slot.code, weather.isDay);
                      const hourLabel =
                        idx === 0
                          ? t('weather.now')
                          : formatWeatherHour(slot.time, locale) || '—';
                      return (
                        <div key={slot.time} className="aida-weather-hour-slot">
                          <span className="text-[9px] text-slate-500">{hourLabel}</span>
                          <span className="text-base leading-none">{slotPres.icon}</span>
                          <span className="text-[10px] font-medium text-slate-300">
                            {slot.temp}°
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {updatedLabel && (
                <p className="mt-2 text-[9px] text-slate-600">
                  {t('weather.updatedPrefix')} {updatedLabel}
                  {' · '}
                  {t('weather.autoRefresh').replace('{n}', String(refreshMinutes))}
                </p>
              )}
            </>
          )}
        </div>
      </div>

      <div className="aida-glass-panel p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {t('weather.news')}
        </p>
        <ul className="mt-2 space-y-2 text-xs text-slate-300">
          <li className="leading-snug">{t('weather.newsItem1')}</li>
          <li className="leading-snug text-slate-500">{t('weather.newsItem2')}</li>
        </ul>
      </div>

      <Link
        to="/profile"
        className="aida-glass-panel flex items-center gap-3 p-3 transition hover:border-blue-500/30"
      >
        <ProfileAvatar name={user?.name} avatarUrl={user?.avatarUrl} size="md" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-white">{user?.name}</p>
          <p className="text-xs text-slate-400">
            {t('nav.profile')} · {subscription?.planName}
          </p>
        </div>
        <svg className="h-4 w-4 shrink-0 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>

      <Link to="/pricing" className="text-center text-[10px] text-slate-500 hover:text-blue-400">
        {t('nav.tariffs')}
      </Link>
    </aside>
  );
};

export default AidaWidgets;
