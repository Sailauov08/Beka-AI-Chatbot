import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Chat from '../models/Chat.js';
import { protect } from '../middleware/auth.js';
import {
  canSendMessage,
  canUploadImage,
  incrementDailyMessage,
} from '../utils/subscription.js';
import { buildBekaSystemInstruction, wantsNoTranslation } from '../prompts/bekaSystem.js';
import { writeSse } from '../utils/geminiStream.js';
import {
  streamChat,
  checkAiConnection,
  formatAiError,
  fileToGenerativePart,
  getAiProvider,
} from '../utils/aiStream.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, png, gif, webp) are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

// GET /api/chat/gemini-check — AI кілт жұмыс істей ме (тіркелген пайдаланушы)
router.get('/gemini-check', protect, async (req, res) => {
  try {
    const result = await checkAiConnection();
    res.json({
      success: true,
      provider: result.provider,
      model: result.model,
      sample: result.sample,
      message: `${result.provider} API жұмыс істейді`,
    });
  } catch (error) {
    console.error('AI check failed:', error.message);
    res.status(500).json({
      success: false,
      provider: getAiProvider(),
      message: formatAiError(error),
    });
  }
});

// GET /api/chat/history - list all chats for user
router.get('/history', protect, async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.user._id })
      .select('title createdAt updatedAt messages')
      .sort({ updatedAt: -1 });

    const chatList = chats.map((chat) => ({
      _id: chat._id,
      title: chat.title,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
      preview: chat.messages.length > 0 ? chat.messages[chat.messages.length - 1].content.slice(0, 80) : '',
    }));

    res.json({ success: true, data: chatList });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/chat/:chatId - get single chat
router.get('/:chatId', protect, async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.chatId,
      userId: req.user._id,
    });

    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    res.json({ success: true, data: chat });
  } catch (error) {
    console.error('Get chat error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/chat/new - create new chat
router.post('/new', protect, async (req, res) => {
  try {
    const chat = await Chat.create({
      userId: req.user._id,
      title: 'New Chat',
      messages: [],
    });

    res.status(201).json({ success: true, data: chat });
  } catch (error) {
    console.error('Create chat error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/chat/:chatId
router.delete('/:chatId', protect, async (req, res) => {
  try {
    const chat = await Chat.findOneAndDelete({
      _id: req.params.chatId,
      userId: req.user._id,
    });

    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    res.json({ success: true, message: 'Chat deleted successfully' });
  } catch (error) {
    console.error('Delete chat error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/chat - streaming AI response with SSE
router.post('/', protect, upload.single('image'), async (req, res) => {
  let uploadedFilePath = null;
  let keepalive = null;

  try {
    const { message, chatId, language } = req.body;
    const userLang = ['kk', 'ru', 'en'].includes(language) ? language : 'kk';

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const sendCheck = canSendMessage(req.user);
    if (!sendCheck.allowed) {
      return res.status(402).json({
        success: false,
        message: sendCheck.message,
        code: 'LIMIT_REACHED',
        upgradeUrl: '/pricing',
      });
    }

    if (req.file) {
      const imageCheck = canUploadImage(req.user);
      if (!imageCheck.allowed) {
        if (req.file.path && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(402).json({
          success: false,
          message: imageCheck.message,
          code: 'PREMIUM_REQUIRED',
          upgradeUrl: '/pricing',
        });
      }
    }

    let chat;
    if (chatId) {
      chat = await Chat.findOne({ _id: chatId, userId: req.user._id });
      if (!chat) {
        return res.status(404).json({ success: false, message: 'Chat not found' });
      }
    } else {
      chat = await Chat.create({
        userId: req.user._id,
        title: message.slice(0, 50),
        messages: [],
      });
    }

    const userMessage = {
      role: 'user',
      content: message.trim(),
      imageUrl: req.file ? `/uploads/${req.file.filename}` : null,
    };

    chat.messages.push(userMessage);

    if (chat.messages.length === 1) {
      chat.title = message.slice(0, 50);
    }

    await chat.save();

    if (req.file) {
      uploadedFilePath = req.file.path;
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    writeSse(res, { type: 'chatId', chatId: chat._id.toString() });
    writeSse(res, { type: 'status', status: 'thinking' });

    keepalive = setInterval(() => {
      writeSse(res, { type: 'ping' });
    }, 10000);

    let userText = message.trim();
    const recentUserTexts = chat.messages
      .filter((m) => m.role === 'user')
      .slice(-5)
      .map((m) => m.content);
    const noTranslationMode =
      wantsNoTranslation(userText) || recentUserTexts.some((t) => wantsNoTranslation(t));

    if (noTranslationMode) {
      const langOnly =
        userLang === 'ru' ? 'орысша' : userLang === 'en' ? 'ағылшынша' : 'қазақша';
      userText = `${userText}\n\n[Міндетті: жақша () ішінде ағылшынша аударма ҚОСПА. Жауап тек ${langOnly}.]`;
    }

    let promptParts = [{ text: userText }];

    if (req.file) {
      promptParts = [
        fileToGenerativePart(req.file.path, req.file.mimetype),
        { text: userText },
      ];
    }

    const systemInstruction = buildBekaSystemInstruction(userLang);

    writeSse(res, { type: 'status', status: 'generating' });

    let fullAssistantResponse = '';

    for await (const chunkText of streamChat({
      systemInstruction,
      chatMessages: chat.messages,
      promptParts,
      userText,
      hasImage: Boolean(req.file),
    })) {
      fullAssistantResponse += chunkText;
      writeSse(res, { type: 'chunk', content: chunkText });
    }

    if (!fullAssistantResponse.trim()) {
      throw new Error('AI жауап бермеді. Қайта көріңіз немесе сұрақты өзгертіп жіберіңіз.');
    }

    chat.messages.push({
      role: 'assistant',
      content: fullAssistantResponse,
    });

    await chat.save();
    await incrementDailyMessage(req.user);

    clearInterval(keepalive);
    writeSse(res, { type: 'done', chatId: chat._id.toString() });
    res.end();
  } catch (error) {
    if (keepalive) clearInterval(keepalive);
    console.error('Chat stream error:', error);

    const friendlyMessage = formatAiError(error);

    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: friendlyMessage,
      });
    }

    writeSse(res, { type: 'error', message: friendlyMessage });
    res.end();
  } finally {
    if (keepalive) clearInterval(keepalive);
    if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
      // Keep uploaded files for display; optional cleanup can be added later
    }
  }
});

export default router;
