import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chat.js';
import friendsRoutes from './routes/friends.js';
import paymentRoutes, { handleLavaWebhook } from './routes/payment.js';
import { getPublicAppUrl } from './utils/appUrl.js';
import { getOAuthRedirectUri } from './utils/oauthHelpers.js';
import { isSmtpConfigured } from './utils/mailer.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsRoot = path.join(__dirname, 'uploads');
const avatarsDir = path.join(uploadsRoot, 'avatars');
for (const dir of [uploadsRoot, avatarsDir]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const app = express();
app.set('trust proxy', 1);

const PORT = process.env.PORT || 5006;

const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
const indexHtmlPath = path.join(frontendDist, 'index.html');
const hasFrontendBuild = fs.existsSync(indexHtmlPath);
const wantsFrontend =
  process.env.SERVE_FRONTEND === 'true' || process.env.NODE_ENV === 'production';
const serveFrontend = hasFrontendBuild && (wantsFrontend || hasFrontendBuild);

if (wantsFrontend && !hasFrontendBuild) {
  console.error(`⚠ frontend/dist/index.html табылмады: ${indexHtmlPath}`);
  console.error('Render Build Command: npm run render-build');
}

const corsOrigins = [
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  `http://localhost:${PORT}`,
  `http://127.0.0.1:${PORT}`,
];

if (process.env.CLIENT_URL) {
  corsOrigins.push(
    ...process.env.CLIENT_URL.split(',').map((url) => url.trim()).filter(Boolean)
  );
}

const publicAppUrl = getPublicAppUrl();
if (publicAppUrl && !corsOrigins.includes(publicAppUrl)) {
  corsOrigins.push(publicAppUrl);
}

app.use(cors({
  origin: corsOrigins,
  credentials: true,
}));

app.post('/api/payment/lava/webhook', express.json(), handleLavaWebhook);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/friends', friendsRoutes);
app.use('/api/payment', paymentRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Beka AI is running',
    frontend: serveFrontend,
    database: mongoose.connection.readyState === 1,
    appUrl: publicAppUrl || null,
    gemini: Boolean(
      process.env.GEMINI_API_KEY &&
        process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here'
    ),
    geminiModel: process.env.GEMINI_MODEL || 'gemini-2.0-flash,gemini-2.0-flash-lite',
  });
});

if (serveFrontend) {
  app.use(express.static(frontendDist));
  app.get('/', (req, res) => {
    res.sendFile(indexHtmlPath);
  });
  app.get(/^(?!\/api|\/uploads).*/, (req, res) => {
    res.sendFile(indexHtmlPath);
  });
} else {
  app.get('/', (req, res) => {
    res.status(200).send(
      'Beka AI API жұмыс істейді. Сайт үшін start-beka.bat іске қосыңыз немесе build-frontend.bat орындаңыз.'
    );
  });
}

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai_chatbot_db';

  try {
    await mongoose.connect(mongoUri);
    console.log(`MongoDB connected: ${mongoose.connection.name} @ ${mongoose.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

connectDB();

const geminiKey = process.env.GEMINI_API_KEY;
if (!geminiKey || geminiKey === 'your_gemini_api_key_here') {
  console.warn('⚠ GEMINI_API_KEY орнатылмаған — AI жауап бермейді. backend/.env файлын толтырыңыз.');
} else if (!geminiKey.startsWith('AIza') && !geminiKey.startsWith('AQ.')) {
  console.warn('⚠ GEMINI_API_KEY форматы танылмады. Google AI Studio кілтін тексеріңіз.');
}

if (!process.env.LAVA_API_KEY || !process.env.LAVA_OFFER_ID) {
  console.warn('⚠ Lava.top бапталмаған — төлем жұмыс істемейді. ТӨЛЕМ-ОРНАТУ.md қараңыз.');
}

if (process.env.GOOGLE_CLIENT_ID) {
  console.log('Google OAuth callback:', getOAuthRedirectUri('google'));
} else {
  console.warn('⚠ GOOGLE_CLIENT_ID жоқ — Google кіру өшік');
}

if (isSmtpConfigured()) {
  console.log('SMTP user:', process.env.SMTP_USER);
} else {
  console.warn('⚠ SMTP бапталмаған — email код жіберілмейді');
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  if (publicAppUrl) {
    console.log(`Public URL: ${publicAppUrl}`);
  }
  if (serveFrontend) {
    console.log(`Frontend: ${publicAppUrl || `http://localhost:${PORT}`}`);
    console.log('Бір сервер — API + React бірге.');
  } else {
    console.warn('⚠ frontend/dist табылмады — Chrome-да Cannot GET / шығады!');
    console.log('Шешім: build-frontend.bat, содан кейін start-beka.bat');
    console.log('Немесе dev: http://localhost:5174 (start-frontend.bat)');
  }
});
