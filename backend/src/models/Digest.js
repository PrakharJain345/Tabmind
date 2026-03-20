const mongoose = require('mongoose');

const digestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    weekOf: {
      type: Date,
      required: true,
    },
    stats: {
      totalOpened: { type: Number, default: 0 },
      totalFulfilled: { type: Number, default: 0 },
      totalAbandoned: { type: Number, default: 0 },
      fulfillmentRate: { type: Number, default: 0 },
      topCategories: [
        {
          name: String,
          count: Number,
        },
      ],
      peakHour: { type: Number, min: 0, max: 23 },
      longestSession: {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Session',
        },
        duration: Number,
      },
    },
    personalityCard: {
      type: { type: String },
      description: String,
      shareImageUrl: String,
    },
    sentAt: Date,
  },
  { timestamps: true }
);

const Digest = mongoose.model('Digest', digestSchema);
module.exports = Digest;
