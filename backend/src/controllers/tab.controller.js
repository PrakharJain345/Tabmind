const Tab = require('../models/Tab');
const { emitToUser } = require('../utils/socket');

/**
 * Creates a new tab.
 * Extract domain automatically from URL.
 * POST /api/tabs
 */
const createTab = async (req, res) => {
  try {
    const { url, title, favicon, intent, sessionId, category } = req.body;

    const intentObj = typeof intent === 'string' 
      ? { text: intent, source: intent ? 'user' : 'pending' } 
      : (intent || undefined);

    const newTab = new Tab({
      userId: req.user._id,
      url,
      title,
      favicon,
      intent: intentObj,
      sessionId,
      category,
    });

    let domain = null;
    try {
      if (url) {
        domain = new URL(url).hostname;
      }
    } catch (e) {
      // Ignore invalid URLs
    }

    if (domain) {
      newTab.domain = domain;
    }

    const savedTab = await newTab.save();

    // Emit real-time event
    emitToUser(req.user._id, 'tab:created', savedTab);

    res.status(201).json(savedTab);
  } catch (error) {
    res.status(500).json({ message: 'Error creating tab', error: error.message });
  }
};

/**
 * Updates a tab (intent, status, timing, metadata).
 * PATCH /api/tabs/:id
 */
const updateTab = async (req, res) => {
  try {
    const tabId = req.params.id;
    const body = req.body;

    const tab = await Tab.findOne({ _id: tabId, userId: req.user._id });
    if (!tab) {
      return res.status(404).json({ message: 'Tab not found' });
    }

    // Direct string fields
    ['title', 'url', 'domain', 'favicon', 'fulfillmentNote'].forEach(key => {
      if (body[key] !== undefined) tab[key] = body[key];
    });

    // Nested timing fields (extension sends flat keys 'timing.activeSeconds')
    if (!tab.timing) tab.timing = {};
    if (body['timing.activeSeconds'] !== undefined) tab.timing.activeMs = body['timing.activeSeconds'] * 1000;
    if (body['timing.closedAt'] !== undefined) tab.timing.closedAt = body['timing.closedAt'];

    if (body.status) {
      tab.status = body.status;
      if (body.status === 'done' || body.status === 'abandoned') {
        if (!tab.timing.closedAt) {
          tab.timing.closedAt = Date.now();
        }
      } else if (body.status === 'open' || body.status === 'saved') {
        tab.timing.closedAt = null;
      }
    }

    if (body.intent !== undefined) {
      if (typeof body.intent === 'string') {
        tab.intent.text = body.intent;
        tab.intent.source = 'user';
        tab.intent.confirmedAt = Date.now();
      } else {
        tab.intent = body.intent;
      }
    }

    const updatedTab = await tab.save();

    // Emit real-time events
    emitToUser(req.user._id, 'tab:updated', updatedTab);

    // If status changed, signal dashboard to re-fetch analytics
    if (body.status) {
      emitToUser(req.user._id, 'stats:updated', { trigger: 'tab:status_change' });
    }

    res.status(200).json(updatedTab);
  } catch (error) {
    res.status(500).json({ message: 'Error updating tab', error: error.message });
  }
};

/**
 * List all tabs with optional filters.
 * GET /api/tabs?status=...&domain=...&from=...&to=...
 */
const getTabs = async (req, res) => {
  try {
    const { status, domain, from, to } = req.query;
    const query = { userId: req.user._id };

    if (status) query.status = status;
    if (domain) query.domain = domain;

    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }

    const tabs = await Tab.find(query).sort({ createdAt: -1 });
    res.status(200).json(tabs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tabs', error: error.message });
  }
};

/**
 * Return tabs where status is 'done', 'saved', or 'abandoned'.
 * GET /api/tabs/graveyard
 */
const getGraveyardTabs = async (req, res) => {
  try {
    const tabs = await Tab.find({
      userId: req.user._id,
      status: { $in: ['done', 'saved', 'abandoned'] },
    }).sort({ 'timing.closedAt': -1, createdAt: -1 });

    res.status(200).json(tabs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching graveyard tabs', error: error.message });
  }
};

/**
 * Return tabs where status is 'open'.
 * GET /api/tabs/open
 */
const getOpenTabs = async (req, res) => {
  try {
    const tabs = await Tab.find({
      userId: req.user._id,
      status: 'open',
    }).sort({ 'timing.openedAt': -1, createdAt: -1 });

    res.status(200).json(tabs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching open tabs', error: error.message });
  }
};

/**
 * Delete a single tab.
 * DELETE /api/tabs/:id
 */
const deleteTab = async (req, res) => {
  try {
    const tab = await Tab.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!tab) {
      return res.status(404).json({ message: 'Tab not found' });
    }

    // Emit real-time event
    emitToUser(req.user._id, 'tab:deleted', { tabId: req.params.id });

    res.status(200).json({ message: 'Tab deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting tab', error: error.message });
  }
};

/**
 * Delete all tabs where status is 'done', 'saved', or 'abandoned'.
 * DELETE /api/tabs/graveyard
 */
const deleteGraveyardTabs = async (req, res) => {
  try {
    const result = await Tab.deleteMany({
      userId: req.user._id,
      status: { $in: ['done', 'saved', 'abandoned'] },
    });

    // Signal dashboard to re-fetch stats
    emitToUser(req.user._id, 'stats:updated', { trigger: 'graveyard:cleared' });

    res.status(200).json({ 
      message: 'Graveyard cleared successfully', 
      count: result.deletedCount 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error clearing graveyard', error: error.message });
  }
};

module.exports = {
  createTab,
  updateTab,
  getTabs,
  getGraveyardTabs,
  getOpenTabs,
  deleteTab,
  deleteGraveyardTabs,
};
