# Кіру / Тіркелу — OAuth және OTP баптау

## Қалай жұмыс істейді

### Email немесе телефон
- Тіркелу: аты + email **немесе** телефон + құпия сөз → **6 цифрлы код** жіберіледі → растағаннан кейін аккаунт ашылады
- Кіру: email/телефон + құпия сөз → код жіберіледі → кодпен кіресіз

### Әлеуметтік желілер
Түйме басқанда нақты провайдерге бағытталады:
- Google
- VK
- Facebook
- Apple

---

## 1. Email коды (SMTP)

Render → **Environment**:

| Key | Мысал |
|-----|--------|
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_SECURE` | `false` |
| `SMTP_USER` | `your@gmail.com` |
| `SMTP_PASS` | Gmail App Password |
| `SMTP_FROM` | `Beka AI <your@gmail.com>` |

---

## 2. Телефон коды (SMS — Twilio)

| Key | Сипаттама |
|-----|-----------|
| `TWILIO_ACCOUNT_SID` | Twilio Console |
| `TWILIO_AUTH_TOKEN` | Twilio Console |
| `TWILIO_PHONE_NUMBER` | `+1...` нөмір |

---

## 3. Google OAuth

1. https://console.cloud.google.com → APIs → OAuth client ID (Web)
2. Redirect URI: `https://СІЗДІҢ-САЙТ.onrender.com/api/auth/oauth/google/callback`
3. Environment:

```
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

---

## 4. Facebook

1. https://developers.facebook.com → App → Facebook Login
2. Redirect: `https://САЙТ/api/auth/oauth/facebook/callback`

```
FACEBOOK_APP_ID=...
FACEBOOK_APP_SECRET=...
```

---

## 5. VK

1. https://dev.vk.com → қосымша жасау
2. Redirect: `https://САЙТ/api/auth/oauth/vk/callback`

```
VK_CLIENT_ID=...
VK_CLIENT_SECRET=...
```

---

## 6. Apple

1. Apple Developer → Sign in with Apple
2. Service ID + Key (.p8) → `APPLE_CLIENT_SECRET` (JWT)

```
APPLE_CLIENT_ID=com.yourapp.service
APPLE_CLIENT_SECRET=eyJ... (generated JWT)
```

---

## Міндетті

```
CLIENT_URL=https://beka-ai-chatbot.onrender.com
JWT_SECRET=ұзын_кездейсоқ_мәтін
```

`CLIENT_URL` OAuth қайтару және `/auth/callback` үшін керек.

---

## Жергілікті тест (код жіберілмейді)

SMTP/Twilio жоқ болса, код **сервер консолінде** және бетте **«Жергілікті тест коды»** ретінде көрінеді.

Өшіру: `OTP_DEV_MODE=false`

---

## Redirect URI тізімі (барлығы)

```
https://САЙТ/api/auth/oauth/google/callback
https://САЙТ/api/auth/oauth/facebook/callback
https://САЙТ/api/auth/oauth/vk/callback
https://САЙТ/api/auth/oauth/apple/callback
```

Жергілікті:
```
http://localhost:5006/api/auth/oauth/google/callback
```
