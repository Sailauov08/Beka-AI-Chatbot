const LAVA_API_BASE = process.env.LAVA_API_URL || 'https://gate.lava.top';

export const getLavaConfig = () => ({
  apiKey: process.env.LAVA_API_KEY,
  webhookKey: process.env.LAVA_WEBHOOK_API_KEY || process.env.LAVA_API_KEY,
  offerId: process.env.LAVA_OFFER_ID,
  currency: process.env.LAVA_CURRENCY || 'RUB',
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

/** Бір реттік төлем — төлем бетінің URL */
export const createOneTimePayment = async ({ email, offerId, currency, userId }) => {
  const body = {
    email,
    offerId,
    currency: currency || getLavaConfig().currency,
    periodicity: 'ONE_TIME',
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
