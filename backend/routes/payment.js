import express from 'express';
import User from '../models/User.js';
import PaymentOrder from '../models/PaymentOrder.js';
import { protect } from '../middleware/auth.js';
import { PLANS, PREMIUM_FEATURES } from '../config/subscription.js';
import { formatSubscriptionForClient } from '../utils/subscription.js';
import {
  isLavaConfigured,
  getLavaConfig,
  createLavaPayment,
  getProducts,
  verifyWebhookApiKey,
} from '../services/lavatop.js';

const router = express.Router();

const displayPrice = () =>
  process.env.PREMIUM_DISPLAY_PRICE ||
  `${process.env.PREMIUM_AMOUNT || '2990'} ₸ / ${process.env.PREMIUM_DURATION_DAYS || 30} күн`;

const getPremiumDurationDays = () => {
  const days = parseInt(process.env.PREMIUM_DURATION_DAYS || '30', 10);
  return Number.isFinite(days) ? days : 30;
};

const activatePremium = async (user, days) => {
  const until = new Date();
  until.setDate(until.getDate() + days);

  if (user.premiumUntil && new Date(user.premiumUntil) > new Date()) {
    until.setTime(new Date(user.premiumUntil).getTime());
    until.setDate(until.getDate() + days);
  }

  user.subscriptionPlan = 'premium';
  user.subscriptionStatus = 'active';
  user.premiumUntil = until;
  await user.save();
};

/** Lava.top webhook — «Нәтиже платежа» */
export const handleLavaWebhook = async (req, res) => {
  const apiKeyHeader = req.headers['x-api-key'];

  if (!verifyWebhookApiKey(apiKeyHeader)) {
    console.error('Lava webhook: invalid X-Api-Key');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const data = req.body;
    const eventType = data.eventType;

    const successEvents = [
      'payment.success',
      'subscription.recurring.payment.success',
    ];

    if (successEvents.includes(eventType)) {
      const email = data.buyer?.email;
      const contractId = data.contractId;

      if (!email) {
        return res.status(200).json({ ok: true });
      }

      const user = await User.findOne({ email: email.toLowerCase() });
      if (user) {
        const days = getPremiumDurationDays();
        await activatePremium(user, days);

        if (contractId) {
          await PaymentOrder.findOneAndUpdate(
            { userId: user._id, status: 'pending' },
            { status: 'paid', lavaContractId: contractId },
            { sort: { createdAt: -1 } }
          );
        }

        console.log(`Premium via Lava.top: ${user.email}, event ${eventType}`);
      }
    }

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Lava webhook error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
};

router.get('/plans', (req, res) => {
  res.json({
    success: true,
    data: {
      free: PLANS.free,
      premium: PLANS.premium,
      features: PREMIUM_FEATURES,
      displayPrice: displayPrice(),
      durationDays: getPremiumDurationDays(),
      paymentsEnabled: isLavaConfigured(),
      provider: 'lava',
    },
  });
});

router.get('/status', protect, async (req, res) => {
  res.json({
    success: true,
    data: formatSubscriptionForClient(req.user),
  });
});

/** Offer ID табуға көмек (әкімші) */
router.get('/lava-products', protect, async (req, res) => {
  try {
    if (!isLavaConfigured()) {
      return res.status(503).json({ success: false, message: 'LAVA_API_KEY қойылмаған' });
    }

    const products = await getProducts();
    const offers = [];

    for (const item of products.items || []) {
      if (item.type === 'PRODUCT' && item.data?.offers) {
        for (const offer of item.data.offers) {
          offers.push({
            productTitle: item.data.title,
            productId: item.data.id,
            offerId: offer.id,
            offerName: offer.name,
            prices: offer.prices,
          });
        }
      }
    }

    res.json({ success: true, data: { offers } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/checkout', protect, async (req, res) => {
  try {
    const { offerId } = getLavaConfig();

    if (!isLavaConfigured()) {
      return res.status(503).json({
        success: false,
        message:
          'Lava.top бапталмаған. LAVA_API_KEY және LAVA_OFFER_ID қойыңыз (ТӨЛЕМ-ОРНАТУ.md).',
      });
    }

    const orderId = `beka_${req.user._id}_${Date.now()}`;

    await PaymentOrder.create({
      userId: req.user._id,
      orderId,
      amount: parseFloat(process.env.PREMIUM_AMOUNT || '0') || 0,
      currency: getLavaConfig().currency,
      description: 'Beka AI Premium',
      premiumDays: getPremiumDurationDays(),
      status: 'pending',
    });

    const invoice = await createLavaPayment({
      email: req.user.email,
      offerId,
      currency: getLavaConfig().currency,
      userId: String(req.user._id),
    });

    if (invoice.id) {
      await PaymentOrder.updateOne({ orderId }, { lavaContractId: invoice.id });
    }

    if (!invoice.paymentUrl) {
      return res.status(500).json({
        success: false,
        message: 'Lava.top төлем сілтемесін қайтармады',
      });
    }

    res.json({
      success: true,
      data: {
        url: invoice.paymentUrl,
        orderId,
        contractId: invoice.id,
      },
    });
  } catch (error) {
    console.error('Lava checkout error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Төлемді бастау сәтсіз',
    });
  }
});

router.post('/portal', protect, async (req, res) => {
  res.json({
    success: true,
    data: { message: 'Premium ұзарту: /pricing бетінде қайта төлеңіз' },
  });
});

export default router;
