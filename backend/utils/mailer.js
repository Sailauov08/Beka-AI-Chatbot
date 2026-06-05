import nodemailer from 'nodemailer';

let transporter = null;

export const isSmtpConfigured = () =>
  Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

const formatFromAddress = () => {
  const from = process.env.SMTP_FROM?.trim();
  if (from) return from;
  return process.env.SMTP_USER;
};

const mapSmtpError = (err) => {
  const msg = String(err?.message || '').toLowerCase();

  if (msg.includes('invalid login') || msg.includes('username and password')) {
    return 'Gmail App Password дұрыс емес. Render-де SMTP_PASS тексеріңіз.';
  }
  if (msg.includes('self signed') || msg.includes('certificate')) {
    return 'SMTP SSL қатесі. SMTP_PORT=587, SMTP_SECURE=false қойыңыз.';
  }
  if (msg.includes('timeout') || msg.includes('connect')) {
    return 'SMTP серверіне қосылу сәтсіз. SMTP_HOST=smtp.gmail.com тексеріңіз.';
  }
  if (msg.includes('recipient') || msg.includes('mailbox')) {
    return 'Email адресі жарамсыз немесе жеткізу мүмкін емес.';
  }

  return `Email жіберілмеді: ${err?.message || 'белгісіз қате'}`;
};

const getTransporter = () => {
  if (transporter) return transporter;

  if (!isSmtpConfigured()) {
    return null;
  }

  const port = Number(process.env.SMTP_PORT || 587);
  const secure = process.env.SMTP_SECURE === 'true';

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    requireTLS: !secure && port === 587,
    auth: {
      user: process.env.SMTP_USER?.trim(),
      // Gmail App Password: бос орынсыз 16 таңба (Render-де қосылып қалса да тазалаймыз)
      pass: String(process.env.SMTP_PASS || '').replace(/\s+/g, ''),
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
  });

  return transporter;
};

export const sendEmailOtp = async (email, code, purpose) => {
  const subject =
    purpose === 'register'
      ? 'Beka AI — тіркелу коды'
      : purpose === 'reset-password'
        ? 'Beka AI — құпия сөзді қалпына келтіру'
        : 'Beka AI — кіру коды';
  const text = `Сіздің растау кодыңыз: ${code}\nКод 10 минутқа жарамды.`;

  const transport = getTransporter();
  if (!transport) {
    console.log(`[OTP email → ${email}] ${code} (SMTP бапталмаған)`);
    return {
      sent: false,
      error: 'Email сервисі бапталмаған. Render-де SMTP_HOST, SMTP_USER, SMTP_PASS қосыңыз.',
    };
  }

  try {
    await transport.sendMail({
      from: formatFromAddress(),
      to: email,
      subject,
      text,
      html: `<p>Сіздің растау кодыңыз:</p><p style="font-size:28px;font-weight:bold;letter-spacing:4px">${code}</p><p>Код 10 минутқа жарамды.</p>`,
    });
    console.log(`[OTP email → ${email}] жіберілді`);
    return { sent: true };
  } catch (err) {
    console.error('SMTP send error:', err.message);
    transporter = null;
    return { sent: false, error: mapSmtpError(err) };
  }
};
