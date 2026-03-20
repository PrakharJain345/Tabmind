const express = require('express');
const passport = require('passport');
const { generateToken } = require('../utils/jwt');
const { getMe } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// @route   GET /api/auth/google
// @desc    Redirect to Google OAuth consent screen
// @access  Public
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

// @route   GET /api/auth/google/callback
// @desc    Google OAuth callback — generates JWT and redirects to dashboard
// @access  Public
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/api/auth/failure' }),
  (req, res) => {
    const token = generateToken(req.user._id);
    // Redirect to dashboard with token in query string
    const dashboardUrl = process.env.DASHBOARD_URL || 'http://localhost:3000';
    res.redirect(`${dashboardUrl}/auth/callback?token=${token}`);
  }
);

// @route   GET /api/auth/me
// @desc    Return current authenticated user profile
// @access  Private (JWT required)
router.get('/me', protect, getMe);

// @route   GET /api/auth/failure
// @desc    OAuth failure fallback
// @access  Public
router.get('/failure', (req, res) => {
  res.status(401).json({ message: 'Google OAuth failed' });
});

module.exports = router;
