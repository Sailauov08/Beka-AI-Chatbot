const LAVA_API_BASE = process.env.LAVA_API_URL || 'https://gate.lava.top';

/** ONE_TIME | MONTHLY | PERIOD_90_DAYS | PERIOD_180_DAYS | PERIOD_YEAR */
export const getLavaPeriodicity = () =>
  process.env.LAVA_PERIODICITY || 'MONTHLY';

export const getLavaConfig = () => ({
  apiKey: process.env.LAVA_API_KEY,
  webhookKey: process.env.LAVA_WEBHOOK_API_KEY || process.env.LAVA_API_KEY,
  offerId: process.env.LAVA_OFFER_ID,
  currency: process.env.LAVA_CURRENCY || 'RUB',
  periodicity: getLavaPeriodicity(),
});

export const isLavaConfigured = () => {
  const { apiKey, offerId } = getLavaConfig();
  const hasOffer =
    process.env.LAVA_OFFER_ID_BASIC ||
    process.env.LAVA_OFFER_ID_PRO ||
    offerId;
  return Boolean(apiKey && hasOffer);
};

/** Lava-ға жіберу алдында email тазалау */
export const normalizeBuyerEmail = (email) =>
  String(email || '')
    .trim()
    .toLowerCase();

const getMerchantEmails = () =>
  (process.env.LAVA_MERCHANT_EMAIL || process.env.OWNER_EMAIL || '')
    .split(',')
    .map((e) => normalizeBuyerEmail(e))
    .filter(Boolean);

/**
 * Lava «Incorrect email to purchase» — әдетте:
 * - сатушы (автор) өз email-імен сатып алуға тырысады
 * - email форматы жарамсыз
 */
export const prepareBuyerEmail = (email) => {
  const normalized = normalizeBuyerEmail(email);

  if (!normalized || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    throw new Error(
      'Email дұрыс емес. Сайттағы профиль email-ін тексеріңіз (мысалы name@gmail.com).'
    );
  }

  const merchantEmails = getMerchantEmails();
  if (merchantEmails.includes(normalized)) {
    throw new Error(
      'Бұл email — сіздің Lava автор аккаунтыңыз. Өз өніміңізді осы email-мен сатып ала алмайсыз. Басқа email-мен жаңа аккаунт тіркеліңіз немесе досыңызға тестілеңіз.'
    );
  }

  return normalized;
};

export const formatLavaError = (message) => {
  const msg = message || '';
  if (msg.toLowerCase().includes('incorrect email')) {
    return (
      'Lava бұл email-мен төлемге рұқсат бермеді. ' +
      'Өз Lava автор email-іңізбен тіркелмеңіз — басқа email қолданыңыз (дос тесті).'
    );
  }
  return msg;
};

const lavaFetch = async (path, options = {}) => {
  const { apiKey } = getLavaConfig();
  if (!apiKey) throw new Error('LAVA_API_KEY бапталмаған');

  const response = await fetch(`${LAVA_API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': apiKey,
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || data.message || `Lava API ${response.status}`);
  }

  return data;
};

/** Lava төлем/invoce — periodicity lava өніміне сәйкес болуы керек */
export const createLavaPayment = async ({ email, offerId, currency, userId }) => {
  const config = getLavaConfig();
  const buyerEmail = prepareBuyerEmail(email);
  const body = {
    email: buyerEmail,
    offerId,
    currency: currency || config.currency,
    periodicity: config.periodicity,
    buyerLanguage: 'RU',
    clientUtm: {
      utm_source: 'beka-ai-chatbot',
      utm_medium: 'app',
      utm_campaign: 'premium',
      utm_content: userId,
    },
  };

  return lavaFetch('/api/v2/invoice', {
    method: 'POST',
    body: JSON.stringify(body),
  });
};

/** Өнімдер тізімі — offerId табу үшін */
export const getProducts = async () => {
  const params = new URLSearchParams({
    contentCategories: 'PRODUCT',
    feedVisibility: 'ALL',
    showAllSubscriptionPeriods: 'true',
  });
  return lavaFetch(`/api/v2/products?${params}`);
};

export const verifyWebhookApiKey = (headerValue) => {
  const { webhookKey } = getLavaConfig();
  return webhookKey && headerValue === webhookKey;
};
