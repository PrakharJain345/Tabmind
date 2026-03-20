const User = require('../models/User');
const Tab = require('../models/Tab');
const Session = require('../models/Session');
const Digest = require('../models/Digest');

/**
 * Update user preferences.
 * PATCH /api/user/preferences
 */
const updatePreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Merge preferences
    user.preferences = {
      ...user.preferences,
      ...req.body
    };

    await user.save();
    res.status(200).json(user.preferences);
  } catch (error) {
    res.status(500).json({ message: 'Error updating preferences', error: error.message });
  }
};

/**
 * Delete user account and all associated data.
 * DELETE /api/user
 */
const deleteUser = async (req, res) => {
  try {
    const userId = req.user._id;

    // Delete all user related data
    await Tab.deleteMany({ userId });
    await Session.deleteMany({ userId });
    await Digest.deleteMany({ userId });
    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: 'Account and all data deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting account', error: error.message });
  }
};

module.exports = {
  updatePreferences,
  deleteUser
};
