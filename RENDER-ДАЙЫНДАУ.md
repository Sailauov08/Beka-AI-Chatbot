# Render-де Beka AI толық жұмыс істеуі

Сілтеме мысалы: `https://beka-ai-chatbot.onrender.com`

---

## 1. GitHub-қа соңғы кодты жіберу

PowerShell:

```powershell
cd "C:\Users\USER\OneDrive\Desktop\Beka-AI-Chatbot"
git add .
git commit -m "Render deploy: profile, weather, auth UI"
git push origin main
```

Render **2–5 минут** ішінде өзі қайта deploy жасайды.

---

## 2. Render Dashboard — міндетті Environment Variables

**Web Service → Environment** — төмендегілер **бар** болуы керек:

| Key | Мән |
|-----|-----|
| `NODE_ENV` | `production` |
| `SERVE_FRONTEND` | `true` |
| `MONGO_URI` | MongoDB Atlas толық сілтеме (`.../ai_chatbot_db?retryWrites=...`) |
| `JWT_SECRET` | Ұзын кездейсоқ құпия сөз (мыс. 32+ таңба) |
| `GEMINI_API_KEY` | Google AI Studio кілті (`AIza...`) |
| `GEMINI_MODEL` | `gemini-2.5-flash,gemini-2.0-flash-lite,gemini-1.5-flash-8b` |
| `CLIENT_URL` | `https://СІЗДІҢ-СЕРВИС.onrender.com` (өз URL-іңіз, `/` жоқ) |

`CLIENT_URL` — Lava webhook және CORS үшін. Render `RENDER_EXTERNAL_URL` автоматты береді, бірақ `CLIENT_URL` қоюды ұсынамыз.

### Төлем (Lava.top) — қосымша

| Key | Мән |
|-----|-----|
| `LAVA_API_KEY` | Lava API кілті |
| `LAVA_OFFER_ID_BASIC` | 50₽ offer ID |
| `LAVA_OFFER_ID_PRO` | 120₽ offer ID |
| `LAVA_WEBHOOK_API_KEY` | Webhook кілті |
| `LAVA_PERIODICITY` | `MONTHLY` |

Lava webhook URL:

```
https://СІЗДІҢ-СЕРВИС.onrender.com/api/payment/lava/webhook
```

---

## 3. Render Build / Start (дұрыс мәндер)

| Өріс | Мән |
|------|-----|
| **Build Command** | `npm run render-build` |
| **Start Command** | `npm start` |
| **Root Directory** | бос (репо түбі) |

`render.yaml` бар болса, Render оны автоматты оқи алады.

---

## 4. Deploy сәтті ме? — тексеру

1. **Logs** — қызыл қате жоқ, `MongoDB connected`, `Frontend:` жолы бар  
2. Браузер: `https://....onrender.com` — кіру/тіркелу беті (AIDA стиль)  
3. `https://....onrender.com/api/health` — JSON:
   ```json
   { "success": true, "frontend": true, "database": true, "gemini": true }
   ```
4. Тіркелу → чат → хабарлама жіберу  
5. `/profile`, `/pricing`, `/settings` — беттер ашылады  

---

## 5. Жиі қателер

| Белгі | Шешім |
|--------|--------|
| `Cannot GET /` | Build сәтсіз — Logs-та `render-build`, `frontend/dist` |
| MongoDB connection | Atlas: IP `0.0.0.0/0`, пароль дұрыс, `MONGO_URI` Render-де |
| AI жауап бермейді | `GEMINI_API_KEY` Render Environment-те |
| 30–60 сек күту | Free Render ұйықтаған — қайта ашыңыз |
| Профиль суреті жоғалды | Free tier: redeploy кейін uploads жойылуы мүмкін — қайта жүктеңіз |
| Ескі дизайн | `git push` жасалмаған — GitHub + Render deploy күтіңіз |

---

## 6. Достарға жіберу

```
https://СІЗДІҢ-СЕРВИС.onrender.com
```

`localhost` емес — тек HTTPS Render сілтемесі.

---

Толық нұсқау: `ИНТЕРНЕТКЕ-ШЫҒАРУ.md`
