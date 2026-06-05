import jwt from 'jsonwebtoken';
import { getPublicAppUrl } from './appUrl.js';

export const getOAuthRedirectUri = (provider) => {
  const base = getPublicAppUrl() || `http://localhost:${process.env.PORT || 5006}`;
  return `${base}/api/auth/oauth/${provider}/callback`;
};

export const getFrontendUrl = () => {
  const base = getPublicAppUrl() || 'http://localhost:5174';
  return base.replace(/\/$/, '');
};

export const redirectWithToken = (res, token) => {
  const front = getFrontendUrl();
  res.redirect(`${front}/auth/callback?token=${encodeURIComponent(token)}`);
};

export const redirectWithError = (res, message) => {
  const front = getFrontendUrl();
  res.redirect(`${front}/auth/callback?error=${encodeURIComponent(message)}`);
};

export const signOAuthState = (provider) =>
  jwt.sign({ provider, t: Date.now() }, process.env.JWT_SECRET, { expiresIn: '15m' });

export const verifyOAuthState = (state, provider) => {
  try {
    const decoded = jwt.verify(state, process.env.JWT_SECRET);
    if (decoded.provider !== provider) return false;
    return true;
  } catch {
    return false;
  }
};

export const fetchJson = async (url, options = {}) => {
  const res = await fetch(url, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error_description || data.error || 'OAuth request failed');
    err.data = data;
    throw err;
  }
  return data;
};
