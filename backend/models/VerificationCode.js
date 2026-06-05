import mongoose from 'mongoose';

const verificationCodeSchema = new mongoose.Schema(
  {
    target: {
      type: String,
      required: true,
      index: true,
    },
    channel: {
      type: String,
      enum: ['email', 'phone'],
      required: true,
    },
    purpose: {
      type: String,
      enum: ['register', 'login'],
      required: true,
    },
    codeHash: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
    attempts: {
      type: Number,
      default: 0,
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  { timestamps: true }
);

verificationCodeSchema.index({ target: 1, purpose: 1 });

const VerificationCode = mongoose.model('VerificationCode', verificationCodeSchema);

export default VerificationCode;
