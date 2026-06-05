import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { formatSubscriptionForClient } from '../utils/subscription.js';
import {
  fetchJson,
  getOAuthRedirectUri,
  redirectWithError,
  redirectWithToken,
  signOAuthState,
  verifyOAuthState,
} from '../utils/oauthHelpers.js';

const router = express.Router();

const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '30d' });

const upsertOAuthUser = async ({ provider, oauthId, email, name, avatarUrl }) => {
  const normalizedEmail = email?.toLowerCase()?.trim() || null;

  let user = await User.findOne({ oauthProvider: provider, oauthId });

  if (!user && normalizedEmail) {
    user = await User.findOne({ email: normalizedEmail });
    if (user) {
      user.oauthProvider = provider;
      user.oauthId = oauthId;
      if (!user.name && name) user.name = name;
      if (!user.avatar && avatarUrl) user.avatar = avatarUrl;
      user.emailVerified = true;
      await user.save();
      return user;
    }
  }

  if (!user) {
    try {
      user = await User.create({
        name: name || 'Beka User',
        email: normalizedEmail || undefined,
        oauthProvider: provider,
        oauthId,
        emailVerified: !!normalizedEmail,
        avatar: avatarUrl || null,
      });
      return user;
    } catch (createErr) {
      if (createErr.code === 11000 && normalizedEmail) {
        user = await User.findOne({ email: normalizedEmail });
        if (user) {
          user.oauthProvider = provider;
          user.oauthId = oauthId;
          user.emailVerified = true;
          await user.save();
          return user;
        }
      }
      throw createErr;
    }
  }

  if (name && user.name === 'Beka User') user.name = name;
  if (avatarUrl && !user.avatar) user.avatar = avatarUrl;
  if (normalizedEmail) user.emailVerified = true;
  await user.save();
  return user;
};

const finishOAuth = async (res, user) => {
  const token = generateToken(user._id);
  redirectWithToken(res, token);
};

// ——— Google ———
router.get('/google', (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return redirectWithError(res, 'Google OAuth бапталмаған');
  }
  const state = signOAuthState('google');
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getOAuthRedirectUri('google'),
    response_type: 'code',
    scope: 'openid email profile',
    state,
    access_type: 'online',
    prompt: 'select_account',
  });
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
});

router.get('/google/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    if (!code || !verifyOAuthState(state, 'google')) {
      return redirectWithError(res, 'Google растау қатесі');
    }

    const tokenData = await fetchJson('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: getOAuthRedirectUri('google'),
        grant_type: 'authorization_code',
      }),
    });

    const profile = await fetchJson('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const user = await upsertOAuthUser({
      provider: 'google',
      oauthId: profile.id,
      email: profile.email,
      name: profile.name,
      avatarUrl: profile.picture,
    });

    await finishOAuth(res, user);
  } catch (err) {
    console.error('Google OAuth:', err.message, err.data || '');
    let msg = 'Google арқылы кіру сәтсіз';

    if (err.data?.error === 'redirect_uri_mismatch') {
      msg =
        'Google redirect URI сәйкес емес. Google Console-ға мына URL қосыңыз: ' +
        getOAuthRedirectUri('google');
    } else if (err.data?.error_description) {
      msg = String(err.data.error_description);
    } else if (String(err.message || '').includes('E11000')) {
      msg = 'Бұл email басқа аккаунтпен байланған';
    } else if (err.message) {
      msg = err.message;
    }

    redirectWithError(res, msg);
  }
});

// ——— Facebook ———
router.get('/facebook', (req, res) => {
  const appId = process.env.FACEBOOK_APP_ID;
  if (!appId) {
    return redirectWithError(res, 'Facebook OAuth бапталмаған');
  }
  const state = signOAuthState('facebook');
  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: getOAuthRedirectUri('facebook'),
    state,
    scope: 'email,public_profile',
    response_type: 'code',
  });
  res.redirect(`https://www.facebook.com/v19.0/dialog/oauth?${params}`);
});

router.get('/facebook/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    if (!code || !verifyOAuthState(state, 'facebook')) {
      return redirectWithError(res, 'Facebook растау қатесі');
    }

    const tokenData = await fetchJson(
      `https://graph.facebook.com/v19.0/oauth/access_token?${new URLSearchParams({
        client_id: process.env.FACEBOOK_APP_ID,
        client_secret: process.env.FACEBOOK_APP_SECRET,
        redirect_uri: getOAuthRedirectUri('facebook'),
        code,
      })}`
    );

    const profile = await fetchJson(
      `https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${tokenData.access_token}`
    );

    const user = await upsertOAuthUser({
      provider: 'facebook',
      oauthId: profile.id,
      email: profile.email,
      name: profile.name,
      avatarUrl: profile.picture?.data?.url,
    });

    await finishOAuth(res, user);
  } catch (err) {
    console.error('Facebook OAuth:', err);
    redirectWithError(res, 'Facebook арқылы кіру сәтсіз');
  }
});

