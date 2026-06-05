import twilio from 'twilio';

export const sendSmsOtp = async (phone, code, purpose) => {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;

  const label = purpose === 'register' ? 'тіркелу' : 'кіру';
  const body = `Beka AI ${label} коды: ${code}. 10 минутқа жарамды.`;

  if (!sid || !token || !from) {
    console.log(`[OTP SMS → ${phone}] ${code}`);
    return false;
  }

  const client = twilio(sid, token);
  await client.messages.create({ body, from, to: phone });
  return true;
};
