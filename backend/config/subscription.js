/** 3 тариф: Тегін, Бастау (50₽), Про (120₽) */
export const PLANS = {
  free: {
    id: 'free',
    name: 'Тегін',
    price: 0,
    priceLabel: '0 ₽',
    dailyMessages: 15,
    imageUpload: true,
    priority: false,
    durationDays: null,
  },
  basic: {
    id: 'basic',
    name: 'Бастау',
    price: 50,
    priceLabel: '50 ₽ / ай',
    dailyMessages: 80,
    imageUpload: true,
    priority: false,
    durationDays: 30,
  },
  pro: {
    id: 'pro',
    name: 'Про',
    price: 120,
    priceLabel: '120 ₽ / ай',
    dailyMessages: null,
    imageUpload: true,
    priority: true,
    durationDays: 30,
  },
};

export const PLAN_ORDER = ['free', 'basic', 'pro'];

export const getOfferIdForPlan = (planId) => {
  if (planId === 'basic') {
    return process.env.LAVA_OFFER_ID_BASIC || process.env.LAVA_OFFER_ID;
  }
  if (planId === 'pro') {
    return process.env.LAVA_OFFER_ID_PRO || process.env.LAVA_OFFER_ID;
  }
  return null;
};
