import express from 'express';
import User from '../models/User.js';
import DirectConversation, { buildParticipantKey } from '../models/DirectConversation.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const publicUserBrief = (user) => ({
  _id: user._id,
  name: user.name,
  avatarUrl: user.avatar || null,
});

const formatConversation = (conv, currentUserId) => {
  const other = conv.participants.find((p) => String(p._id) !== String(currentUserId));
  return {
    _id: conv._id,
    otherUser: publicUserBrief(other),
    lastMessagePreview: conv.lastMessagePreview || '',
    lastMessageAt: conv.lastMessageAt,
    updatedAt: conv.updatedAt,
  };
};

// GET /api/friends/search?q=аты
router.get('/search', protect, async (req, res) => {
  try {
    const q = String(req.query.q || '').trim();
    if (q.length < 2) {
      return res.json({ success: true, data: [] });
    }

    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const users = await User.find({
      _id: { $ne: req.user._id },
      name: { $regex: escaped, $options: 'i' },
    })
      .select('name avatar')
      .limit(20)
      .lean();

    res.json({
      success: true,
      data: users.map(publicUserBrief),
    });
  } catch (err) {
    console.error('Friends search error:', err);
    res.status(500).json({ success: false, message: 'Іздеу қатесі' });
  }
});

// GET /api/friends/conversations
router.get('/conversations', protect, async (req, res) => {
  try {
    const conversations = await DirectConversation.find({
      participants: req.user._id,
    })
      .populate('participants', 'name avatar')
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .lean();

    res.json({
      success: true,
      data: conversations.map((c) => formatConversation(c, req.user._id)),
    });
  } catch (err) {
    console.error('Friends conversations error:', err);
    res.status(500).json({ success: false, message: 'Чаттарды жүктеу қатесі' });
  }
});

// POST /api/friends/conversations  { userId }
router.post('/conversations', protect, async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId қажет' });
    }
    if (String(userId) === String(req.user._id)) {
      return res.status(400).json({ success: false, message: 'Өзіңізге жаза алмайсыз' });
    }

    const other = await User.findById(userId).select('name avatar');
    if (!other) {
      return res.status(404).json({ success: false, message: 'Пайдаланушы табылмады' });
    }

    const participantKey = buildParticipantKey(req.user._id, userId);
    let conversation = await DirectConversation.findOne({ participantKey }).populate(
      'participants',
      'name avatar'
    );

    if (!conversation) {
      conversation = await DirectConversation.create({
        participants: [req.user._id, other._id],
        participantKey,
      });
      await conversation.populate('participants', 'name avatar');
    }

    res.json({
      success: true,
      data: formatConversation(conversation.toObject(), req.user._id),
    });
  } catch (err) {
    console.error('Friends create conversation error:', err);
    res.status(500).json({ success: false, message: 'Чат ашу қатесі' });
  }
});

// GET /api/friends/conversations/:id
router.get('/conversations/:id', protect, async (req, res) => {
  try {
    const conversation = await DirectConversation.findOne({
      _id: req.params.id,
      participants: req.user._id,
    })
      .populate('participants', 'name avatar')
      .lean();

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Чат табылмады' });
    }

    const other = conversation.participants.find((p) => String(p._id) !== String(req.user._id));

    res.json({
      success: true,
      data: {
        _id: conversation._id,
        otherUser: publicUserBrief(other),
        messages: conversation.messages.map((m) => ({
          _id: m._id,
          senderId: m.senderId,
          content: m.content,
          createdAt: m.createdAt,
          isMine: String(m.senderId) === String(req.user._id),
        })),
      },
    });
  } catch (err) {
    console.error('Friends get conversation error:', err);
    res.status(500).json({ success: false, message: 'Хабарламаларды жүктеу қатесі' });
  }
});

// POST /api/friends/conversations/:id/messages  { content }
router.post('/conversations/:id/messages', protect, async (req, res) => {
  try {
    const content = String(req.body.content || '').trim();
    if (!content) {
      return res.status(400).json({ success: false, message: 'Хабарлама бос' });
    }

    const conversation = await DirectConversation.findOne({
      _id: req.params.id,
      participants: req.user._id,
    });

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Чат табылмады' });
    }

    const message = {
      senderId: req.user._id,
      content,
      createdAt: new Date(),
    };

    conversation.messages.push(message);
    conversation.lastMessageAt = message.createdAt;
    conversation.lastMessagePreview = content.slice(0, 120);
    await conversation.save();

    const saved = conversation.messages[conversation.messages.length - 1];

    res.status(201).json({
      success: true,
      data: {
        _id: saved._id,
        senderId: saved.senderId,
        content: saved.content,
        createdAt: saved.createdAt,
        isMine: true,
      },
    });
  } catch (err) {
    console.error('Friends send message error:', err);
    res.status(500).json({ success: false, message: 'Жіберу қатесі' });
  }
});

export default router;
