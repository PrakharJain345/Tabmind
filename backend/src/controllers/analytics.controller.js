const Tab = require('../models/Tab');

/**
 * Get lifetime analytics overview for the user.
 * GET /api/analytics/overview
 */
const getOverview = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Basic counts (total, fulfilled, abandoned)
    const stats = await Tab.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalOpened: { $sum: 1 },
          totalFulfilled: {
            $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] },
          },
          totalAbandoned: {
            $sum: { $cond: [{ $eq: ['$status', 'abandoned'] }, 1, 0] },
          },
        },
      },
    ]);

    const result = stats[0] || {
      totalOpened: 0,
      totalFulfilled: 0,
      totalAbandoned: 0,
    };

    const fulfillmentRate = result.totalOpened > 0
      ? Math.round((result.totalFulfilled / result.totalOpened) * 100)
      : 0;

    // 2. Top Domains (exclude empty domains)
    const topDomains = await Tab.aggregate([
      { $match: { userId, domain: { $ne: '' } } },
      { $group: { _id: '$domain', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $project: { _id: 0, domain: '$_id', count: 1 } },
    ]);

    // 3. Category Breakdown (exclude empty categories if any)
    const categoryBreakdown = await Tab.aggregate([
      { $match: { userId, category: { $ne: '' }, category: { $exists: true } } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { _id: 0, category: '$_id', count: 1 } },
    ]);

    // 4. Current Streak Logic
    // For simplicity, we define a streak as consecutive days where (fulfilled / opened) > 50%
    // To do this accurately, we group by day (YYYY-MM-DD):
    const dailyStats = await Tab.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$timing.openedAt' },
          },
          opened: { $sum: 1 },
          fulfilled: {
            $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] },
          },
        },
      },
      { $sort: { _id: -1 } }, // sort by date desc
    ]);

    let currentStreak = 0;
    // Walk backward from the most recent day
    for (const day of dailyStats) {
      if (day.opened > 0 && day.fulfilled / day.opened > 0.5) {
        currentStreak++;
      } else {
        break; // Streak broken
      }
    }

    res.status(200).json({
      totalOpened: result.totalOpened,
      totalFulfilled: result.totalFulfilled,
      totalAbandoned: result.totalAbandoned,
      fulfillmentRate,
      currentStreak,
      topDomains,
      categoryBreakdown,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching analytics overview', error: error.message });
  }
};

/**
 * Get time-based usage patterns.
/**
 * Get time-based usage patterns.
 * GET /api/analytics/patterns
 */
const getPatterns = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Trend Data (Last 30 Days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const trendAggregation = await Tab.aggregate([
      { $match: { userId, 'timing.openedAt': { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timing.openedAt' } },
          tabsOpened: { $sum: 1 },
          tabsFulfilled: { $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Fill missing days
    const trendData = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const match = trendAggregation.find(x => x._id === dateStr);
      trendData.push({
        date: dateStr,
        tabsOpened: match ? match.tabsOpened : 0,
        tabsFulfilled: match ? match.tabsFulfilled : 0,
      });
    }

    // 2. Heatmap Data (24 hours x 7 days)
    // Build initial grid 7 days (rows) x 24 hours (cols)
    // Day 0=Sunday, 6=Saturday
    const heatmapData = Array.from({ length: 7 }, (_, dayIndex) => ({
      day: dayIndex, // 0-6
      hours: Array.from({ length: 24 }, (_, hour) => ({ hour, count: 0 }))
    }));

    const heatmapAggregation = await Tab.aggregate([
      { $match: { userId, 'timing.openedAt': { $exists: true } } },
      {
        $project: {
          dayOfWeek: { $subtract: [{ $dayOfWeek: '$timing.openedAt' }, 1] }, // $dayOfWeek is 1-7 (Sun-Sat). Make it 0-6.
          hour: { $hour: '$timing.openedAt' }
        }
      },
      {
        $group: {
          _id: { day: '$dayOfWeek', hour: '$hour' },
          count: { $sum: 1 }
        }
      }
    ]);

    heatmapAggregation.forEach(entry => {
      const { day, hour } = entry._id;
      if (day >= 0 && day <= 6 && hour >= 0 && hour <= 23) {
        heatmapData[day].hours[hour].count = entry.count;
      }
    });

    res.status(200).json({
      trendData,
      heatmapData
    });

  } catch (error) {
    res.status(500).json({ message: 'Error fetching analytics patterns', error: error.message });
  }
};

module.exports = {
  getOverview,
  getPatterns,
};
