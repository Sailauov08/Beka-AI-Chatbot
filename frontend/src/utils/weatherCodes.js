/** WMO weather code → description key + icon (күн/түн) */
export const getWeatherPresentation = (code, isDay = true) => {
  if (code === 0) {
    return {
      icon: isDay ? '☀️' : '🌙',
      descKey: isDay ? 'weather.codes.clear' : 'weather.codes.clearNight',
    };
  }
  if (code <= 3) return { icon: isDay ? '⛅' : '☁️', descKey: 'weather.codes.partlyCloudy' };
  if (code <= 48) return { icon: '🌫️', descKey: 'weather.codes.fog' };
  if (code <= 57) return { icon: '🌦️', descKey: 'weather.codes.drizzle' };
  if (code <= 67) return { icon: '🌧️', descKey: 'weather.codes.rain' };
  if (code <= 77) return { icon: '❄️', descKey: 'weather.codes.snow' };
  if (code <= 82) return { icon: '🌧️', descKey: 'weather.codes.showers' };
  if (code <= 86) return { icon: '🌨️', descKey: 'weather.codes.snowShowers' };
  if (code >= 95) return { icon: '⛈️', descKey: 'weather.codes.thunderstorm' };
  return { icon: '🌤️', descKey: 'weather.codes.partlyCloudy' };
};

export const formatWeatherHour = (isoTime, locale) => {
  const d = new Date(isoTime);
  const now = new Date();
  const sameHour =
    d.getHours() === now.getHours() &&
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth();
  if (sameHour) return null;
  return d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
};
