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
  return Boolean(apiKey && offerId);
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
  const body = {
    email,
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
