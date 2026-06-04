import mongoose from 'mongoose';

const paymentOrderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'KZT' },
    description: { type: String, default: 'Beka AI Premium' },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    lavaContractId: { type: String, default: null },
    planTier: {
      type: String,
      enum: ['basic', 'pro'],
      default: 'basic',
    },
    premiumDays: { type: Number, default: 30 },
  },
  { timestamps: true }
);

const PaymentOrder = mongoose.model('PaymentOrder', paymentOrderSchema);

export default PaymentOrder;
