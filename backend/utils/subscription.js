import { PLANS } from '../config/subscription.js';

const isOwnerEmail = (email) => {
  const owner = process.env.OWNER_EMAIL?.trim().toLowerCase();
  return owner && email?.toLowerCase() === owner;
};

export const isPremiumActive = (user) => {
  if (!user) return false;
  if (isOwnerEmail(user.email)) return true;

  if (user.subscriptionPlan === 'premium') {
    if (user.subscriptionStatus === 'active') return true;
    if (user.premiumUntil && new Date(user.premiumUntil) > new Date()) return true;
  }

  return false;
};

export const getUserPlan = (user) => {
  if (isPremiumActive(user)) return PLANS.premium;
  return PLANS.free;
};

const todayKey = () => new Date().toISOString().slice(0, 10);

export const resetDailyCountIfNeeded = (user) => {
  const today = todayKey();
  if (user.dailyMessageDate !== today) {
    user.dailyMessageDate = today;
    user.dailyMessageCount = 0;
  }
};

export const canSendMessage = (user) => {
  if (isPremiumActive(user)) {
    return { allowed: true, remaining: null };
  }

  resetDailyCountIfNeeded(user);
  const limit = PLANS.free.dailyMessages;
  const used = user.dailyMessageCount || 0;
  const remaining = Math.max(0, limit - used);

  if (used >= limit) {
    return {
      allowed: false,
      remaining: 0,
      message:
        `Тегін күнделікті лимит (${limit} хабарлама) аяқталды. Premium сатып алыңыз — /pricing`,
    };
  }

  return { allowed: true, remaining };
};

export const canUploadImage = (user) => {
  if (isPremiumActive(user)) return { allowed: true };
  return {
    allowed: false,
    message: 'Сурет жүктеу тек Premium пайдаланушыларға. /pricing бетіне өтіңіз.',
  };
};

export const incrementDailyMessage = async (user) => {
  if (isPremiumActive(user)) return;
  resetDailyCountIfNeeded(user);
  user.dailyMessageCount = (user.dailyMessageCount || 0) + 1;
  await user.save();
};

export const formatSubscriptionForClient = (user) => {
  const premium = isPremiumActive(user);
  const plan = premium ? PLANS.premium : PLANS.free;
  resetDailyCountIfNeeded(user);

  return {
    plan: premium ? 'premium' : 'free',
    planName: plan.name,
    isPremium: premium,
    subscriptionStatus: user.subscriptionStatus || null,
    premiumUntil: user.premiumUntil || null,
    dailyLimit: PLANS.free.dailyMessages,
    dailyUsed: user.dailyMessageCount || 0,
    dailyRemaining: premium
      ? null
      : Math.max(0, PLANS.free.dailyMessages - (user.dailyMessageCount || 0)),
    imageUpload: plan.imageUpload,
    paymentsEnabled: Boolean(process.env.LAVA_API_KEY && process.env.LAVA_OFFER_ID),
    paymentProvider: 'lava',
  };
};
