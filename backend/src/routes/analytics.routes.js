const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const {
  getOverview,
  getPatterns,
} = require('../controllers/analytics.controller');

const router = express.Router();

router.use(protect);

router.get('/overview', getOverview);
router.get('/patterns', getPatterns);

module.exports = router;
