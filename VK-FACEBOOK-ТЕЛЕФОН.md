# VK, Facebook, Телефон — Render баптау

Сайт: `https://beka-ai-chatbot.onrender.com`

**Apple** — сайтта эмблема тұрады, бірақ басылмайды (жақында).

---

## 1. VK кіру

### VK dev.vk.com
1. https://dev.vk.com → **Создать приложение** → **Веб-сайт**
2. Адрес сайта: `https://beka-ai-chatbot.onrender.com`
3. **Redirect URI:**
   ```
   https://beka-ai-chatbot.onrender.com/api/auth/oauth/vk/callback
   ```

### Render Environment
| Key | Қайдан |
|-----|--------|
| `VK_CLIENT_ID` | ID приложения |
| `VK_CLIENT_SECRET` | Защищённый ключ |

---

## 2. Facebook кіру

### developers.facebook.com
1. **Create App** → Consumer
2. **Facebook Login** → Settings
3. **Valid OAuth Redirect URIs:**
   ```
   https://beka-ai-chatbot.onrender.com/api/auth/oauth/facebook/callback
   ```

### Render Environment
| Key | Қайдан |
|-----|--------|
| `FACEBOOK_APP_ID` | App ID |
| `FACEBOOK_APP_SECRET` | App Secret |

---

## 3. Телефонға SMS код (Twilio)

### console.twilio.com
1. Тіркелу → **Account SID** + **Auth Token**
2. **Phone Numbers** → нөмір сатып ал

### Render Environment
| Key | Мән |
|-----|-----|
| `TWILIO_ACCOUNT_SID` | Console-дан |
| `TWILIO_AUTH_TOKEN` | Console-дан |
| `TWILIO_PHONE_NUMBER` | `+1...` нөмір |

### Сайтта қолдану
Тіркелу/кіру бетінде email орнына телефон:
```
+77001234567
```
немесе
```
87001234567
```
→ SMS код келеді → растау.

---

## 4. Save + deploy

Render → **Save Changes** → 2–5 мин күту.

Тексеру: `/login` — VK, Facebook түймелері белсенді болуы керек.
