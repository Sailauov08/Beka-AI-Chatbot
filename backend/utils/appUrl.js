/** Production сайт URL (Render, CLIENT_URL) */
export const getPublicAppUrl = () => {
  const raw =
    process.env.CLIENT_URL ||
    process.env.RENDER_EXTERNAL_URL ||
    process.env.APP_URL ||
    '';
  const first = raw.split(',')[0]?.trim();
  return first ? first.replace(/\/$/, '') : '';
};
