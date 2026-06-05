# Телефонға SMS код — Twilio баптау

Тіркелу/кіру бетінде телефон жазыңыз:
```
+77001234567
```
немесе
```
87001234567
```
→ SMS код келеді → растаңыз.

---

## 1. Twilio тіркелу

1. https://www.twilio.com/try-twilio
2. Email + телефон растаңыз
3. Console ашылады: https://console.twilio.com

---

## 2. Кілттерді алу

**Account Info** бөлімінде:

| Twilio | Render key |
|--------|------------|
| Account SID | `TWILIO_ACCOUNT_SID` |
| Auth Token | `TWILIO_AUTH_TOKEN` |

---

## 3. Телефон нөмірі

1. Console → **Phone Numbers** → **Buy a number**
2. Ел таңдаңыз (trial: шектеулі)
3. Нөмірді көшіріңіз → Render: `TWILIO_PHONE_NUMBER`

Мысал: `+15005550006`

---

## 4. Render Environment

| Key | Value |
|-----|--------|
| `TWILIO_ACCOUNT_SID` | Console-дан |
| `TWILIO_AUTH_TOKEN` | Console-дан |
| `TWILIO_PHONE_NUMBER` | `+1...` нөмір |

**Save Changes** → deploy 2–5 мин.

---

## 5. Trial шектеуі

Twilio trial кезінде SMS тек **тексерілген нөмірлерге** жіберіледі:

1. Twilio → **Phone Numbers** → **Verified Caller IDs**
2. Өз телефоныңызды қосып растаңыз
3. Сол нөмірмен тіркелуді тест етіңіз

Production үшін Twilio шотын толтырыңыз.

---

## 6. Тест

```
https://beka-ai-chatbot.onrender.com/register
```

1. Аты + `+7700...` + пароль
2. **Тіркелу** → SMS код
3. Код енгізу → дайын

---

## Email де жұмыс істейді

SMTP бапталған болса — email арқылы да код келеді.
