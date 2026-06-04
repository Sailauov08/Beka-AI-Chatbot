import { PLANS } from '../config/subscription.js';

const isOwnerEmail = (email) => {
  const owner = process.env.OWNER_EMAIL?.trim().toLowerCase();
  return owner && email?.toLowerCase() === owner;
};

const normalizePlanId = (plan) => {
  if (plan === 'premium') return 'pro';
  return plan || 'free';
};

export const getActivePlanId = (user) => {
  if (!user) return 'free';
  if (isOwnerEmail(user.email)) return 'pro';

  const plan = normalizePlanId(user.subscriptionPlan);
  if (plan === 'free') return 'free';

  const paidPlans = ['basic', 'pro'];
  if (paidPlans.includes(plan)) {
    if (user.subscriptionStatus === 'active') return plan;
    if (user.premiumUntil && new Date(user.premiumUntil) > new Date()) return plan;
  }

  return 'free';
};

export const getUserPlan = (user) => {
  const id = getActivePlanId(user);
  return PLANS[id] || PLANS.free;
};

export const isPaidPlan = (user) => {
  const id = getActivePlanId(user);
  return id === 'basic' || id === 'pro';
};

/** Кері үйлесімдік */
export const isPremiumActive = (user) => isPaidPlan(user);

const todayKey = () => new Date().toISOString().slice(0, 10);

export const resetDailyCountIfNeeded = (user) => {
  const today = todayKey();
  if (user.dailyMessageDate !== today) {
    user.dailyMessageDate = today;
    user.dailyMessageCount = 0;
  }
};

export const canSendMessage = (user) => {
  const plan = getUserPlan(user);
  if (plan.dailyMessages == null) {
    return { allowed: true, remaining: null };
  }

  resetDailyCountIfNeeded(user);
  const limit = plan.dailyMessages;
  const used = user.dailyMessageCount || 0;
  const remaining = Math.max(0, limit - used);

  if (used >= limit) {
    return {
      allowed: false,
      remaining: 0,
      message: `Күнделікті лимит (${limit}) аяқталды. Жоспарды жаңартыңыз — /pricing`,
    };
  }

  return { allowed: true, remaining };
};

export const canUploadImage = (user) => {
  const plan = getUserPlan(user);
  if (plan.imageUpload) return { allowed: true };
  return {
    allowed: false,
    message: 'Сурет жүктеу уақытша қолжетімсіз. /pricing',
  };
};

export const incrementDailyMessage = async (user) => {
  const plan = getUserPlan(user);
  if (plan.dailyMessages == null) return;
  resetDailyCountIfNeeded(user);
  user.dailyMessageCount = (user.dailyMessageCount || 0) + 1;
  await user.save();
};

export const formatSubscriptionForClient = (user) => {
  const planId = getActivePlanId(user);
  const plan = PLANS[planId] || PLANS.free;
  resetDailyCountIfNeeded(user);

  return {
    plan: planId,
    planName: plan.name,
    isPremium: planId !== 'free',
    isPro: planId === 'pro',
    subscriptionStatus: user.subscriptionStatus || null,
    premiumUntil: user.premiumUntil || null,
    dailyLimit: plan.dailyMessages,
    dailyUsed: user.dailyMessageCount || 0,
    dailyRemaining:
      plan.dailyMessages == null
        ? null
        : Math.max(0, plan.dailyMessages - (user.dailyMessageCount || 0)),
    imageUpload: plan.imageUpload,
    paymentsEnabled: Boolean(
      process.env.LAVA_API_KEY &&
        (process.env.LAVA_OFFER_ID_BASIC || process.env.LAVA_OFFER_ID)
    ),
    paymentProvider: 'lava',
  };
};
