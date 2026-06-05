import express from 'express';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { avatarUpload, avatarsDir } from '../middleware/avatarUpload.js';
import { formatSubscriptionForClient } from '../utils/subscription.js';
import { parseIdentifier, findUserByIdentifier } from '../utils/normalizeIdentifier.js';
import oauthRoutes from './oauth.js';

const router = express.Router();

router.use('/oauth', oauthRoutes);

const userPayload = (user, token) => ({
  _id: user._id,
  name: user.name,
  email: user.email || null,
  phone: user.phone || null,
  avatarUrl: user.avatar || null,
  token,
  subscription: formatSubscriptionForClient(user),
});

const publicUserFields = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email || null,
  phone: user.phone || null,
  avatarUrl: user.avatar || null,
  subscription: formatSubscriptionForClient(user),
});

const removeAvatarFile = (avatarPath) => {
  if (!avatarPath) return;
  const full = path.join(avatarsDir, path.basename(avatarPath));
  if (fs.existsSync(full)) {
    try {
      fs.unlinkSync(full);
    } catch (e) {
      console.warn('Avatar file delete failed:', e.message);
    }
  }
};

const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '30d' });

const userExists = async (target, channel) => {
  if (channel === 'email') {
    return User.findOne({ email: target });
  }
  return User.findOne({ phone: target });
};

// POST /api/auth/register/send-code
router.post('/register/send-code', async (req, res) => {
  try {
    const { name, identifier, password, confirmPassword } = req.body;

    if (!name?.trim() || !identifier?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: 'Аты, email/телефон және құпия сөз қажет',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Құпия сөздер сәйкес келмейді',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Құпия сөз кемінде 6 таңба',
      });
    }

    const parsed = parseIdentifier(identifier);
    if (parsed.error) {
      return res.status(400).json({ success: false, message: parsed.error });
    }

    const existing = await userExists(parsed.target, parsed.channel);
    if (existing) {
      return res.status(400).json({
        success: false,
        message:
          parsed.channel === 'email'
            ? 'Бұл email тіркелген'
            : 'Бұл телефон тіркелген',
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userData = {
      name: name.trim(),
      password: passwordHash,
      emailVerified: parsed.channel === 'email',
      phoneVerified: parsed.channel === 'phone',
    };

    if (parsed.channel === 'email') {
      userData.email = parsed.target;
    } else {
      userData.phone = parsed.target;
    }

    const user = await User.create(userData);
    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: 'Тіркелу сәтті',
      data: { ...userPayload(user, token), direct: true },
    });
  } catch (error) {
    console.error('Register send-code error:', error);
    res.status(500).json({ success: false, message: error.message || 'Сервер қатесі' });
  }
});

// POST /api/auth/login/send-code
router.post('/login/send-code', async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email/телефон және құпия сөз қажет',
      });
    }

    const { user, error } = await findUserByIdentifier(User, identifier);
    if (error) {
      return res.status(400).json({ success: false, message: error });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Дұрыс емес email/телефон немесе құпия сөз',
      });
    }

    if (user.oauthProvider && !user.password) {
      return res.status(400).json({
        success: false,
        message: `${user.oauthProvider} арқылы кіріңіз`,
        code: 'USE_OAUTH',
        provider: user.oauthProvider,
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password || '');
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Дұрыс емес email/телефон немесе құпия сөз',
      });
    }

    const token = generateToken(user._id);
    return res.json({
      success: true,
      message: 'Кіру сәтті',
      data: { ...userPayload(user, token), direct: true },
    });
  } catch (error) {
    console.error('Login send-code error:', error);
    res.status(500).json({ success: false, message: error.message || 'Сервер қатесі' });
  }
});

// POST /api/auth/oauth/token — frontend callback token exchange
router.post('/oauth/token', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: 'Token жоқ' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Пайдаланушы табылмады' });
    }

    res.json({
      success: true,
      data: userPayload(user, token),
    });
  } catch {
    res.status(401).json({ success: false, message: 'Жарамсыз token' });
  }
});

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  try {
    res.json({
      success: true,
      data: publicUserFields(req.user),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/auth/avatar
router.post('/avatar', protect, avatarUpload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Сурет файлын таңдаңыз' });
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    const user = await User.findById(req.user._id);

    if (user.avatar && user.avatar !== avatarUrl) {
      removeAvatarFile(user.avatar);
    }

    user.avatar = avatarUrl;
    await user.save();

    res.json({
      success: true,
      message: 'Profile photo updated',
      data: { avatarUrl },
    });
  } catch (error) {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Avatar upload failed',
    });
  }
});

// DELETE /api/auth/avatar
router.delete('/avatar', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user.avatar) {
      removeAvatarFile(user.avatar);
      user.avatar = null;
      await user.save();
    }
    res.json({ success: true, data: { avatarUrl: null } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
