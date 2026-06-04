# Beka AI Chatbot

ChatGPT/Gemini стиліндегі толық стек AI чат қосымшасы.

## Құрылым

```
Beka-AI-Chatbot/
├── backend/          # Express + MongoDB + Gemini AI
│   ├── models/       # User.js, Chat.js
│   ├── routes/       # auth.js, chat.js
│   ├── middleware/   # auth.js (JWT)
│   ├── uploads/      # Жүктелген суреттер
│   ├── server.js
│   ├── package.json
│   └── .env
└── frontend/         # React + Vite + Tailwind CSS
    └── src/
        ├── components/
        ├── context/
        ├── pages/
        └── services/
```

## Орнату

### 1. MongoDB

MongoDB Compass арқылы жергілікті серверді іске қосыңыз:
`mongodb://127.0.0.1:27017/ai_chatbot_db`

### 2. Backend

```bash
cd backend
npm install
```

`backend/.env` файлында `GEMINI_API_KEY` мәнін орнатыңыз:
https://aistudio.google.com/apikey

```bash
npm run dev
```

Сервер: http://localhost:5006

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Қосымша: http://localhost:5174

## API Endpoints

| Метод | Жол | Сипаттама |
|-------|-----|-----------|
| POST | `/api/auth/register` | Тіркелу |
| POST | `/api/auth/login` | Кіру (JWT) |
| GET | `/api/chat/history` | Чат тарихы |
| GET | `/api/chat/:chatId` | Бір чат |
| POST | `/api/chat/new` | Жаңа чат |
| POST | `/api/chat` | AI стриминг (SSE) |
| DELETE | `/api/chat/:chatId` | Чат жою |

## Технологиялар

- **Backend:** Node.js, Express, Mongoose, bcryptjs, jsonwebtoken, @google/generative-ai, multer
- **Frontend:** React 18, Vite, Tailwind CSS, react-markdown, react-syntax-highlighter
- **Database:** MongoDB (Compass)
