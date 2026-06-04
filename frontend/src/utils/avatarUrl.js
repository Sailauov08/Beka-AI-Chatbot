/** Сервердегі /uploads/... жолын толық URL-ге айналдыру */
export const resolveAvatarUrl = (avatarUrl) => {
  if (!avatarUrl) return null;
  if (avatarUrl.startsWith('http') || avatarUrl.startsWith('blob:') || avatarUrl.startsWith('data:')) {
    return avatarUrl;
  }
  const base = import.meta.env.VITE_API_ORIGIN || '';
  return `${base}${avatarUrl}`;
};
