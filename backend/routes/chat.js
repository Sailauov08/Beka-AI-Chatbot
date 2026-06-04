import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Chat from '../models/Chat.js';
import { protect } from '../middleware/auth.js';
import {
  canSendMessage,
  canUploadImage,
  incrementDailyMessage,
} from '../utils/subscription.js';
import { buildBekaSystemInstruction, wantsNoTranslation } from '../prompts/bekaSystem.js';
import { writeSse, extractChunkText, buildHistoryForAI } from '../utils/geminiStream.js';

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

const getGenAI = () => {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
    throw new Error(
      'GEMINI_API_KEY бапталмаған. backend/.env файлына Google AI Studio кілтін қойыңыз: https://aistudio.google.com/apikey'
    );
  }
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
};

const DEFAULT_MODELS = [
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash-8b',
  'gemini-2.5-flash',
];

const getModelList = () => {
  if (process.env.GEMINI_MODEL) {
    return process.env.GEMINI_MODEL.split(',').map((m) => m.trim()).filter(Boolean);
  }
  return DEFAULT_MODELS;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const parseRetryDelayMs = (error) => {
  const msg = error?.message || '';
  const secMatch = msg.match(/retry in ([\d.]+)s/i);
  if (secMatch) return Math.min(Math.ceil(parseFloat(secMatch[1]) * 1000) + 1000, 65000);
  return 16000;
};

const formatGeminiError = (error) => {
  const msg = error?.message || String(error);
  if (msg.includes('limit: 0')) {
    return (
      'Бұл жобада тегін Gemini квотасы жоқ (limit: 0). ' +
      'AI Studio-да жаңа жоба (Create project) жасап, сол жобаға жаңа кілт алыңыз немесе 1–2 сағат күтіп қайта көріңіз.'
    );
  }
  if (msg.includes('429') || msg.toLowerCase().includes('quota') || msg.includes('Too Many Requests')) {
    return (
      'Gemini API квотасы асып кетті (429). 1–2 минут күтіп қайта көріңіз. ' +
      'Немесе https://aistudio.google.com/apikey сайтынан жаңа API кілт (AIza...) жасап, .env файлына қойыңыз.'
    );
  }
  if (msg.includes('404') && msg.includes('not found')) {
    return 'AI моделі табылмады. .env ішіндегі GEMINI_MODEL мәнін тексеріңіз.';
  }
  if (msg.includes('API key not valid') || msg.includes('API_KEY_INVALID')) {
    return 'API кілті жарамсыз. Google AI Studio-дан жаңа кілт алыңыз (AIza... форматы).';
  }
  return msg.length > 300 ? `${msg.slice(0, 300)}...` : msg;
};

const isRetryableModelError = (error) => {
  const msg = error?.message || '';
  return msg.includes('429') || msg.includes('404') || msg.toLowerCase().includes('quota');
};

const fileToGenerativePart = (filePath, mimeType) => {
  return {
    inlineData: {
      data: fs.readFileSync(filePath).toString('base64'),
      mimeType,
    },
  };
};

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

    const genAI = getGenAI();
    const modelList = getModelList();
    const historyForAI = buildHistoryForAI(chat.messages);

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

    let result = null;
    let lastError = null;

    for (const modelName of modelList) {
      let attempts = 0;
      const maxAttempts = 2;

      while (attempts < maxAttempts) {
        try {
          const model = genAI.getGenerativeModel({
            model: modelName,
            systemInstruction,
          });
          const chatSession = model.startChat({ history: historyForAI });
          result = await chatSession.sendMessageStream(promptParts);
          console.log(`Gemini model used: ${modelName}`);
          break;
        } catch (err) {
          lastError = err;
          attempts += 1;
          console.warn(`Model ${modelName} failed:`, err.message?.slice(0, 120));

          if (err.message?.includes('429') && attempts < maxAttempts) {
            const delay = parseRetryDelayMs(err);
            console.log(`429 — ${delay / 1000}s күтілуде, қайта сынау...`);
            writeSse(res, { type: 'status', status: 'thinking' });
            await sleep(delay);
            continue;
          }

          if (!isRetryableModelError(err)) {
            throw err;
          }
          break;
        }
      }

      if (result) break;
    }

    clearInterval(keepalive);

    if (!result) {
      throw lastError || new Error('Барлық AI модельдері сәтсіз аяқталды');
    }

    writeSse(res, { type: 'status', status: 'generating' });

    let fullAssistantResponse = '';
    let sentFirstChunk = false;

    for await (const chunk of result.stream) {
      const chunkText = extractChunkText(chunk);
      if (chunkText) {
        if (!sentFirstChunk) {
          sentFirstChunk = true;
        }
        fullAssistantResponse += chunkText;
        writeSse(res, { type: 'chunk', content: chunkText });
      }
    }

    if (!fullAssistantResponse.trim()) {
      let blockMsg = 'AI жауап бермеді. Қайта көріңіз немесе сұрақты өзгертіп жіберіңіз.';
      try {
        const final = await result.response;
        const reason = final?.promptFeedback?.blockReason || final?.candidates?.[0]?.finishReason;
        if (reason) blockMsg = `AI жауап бермеді: ${reason}`;
      } catch {
        /* ignore */
      }
      throw new Error(blockMsg);
    }

    chat.messages.push({
      role: 'assistant',
      content: fullAssistantResponse,
    });

    await chat.save();
    await incrementDailyMessage(req.user);

    writeSse(res, { type: 'done', chatId: chat._id.toString() });
    res.end();
  } catch (error) {
    if (keepalive) clearInterval(keepalive);
    console.error('Chat stream error:', error);

    const friendlyMessage = formatGeminiError(error);

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
