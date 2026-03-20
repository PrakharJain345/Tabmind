const mongoose = require('mongoose');

const TabSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
      default: null
    },
    url: {
      type: String,
      required: true
    },
    domain: {
      type: String,
      default: '',
      index: true
    },
    title: {
      type: String,
      default: ''
    },
    favicon: {
      type: String,
      default: ''
    },
    intent: {
      text: { type: String, default: '' },
      source: {
        type: String,
        enum: ['user', 'ai', 'pending'],
        default: 'pending'
      },
      aiSuggestion: { type: String, default: '' },
      confirmedAt: { type: Date, default: null }
    },
    status: {
      type: String,
      enum: ['open', 'done', 'saved', 'abandoned'],
      default: 'open',
      index: true
    },
    timing: {
      openedAt: { type: Date, default: Date.now },
      closedAt: { type: Date, default: null },
      activeMs: { type: Number, default: 0 },
      timeToIntent: { type: Number, default: 0 }
    },
    category: {
      type: String,
      enum: ['research', 'work', 'entertainment', 'shopping', 'other'],
      default: 'other'
    },
    fulfillmentNote: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Tab', TabSchema);