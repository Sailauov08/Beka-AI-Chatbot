import mongoose from 'mongoose';

const dmMessageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const directConversationSchema = new mongoose.Schema(
  {
    participants: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      validate: {
        validator: (v) => Array.isArray(v) && v.length === 2,
        message: 'Conversation must have exactly 2 participants',
      },
      required: true,
    },
    participantKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    messages: {
      type: [dmMessageSchema],
      default: [],
    },
    lastMessageAt: {
      type: Date,
      default: null,
    },
    lastMessagePreview: {
      type: String,
      default: '',
      maxlength: 200,
    },
  },
  { timestamps: true }
);

directConversationSchema.index({ participants: 1, lastMessageAt: -1 });

export const buildParticipantKey = (userIdA, userIdB) => {
  const ids = [String(userIdA), String(userIdB)].sort();
  return `${ids[0]}:${ids[1]}`;
};

const DirectConversation = mongoose.model('DirectConversation', directConversationSchema);

export default DirectConversation;
