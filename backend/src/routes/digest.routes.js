const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const { getLatestDigest, getDigestHistory } = require('../controllers/digest.controller');

const router = express.Router();

router.use(protect);

router.get('/latest', getLatestDigest);
router.get('/history', getDigestHistory);

module.exports = router;
