const cron = require('node-cron');
const User = require('../models/User');
const { generateDigest } = require('../services/digest.service');
const { sendDigestEmail } = require('../services/email.service');

// Every Monday at 9:00am (server local time)
const weeklyDigestJob = cron.schedule(
  '0 9 * * 1',
  async () => {
    console.log('[WeeklyDigest] Job started at', new Date().toISOString());

    try {
      const users = await User.find({ 'preferences.weeklyDigestEnabled': true });
      console.log(`[WeeklyDigest] Processing ${users.length} user(s)...`);

      for (const user of users) {
        try {
          const digest = await generateDigest(user._id);
          await sendDigestEmail(user, digest);
          console.log(`[WeeklyDigest] ✓ Done for ${user.email}`);
        } catch (err) {
          console.error(`[WeeklyDigest] ✗ Failed for ${user.email}:`, err.message);
        }
      }

      console.log('[WeeklyDigest] Job completed.');
    } catch (err) {
      console.error('[WeeklyDigest] Job failed:', err.message);
    }
  },
  { scheduled: false } // started explicitly in index.js
);

module.exports = weeklyDigestJob;
