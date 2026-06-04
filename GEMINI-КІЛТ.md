# Gemini жауап бермейді — шешім

## Неге лимит толтырдыңыз да жауап жоқ?

Көбіне **ескі API кілт** қолданылады. Төлем басқа жобада болса, Render/local `.env` ішіндегі **GEMINI_API_KEY** сол ескі кілтке байланысты қалады → 429 қате, жауап жоқ.

---

## 1. Жаңа API кілт жасау

1. https://aistudio.google.com/apikey  
2. Төлем қосылған **Google Cloud жобасын** таңдаңыз  
3. **Create API key** → кілтті көшіріңіз (`AIza...`)

---

## 2. Render-ге қою

**Dashboard → Web Service → Environment**

| Key | Value |
|-----|--------|
| `GEMINI_API_KEY` | жаңа `AIza...` кілт |
| `GEMINI_MODEL` | `gemini-2.0-flash,gemini-2.0-flash-lite` |

**Save** → redeploy күтіңіз (2–5 мин).

---

## 3. Жергілікті тексеру

```powershell
cd backend
# .env ішіне жаңа GEMINI_API_KEY қойыңыз
node scripts/test-gemini.js
```

`✅ gemini-2.0-flash жұмыс істейді` шықса — сайтта да жұмыс істейді.

---

## 4. Сайтта тексеру

Кіргеннен кейін (токен қажет):

`https://СІЗДІҢ-САЙТ.onrender.com/api/chat/gemini-check`

Жауап:

```json
{ "success": true, "message": "Gemini API жұмыс істейді" }
```

---

## 5. Чатта

- **Жаңа чат** ашыңыз  
- «Сәлем» жіберіңіз  
- 1 минут «Ойлануда...» — содан кейін мәтін  

Қызыл қате шықса — мәтінін сақтап, жіберіңіз.
