const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const {
  createSession,
  updateSession,
  getSessions,
  getSessionDetails,
} = require('../controllers/session.controller');

const router = express.Router();

// Apply protect middleware to all session routes
router.use(protect);

router.post('/', createSession);
router.get('/', getSessions);
router.get('/:id', getSessionDetails);
router.patch('/:id', updateSession);

module.exports = router;
