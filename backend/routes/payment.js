import express from 'express';
import User from '../models/User.js';
import PaymentOrder from '../models/PaymentOrder.js';
import { protect } from '../middleware/auth.js';
import { PLANS, PLAN_ORDER, getOfferIdForPlan } from '../config/subscription.js';
import { formatSubscriptionForClient } from '../utils/subscription.js';
import {
  isLavaConfigured,
  getLavaConfig,
  createLavaPayment,
  getProducts,
  verifyWebhookApiKey,
  formatLavaError,
} from '../services/lavatop.js';

const router = express.Router();

const activatePlan = async (user, planId, days) => {
  const until = new Date();
  until.setDate(until.getDate() + days);

  if (user.premiumUntil && new Date(user.premiumUntil) > new Date()) {
    until.setTime(new Date(user.premiumUntil).getTime());
    until.setDate(until.getDate() + days);
  }

  user.subscriptionPlan = planId === 'premium' ? 'pro' : planId;
  user.subscriptionStatus = 'active';
  user.premiumUntil = until;
  await user.save();
};

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
      const email = data.buyer?.email?.toLowerCase();
      const contractId = data.contractId;

      if (!email) {
        return res.status(200).json({ ok: true });
      }

      const user = await User.findOne({ email });
      if (user) {
        let order = null;
        if (contractId) {
          order = await PaymentOrder.findOne({ lavaContractId: contractId });
        }
        if (!order) {
          order = await PaymentOrder.findOne({
            userId: user._id,
            status: 'pending',
          }).sort({ createdAt: -1 });
        }

        const planId = order?.planTier || 'basic';
        const days = order?.premiumDays || PLANS[planId]?.durationDays || 30;
        await activatePlan(user, planId, days);

        if (order) {
          order.status = 'paid';
          if (contractId) order.lavaContractId = contractId;
          await order.save();
        }

        console.log(`Plan ${planId} via Lava: ${user.email}`);
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
      plans: PLAN_ORDER.map((id) => PLANS[id]),
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
    const planId = req.body?.planId || 'basic';

    if (!['basic', 'pro'].includes(planId)) {
      return res.status(400).json({
        success: false,
        message: 'Тек Бастау (basic) немесе Про (pro) жоспарын таңдауға болады',
      });
    }

    const offerId = getOfferIdForPlan(planId);
    if (!offerId) {
      return res.status(503).json({
        success: false,
        message: `LAVA_OFFER_ID_${planId.toUpperCase()} орнатылмаған`,
      });
    }

    if (!isLavaConfigured()) {
      return res.status(503).json({
        success: false,
        message: 'Lava.top бапталмаған (ТӨЛЕМ-ОРНАТУ.md)',
      });
    }

    const plan = PLANS[planId];
    const orderId = `beka_${req.user._id}_${Date.now()}`;

    await PaymentOrder.create({
      userId: req.user._id,
      orderId,
      amount: plan.price,
      currency: getLavaConfig().currency,
      description: `Beka AI ${plan.name}`,
      planTier: planId,
      premiumDays: plan.durationDays || 30,
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
        planId,
        contractId: invoice.id,
      },
    });
  } catch (error) {
    console.error('Lava checkout error:', error.message, 'user:', req.user?.email);
    res.status(400).json({
      success: false,
      message: formatLavaError(error.message) || 'Төлемді бастау сәтсіз',
    });
  }
});

router.post('/portal', protect, async (req, res) => {
  res.json({
    success: true,
    data: { message: 'Жоспарды өзгерту: /pricing' },
  });
});

export default router;
