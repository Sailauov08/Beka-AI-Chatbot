import nodemailer from 'nodemailer';

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user, pass },
  });

  return transporter;
};

export const sendEmailOtp = async (email, code, purpose) => {
  const transport = getTransporter();
  const subject =
    purpose === 'register'
      ? 'Beka AI — тіркелу коды'
      : 'Beka AI — кіру коды';
  const text = `Сіздің растау кодыңыз: ${code}\nКод 10 минутқа жарамды.`;

  if (!transport) {
    console.log(`[OTP email → ${email}] ${code}`);
    return false;
  }

  await transport.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject,
    text,
    html: `<p>Сіздің растау кодыңыз:</p><p style="font-size:28px;font-weight:bold;letter-spacing:4px">${code}</p><p>Код 10 минутқа жарамды.</p>`,
  });

  return true;
};
