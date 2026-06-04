import express from 'express';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { avatarUpload, avatarsDir } from '../middleware/avatarUpload.js';
import { formatSubscriptionForClient } from '../utils/subscription.js';

const router = express.Router();

const userPayload = (user, token) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  avatarUrl: user.avatar || null,
  token,
  subscription: formatSubscriptionForClient(user),
});

const publicUserFields = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
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

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email and password',
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: userPayload(user, token),
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration',
    });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: userPayload(user, token),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during login',
    });
  }
});

// GET /api/auth/me — профиль + жазылым
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

// POST /api/auth/avatar — профиль суреті
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
