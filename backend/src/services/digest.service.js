const Groq = require('groq-sdk');
const Tab = require('../models/Tab');
const Digest = require('../models/Digest');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Generate a weekly digest for a user.
 * @param {string|ObjectId} userId
 * @returns {object} saved Digest document
 */
async function generateDigest(userId) {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // Fetch all tabs from last 7 days
  const tabs = await Tab.find({
    userId,
    createdAt: { $gte: sevenDaysAgo },
  });

  const totalOpened = tabs.length;
  const totalFulfilled = tabs.filter((t) => t.status === 'done').length;
  const totalAbandoned = tabs.filter((t) => t.status === 'abandoned').length;
  const fulfillmentRate =
    totalOpened > 0 ? Math.round((totalFulfilled / totalOpened) * 100) : 0;

  // Top categories
  const categoryMap = {};
  tabs.forEach((t) => {
    if (t.category) {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + 1;
    }
  });
  const topCategories = Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, count]) => ({ name, count }));

  // Peak hour
  const hourMap = {};
  tabs.forEach((t) => {
    if (t.timing?.openedAt) {
      const hour = new Date(t.timing.openedAt).getHours();
      hourMap[hour] = (hourMap[hour] || 0) + 1;
    }
  });
  const peakHour =
    Object.keys(hourMap).length > 0
      ? Number(Object.entries(hourMap).sort((a, b) => b[1] - a[1])[0][0])
      : null;

  // Groq: Generate personality type
  const topCategory = topCategories[0]?.name || 'general';
  let personalityType = 'Tab Explorer';
  try {
    const prompt = `A user opened ${totalOpened} tabs last week, fulfilled ${totalFulfilled}, abandoned ${totalAbandoned}. Top category: ${topCategory}. Peak distraction hour: ${peakHour ?? 'unknown'}:00. In 2-3 words, give them a funny but accurate tab personality type. Examples: Tab Hoarder, Focused Finisher, Research Rabbit, Midnight Doomscroller, Chronic Opener. Reply with ONLY the personality type.`;

    const response = await groq.chat.completions.create({
      model: 'llama3-8b-8192',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 15,
      temperature: 0.7,
    });

    const raw = response.choices[0]?.message?.content?.trim();
    if (raw) personalityType = raw;
  } catch (err) {
    console.error('Groq personality generation failed:', err.message);
  }

  // Monday of this week
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
  monday.setHours(0, 0, 0, 0);

  // Save digest
  const digest = await Digest.create({
    userId,
    weekOf: monday,
    stats: {
      totalOpened,
      totalFulfilled,
      totalAbandoned,
      fulfillmentRate,
      topCategories,
      peakHour,
    },
    personalityCard: {
      type: personalityType,
      description: `You opened ${totalOpened} tabs, fulfilled ${totalFulfilled}, and abandoned ${totalAbandoned} last week.`,
    },
    sentAt: new Date(),
  });

  return digest;
}

module.exports = { generateDigest };
