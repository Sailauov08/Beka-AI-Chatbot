import { useState, useEffect, useCallback, useRef } from 'react';
import { WEATHER_CITIES } from '../data/weatherCities';

/** Әр 15 мин сайын автоматты жаңарту */
export const WEATHER_REFRESH_MS = 15 * 60 * 1000;

const geoLang = (language) => {
  if (language === 'kk') return 'kk';
  if (language === 'ru') return 'ru';
  return 'en';
};

const resolvePlace = async (cityId, cityQuery, language) => {
  const preset = WEATHER_CITIES.find((c) => c.id === cityId);
  if (preset?.lat != null && preset?.lon != null) {
    return { latitude: preset.lat, longitude: preset.lon, cityName: null };
  }

  const lang = geoLang(language);
  const geoRes = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityQuery)}&count=1&language=${lang}`
  );
  if (!geoRes.ok) throw new Error('fetch_failed');
  const geoData = await geoRes.json();
  const place = geoData.results?.[0];
  if (!place) throw new Error('city_not_found');
  return {
    latitude: place.latitude,
    longitude: place.longitude,
    cityName: place.name,
  };
};

const parseHourly = (hourly) => {
  if (!hourly?.time?.length) return [];
  const now = Date.now();
  const slots = [];
  for (let i = 0; i < hourly.time.length && slots.length < 6; i++) {
    const t = new Date(hourly.time[i]).getTime();
    if (t >= now - 30 * 60 * 1000) {
      slots.push({
        time: hourly.time[i],
        temp: Math.round(hourly.temperature_2m[i]),
        code: hourly.weather_code[i],
      });
    }
  }
  return slots.slice(0, 5);
};

export const useWeather = (cityId, cityQuery, language) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);
  const weatherRef = useRef(null);

  useEffect(() => {
    weatherRef.current = weather;
  }, [weather]);

  const fetchWeather = useCallback(
    async ({ silent = false } = {}) => {
      if (!cityQuery) return;
      if (silent && weatherRef.current) setRefreshing(true);
      else if (!silent) setLoading(true);
      setError(null);

      try {
        const { latitude, longitude, cityName: geoName } = await resolvePlace(
          cityId,
          cityQuery,
          language
        );

        const params = new URLSearchParams({
          latitude: String(latitude),
          longitude: String(longitude),
          timezone: 'auto',
          current: [
            'temperature_2m',
            'apparent_temperature',
            'weather_code',
            'relative_humidity_2m',
            'wind_speed_10m',
            'is_day',
          ].join(','),
          hourly: 'temperature_2m,weather_code',
          forecast_hours: '12',
        });

        const forecastRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?${params}`
        );
        if (!forecastRes.ok) throw new Error('fetch_failed');
        const forecast = await forecastRes.json();
        const cur = forecast.current;

        if (!mountedRef.current) return;

        const preset = WEATHER_CITIES.find((c) => c.id === cityId);
        setWeather({
          cityName: geoName || preset?.query || cityQuery,
          temp: Math.round(cur.temperature_2m),
          feelsLike: Math.round(cur.apparent_temperature),
          code: cur.weather_code,
          humidity: cur.relative_humidity_2m,
          wind: Math.round(cur.wind_speed_10m),
          isDay: cur.is_day === 1,
          updatedAt: new Date().toISOString(),
          hourly: parseHourly(forecast.hourly),
        });
      } catch {
        if (!mountedRef.current) return;
        if (!silent || !weatherRef.current) {
          setError('fetch_failed');
          setWeather(null);
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [cityId, cityQuery, language]
  );

  useEffect(() => {
    mountedRef.current = true;
    setLoading(true);
    setWeather(null);
    fetchWeather({ silent: false });

    const interval = setInterval(() => fetchWeather({ silent: true }), WEATHER_REFRESH_MS);

    const onVisible = () => {
      if (document.visibilityState === 'visible') fetchWeather({ silent: true });
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      mountedRef.current = false;
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [cityId, cityQuery, language, fetchWeather]);

  return {
    weather,
    loading,
    refreshing,
    error,
    refresh: () => fetchWeather({ silent: true }),
  };
};
