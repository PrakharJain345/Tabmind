const Session = require('../models/Session');
const Tab = require('../models/Tab');

/**
 * Creates a new session.
 * POST /api/sessions
 */
const createSession = async (req, res) => {
  try {
    const { name, nameSource, tabs, startedAt } = req.body;

    const newSession = new Session({
      userId: req.user._id,
      name,
      nameSource,
      tabs: tabs || [],
      startedAt: startedAt || Date.now(),
    });

    const savedSession = await newSession.save();

    // If tabs are provided, ideally we should update those tabs with this sessionId
    if (tabs && tabs.length > 0) {
      await Tab.updateMany(
        { _id: { $in: tabs }, userId: req.user._id, status: 'open' },
        { $set: { sessionId: savedSession._id, status: 'saved' } }
      );
    }

    res.status(201).json(savedSession);
  } catch (error) {
    res.status(500).json({ message: 'Error creating session', error: error.message });
  }
};

/**
 * Updates a session (name or status).
 * PATCH /api/sessions/:id
 */
const updateSession = async (req, res) => {
  try {
    const sessionId = req.params.id;
    const { name, nameSource, status, tabs, endedAt, totalDuration, fulfillmentRate } = req.body;

    const session = await Session.findOne({ _id: sessionId, userId: req.user._id });
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    if (name !== undefined) session.name = name;
    if (nameSource !== undefined) session.nameSource = nameSource;
    if (status !== undefined) session.status = status;
    if (endedAt !== undefined) session.endedAt = endedAt;
    if (totalDuration !== undefined) session.totalDuration = totalDuration;
    if (fulfillmentRate !== undefined) session.fulfillmentRate = fulfillmentRate;

    // Optional: Add/remove tabs from session
    if (tabs) {
       session.tabs = tabs;
       // Also update the tabs
       await Tab.updateMany(
         { sessionId: session._id, userId: req.user._id },
         { $unset: { sessionId: '' } }
       );
       await Tab.updateMany(
         { _id: { $in: tabs }, userId: req.user._id },
         { $set: { sessionId: session._id } }
       );
    }

    const updatedSession = await session.save();
    res.status(200).json(updatedSession);
  } catch (error) {
    res.status(500).json({ message: 'Error updating session', error: error.message });
  }
};

/**
 * List all sessions for user.
 * GET /api/sessions
 */
const getSessions = async (req, res) => {
  try {
    // Populate tabs for count, but we only really need the count or basic info
    // For simplicity, we can populate only a small subset or not populate if UI handles it differently.
    // Given the prompt: "populate tabs count"
    
    // Mongoose populate can't directly give just a count natively in single query easily without aggregation,
    // but since we keep the array of tabs in the session object, `tabs.length` gives the count natively!
    // We will just return the sessions, UI can use session.tabs.length
    
    const sessions = await Session.find({ userId: req.user._id })
      .sort({ startedAt: -1 });

    res.status(200).json(sessions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sessions', error: error.message });
  }
};

/**
 * Get single session with tabs populated.
 * GET /api/sessions/:id
 */
const getSessionDetails = async (req, res) => {
  try {
    const session = await Session.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).populate('tabs');

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    res.status(200).json(session);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching session details', error: error.message });
  }
};

module.exports = {
  createSession,
  updateSession,
  getSessions,
  getSessionDetails,
};
