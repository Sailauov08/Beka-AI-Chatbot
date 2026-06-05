import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      sparse: true,
      unique: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      trim: true,
      sparse: true,
      unique: true,
    },
    password: {
      type: String,
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    phoneVerified: {
      type: Boolean,
      default: false,
    },
    oauthProvider: {
      type: String,
      enum: ['google', 'facebook', 'vk', 'apple', null],
      default: null,
    },
    oauthId: {
      type: String,
      default: null,
      sparse: true,
    },
    subscriptionPlan: {
      type: String,
      enum: ['free', 'basic', 'pro', 'premium'],
      default: 'free',
    },
    subscriptionStatus: {
      type: String,
      enum: ['active', 'canceled', 'past_due', 'trialing'],
      default: undefined,
    },
    premiumUntil: {
      type: Date,
      default: null,
    },
    dailyMessageCount: {
      type: Number,
      default: 0,
    },
    dailyMessageDate: {
      type: String,
      default: null,
    },
    avatar: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ oauthProvider: 1, oauthId: 1 }, { sparse: true });

userSchema.pre('validate', function validateContact(next) {
  if (this.oauthProvider && this.oauthId) {
    return next();
  }
  if (!this.email && !this.phone) {
    this.invalidate('email', 'Email немесе телефон қажет');
  }
  next();
});

const User = mongoose.model('User', userSchema);

export default User;
