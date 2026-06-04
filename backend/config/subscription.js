/** Тегін және Premium лимиттер */
export const PLANS = {
  free: {
    id: 'free',
    name: 'Тегін',
    dailyMessages: 15,
    imageUpload: false,
    priority: false,
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    dailyMessages: null,
    imageUpload: true,
    priority: true,
  },
};

export const PREMIUM_FEATURES = [
  'Шексіз хабарлама',
  'Сурет жүктеу (Vision AI)',
  'Жылдам жауап',
  'Барлық чат тарихы',
];
