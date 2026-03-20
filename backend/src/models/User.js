const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    preferences: {
      autoPopup: { type: Boolean, default: true },
      popupDelay: { type: Number, default: 0 },
      aiSuggestions: { type: Boolean, default: true },
      focusModeActive: { type: Boolean, default: false },
      weeklyDigestEnabled: { type: Boolean, default: true },
    },
    stats: {
      totalTabsOpened: { type: Number, default: 0 },
      totalFulfilled: { type: Number, default: 0 },
      totalAbandoned: { type: Number, default: 0 },
      currentStreak: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);
module.exports = User;