// ——— VK ———
router.get('/vk', (req, res) => {
  const appId = process.env.VK_CLIENT_ID;
  if (!appId) {
    return redirectWithError(res, 'VK OAuth бапталмаған');
  }
  const state = signOAuthState('vk');
  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: getOAuthRedirectUri('vk'),
    display: 'page',
    scope: 'email',
    response_type: 'code',
    state,
    v: '5.131',
  });
  res.redirect(`https://oauth.vk.com/authorize?${params}`);
});

router.get('/vk/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    if (!code || !verifyOAuthState(state, 'vk')) {
      return redirectWithError(res, 'VK растау қатесі');
    }

    const tokenData = await fetchJson(
      `https://oauth.vk.com/access_token?${new URLSearchParams({
        client_id: process.env.VK_CLIENT_ID,
        client_secret: process.env.VK_CLIENT_SECRET,
        redirect_uri: getOAuthRedirectUri('vk'),
        code,
      })}`
    );

    const users = await fetchJson(
      `https://api.vk.com/method/users.get?${new URLSearchParams({
        user_ids: tokenData.user_id,
        fields: 'photo_200',
        access_token: tokenData.access_token,
        v: '5.131',
      })}`
    );

    const vkUser = users.response?.[0];
    const user = await upsertOAuthUser({
      provider: 'vk',
      oauthId: String(tokenData.user_id),
      email: tokenData.email,
      name: vkUser ? `${vkUser.first_name} ${vkUser.last_name}`.trim() : 'VK User',
      avatarUrl: vkUser?.photo_200,
    });

    await finishOAuth(res, user);
  } catch (err) {
    console.error('VK OAuth:', err);
    redirectWithError(res, 'VK арқылы кіру сәтсіз');
  }
});

// ——— Apple ———
router.get('/apple', (req, res) => {
  const clientId = process.env.APPLE_CLIENT_ID;
  if (!clientId) {
    return redirectWithError(res, 'Apple OAuth бапталмаған');
  }
  const state = signOAuthState('apple');
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getOAuthRedirectUri('apple'),
    response_type: 'code',
    scope: 'name email',
    response_mode: 'form_post',
    state,
  });
  res.redirect(`https://appleid.apple.com/auth/authorize?${params}`);
});

router.post('/apple/callback', async (req, res) => {
  try {
    const { code, state, user: appleUserRaw } = req.body;
    if (!code || !verifyOAuthState(state, 'apple')) {
      return redirectWithError(res, 'Apple растау қатесі');
    }

    const clientSecret = process.env.APPLE_CLIENT_SECRET;
    if (!clientSecret) {
      return redirectWithError(res, 'Apple client secret бапталмаған');
    }

    const tokenData = await fetchJson('https://appleid.apple.com/auth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.APPLE_CLIENT_ID,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: getOAuthRedirectUri('apple'),
      }),
    });

    const idPayload = JSON.parse(
      Buffer.from(tokenData.id_token.split('.')[1], 'base64').toString()
    );

    let parsedName = null;
    if (appleUserRaw) {
      try {
        const parsed = typeof appleUserRaw === 'string' ? JSON.parse(appleUserRaw) : appleUserRaw;
        parsedName = [parsed.name?.firstName, parsed.name?.lastName].filter(Boolean).join(' ');
      } catch {
        /* ignore */
      }
    }

    const user = await upsertOAuthUser({
      provider: 'apple',
      oauthId: idPayload.sub,
      email: idPayload.email,
      name: parsedName || 'Apple User',
    });

    await finishOAuth(res, user);
  } catch (err) {
    console.error('Apple OAuth:', err);
    redirectWithError(res, 'Apple арқылы кіру сәтсіз');
  }
});

// GET fallback for Apple (some configs use GET)
router.get('/apple/callback', (req, res) => {
  redirectWithError(res, 'Apple callback POST күтіледі — Apple Developer баптауын тексеріңіз');
});

// Provider availability for frontend
router.get('/providers', (req, res) => {
  res.json({
    success: true,
    data: {
      google: !!process.env.GOOGLE_CLIENT_ID,
      facebook: !!process.env.FACEBOOK_APP_ID,
      vk: !!process.env.VK_CLIENT_ID,
      apple: !!process.env.APPLE_CLIENT_ID && !!process.env.APPLE_CLIENT_SECRET,
    },
  });
});

export default router;
