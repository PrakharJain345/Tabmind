const { protect } = require('../middleware/auth.middleware');
const User = require('../models/User');

/**
 * GET /api/auth/me
 * Returns the authenticated user's profile.
 * req.user is populated by the `protect` middleware.
 */
const getMe = async (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getMe };
