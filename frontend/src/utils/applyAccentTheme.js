/** <html> элементіне акцент түсін және теманы қолдану */
export const applyAccentTheme = (prefs) => {
  const root = document.documentElement;
  const accent = prefs?.accentColor || 'blue';
  const theme = prefs?.theme || 'dark';

  root.setAttribute('data-accent', accent);
  root.setAttribute('data-theme', theme);

  if (prefs?.fontSize) {
    root.style.fontSize = `${prefs.fontSize}px`;
  }
  if (prefs?.language) {
    root.lang = prefs.language;
  }
};
