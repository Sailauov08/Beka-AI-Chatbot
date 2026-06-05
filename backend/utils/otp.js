import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import VerificationCode from '../models/VerificationCode.js';
import { sendEmailOtp } from './mailer.js';
import { sendSmsOtp } from './sms.js';

const OTP_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

export const generateOtpCode = () => String(Math.floor(100000 + Math.random() * 900000));

const hashOtp = async (code) => bcrypt.hash(code, 10);

export const createAndSendOtp = async ({ target, channel, purpose, payload = null }) => {
  const code = generateOtpCode();
  const codeHash = await hashOtp(code);

  await VerificationCode.deleteMany({ target, purpose });

  await VerificationCode.create({
    target,
    channel,
    purpose,
    codeHash,
    expiresAt: new Date(Date.now() + OTP_TTL_MS),
    payload,
  });

  let sent = false;
  if (channel === 'email') {
    sent = await sendEmailOtp(target, code, purpose);
  } else {
    sent = await sendSmsOtp(target, code, purpose);
  }

  const devMode = process.env.NODE_ENV !== 'production';
  const exposeDevCode = devMode && process.env.OTP_DEV_MODE !== 'false';

  return {
    sent,
    devCode: exposeDevCode ? code : undefined,
    expiresInSec: OTP_TTL_MS / 1000,
  };
};

export const verifyOtp = async ({ target, purpose, code }) => {
  const record = await VerificationCode.findOne({ target, purpose }).sort({ createdAt: -1 });
  if (!record) {
    return { ok: false, message: 'Код табылмады. Қайта сұраңыз.' };
  }

  if (record.expiresAt < new Date()) {
    await VerificationCode.deleteOne({ _id: record._id });
    return { ok: false, message: 'Код мерзімі өтті. Жаңа код сұраңыз.' };
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    return { ok: false, message: 'Тым көп қате әрекет. Жаңа код сұраңыз.' };
  }

  const match = await bcrypt.compare(String(code), record.codeHash);
  if (!match) {
    record.attempts += 1;
    await record.save();
    return { ok: false, message: 'Код дұрыс емес' };
  }

  await VerificationCode.deleteOne({ _id: record._id });
  return { ok: true, payload: record.payload, channel: record.channel };
};
