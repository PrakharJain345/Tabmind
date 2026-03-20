const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    nameSource: {
      type: String,
      enum: ['user', 'ai'],
      default: 'user',
    },
    tabs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tab',
      },
    ],
    startedAt: {
      type: Date,
      default: Date.now,
    },
    endedAt: Date,
    totalDuration: Number,
    fulfillmentRate: {
      type: Number,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ['active', 'saved', 'archived'],
      default: 'active',
    },
    shareToken: {
      type: String,
    },
  },
  { timestamps: true }
);

const Session = mongoose.model('Session', sessionSchema);
module.exports = Session;
