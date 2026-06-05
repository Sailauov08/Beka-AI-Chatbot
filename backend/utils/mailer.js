import nodemailer from 'nodemailer';

let transporter = null;
let verifyPromise = null;

export const isSmtpConfigured = () =>
  Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);

const getSmtpAuth = () => ({
  user: process.env.SMTP_USER?.trim(),
  pass: String(process.env.SMTP_PASS || '').replace(/\s+/g, ''),
});

const formatFromAddress = () => {
  const from = process.env.SMTP_FROM?.trim();
  if (from) return from;
  return process.env.SMTP_USER?.trim();
};

const mapSmtpError = (err) => {
  const msg = String(err?.message || '').toLowerCase();

  if (msg.includes('invalid login') || msg.includes('username and password') || msg.includes('bad credentials')) {
    return 'Gmail App Password дұрыс емес. Render-де SMTP_PASS бос орынсыз 16 таңба болуы керек.';
  }
  if (msg.includes('self signed') || msg.includes('certificate')) {
    return 'SMTP SSL қатесі. SMTP_PORT=587, SMTP_SECURE=false қойыңыз.';
  }
  if (msg.includes('timeout') || msg.includes('connect') || msg.includes('etimedout')) {
    return 'SMTP серверіне қосылу сәтсіз. Интернетті немесе SMTP_HOST тексеріңіз.';
  }
  if (msg.includes('recipient') || msg.includes('mailbox')) {
    return 'Email адресі жарамсыз немесе жеткізу мүмкін емес.';
  }

  return `Email жіберілмеді: ${err?.message || 'белгісіз қате'}`;
};

const buildTransporter = () => {
  if (!isSmtpConfigured()) return null;

  const auth = getSmtpAuth();
  const host = (process.env.SMTP_HOST || 'smtp.gmail.com').trim();

  if (host === 'smtp.gmail.com') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth,
    });
  }

  const port = Number(process.env.SMTP_PORT || 587);
  const secure = process.env.SMTP_SECURE === 'true';

  return nodemailer.createTransport({
    host,
    port,
    secure,
    requireTLS: !secure && port === 587,
    auth,
    connectionTimeout: 20000,
    greetingTimeout: 20000,
    socketTimeout: 25000,
  });
};

const getTransporter = async () => {
  if (transporter) return transporter;

  const built = buildTransporter();
  if (!built) return null;

  if (!verifyPromise) {
    verifyPromise = built.verify().then(() => {
      transporter = built;
      console.log('✓ SMTP қосылды:', process.env.SMTP_USER);
    }).catch((err) => {
      console.error('✗ SMTP verify failed:', err.message);
      verifyPromise = null;
      throw err;
    });
  }

  await verifyPromise;
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

  if (!isSmtpConfigured()) {
    console.log(`[OTP email → ${email}] ${code} (SMTP бапталмаған)`);
    return {
      sent: false,
      error: 'Email сервисі бапталмаған. Render-де SMTP_USER және SMTP_PASS қосыңыз.',
    };
  }

  try {
    const transport = await getTransporter();
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
    verifyPromise = null;
    return { sent: false, error: mapSmtpError(err) };
  }
};
