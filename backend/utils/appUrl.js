/** Production сайт URL (Render, CLIENT_URL) */
export const getPublicAppUrl = () => {
  const ordered =
    process.env.NODE_ENV === 'production'
      ? [
          process.env.RENDER_EXTERNAL_URL,
          process.env.CLIENT_URL,
          process.env.APP_URL,
        ]
      : [
          process.env.CLIENT_URL,
          process.env.APP_URL,
          process.env.RENDER_EXTERNAL_URL,
        ];

  for (const raw of ordered) {
    const first = raw?.split(',')[0]?.trim();
    if (first) return first.replace(/\/$/, '');
  }
  return '';
};
