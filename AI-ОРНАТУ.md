# AI ауыстыру (Gemini лимит бітсе)

## Жылдам шешім — Groq (тегін)

1. https://console.groq.com/keys — тіркеліп, **Create API Key**
2. Render → **Environment**:

| Key | Value |
|-----|--------|
| `AI_PROVIDER` | `groq` |
| `GROQ_API_KEY` | `gsk_...` кілт |
| `GROQ_MODEL` | `llama-3.3-70b-versatile,llama-3.1-8b-instant` |

3. **Save** → redeploy (2–5 мин)

### Жергілікті тексеру

```powershell
cd backend
node scripts/test-groq.js
```

---

## Gemini қалдыру (жаңа кілт)

1. https://aistudio.google.com/apikey — **жаңа** кілт жасаңыз
2. Render:

| Key | Value |
|-----|--------|
| `AI_PROVIDER` | `gemini` |
| `GEMINI_API_KEY` | жаңа `AIza...` |
| `GEMINI_MODEL` | `gemini-2.0-flash-lite,gemini-2.0-flash` |

---

## Ескерту

| | Gemini | Groq |
|---|--------|------|
| Мәтін чат | ✅ | ✅ |
| Сурет жүктеу | ✅ | ❌ |
| Тегін лимит | шектеулі | жомарт |

Сурет керек болса — `AI_PROVIDER=gemini` қалдырыңыз.
