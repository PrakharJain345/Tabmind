const Digest = require('../models/Digest');

/**
 * GET /api/digest/latest
 * Return the most recent digest for the authenticated user.
 */
const getLatestDigest = async (req, res) => {
  try {
    const digest = await Digest.findOne({ userId: req.user._id }).sort({ weekOf: -1 });
    if (!digest) {
      return res.status(404).json({ message: 'No digest found yet. Check back next Monday!' });
    }
    res.status(200).json(digest);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching digest', error: error.message });
  }
};

/**
 * GET /api/digest/history
 * Return all past digests for the authenticated user.
 */
const getDigestHistory = async (req, res) => {
  try {
    const digests = await Digest.find({ userId: req.user._id }).sort({ weekOf: -1 });
    res.status(200).json(digests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching digest history', error: error.message });
  }
};

module.exports = { getLatestDigest, getDigestHistory };
