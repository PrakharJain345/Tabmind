const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const { updatePreferences, deleteUser } = require('../controllers/user.controller');

const router = express.Router();

router.use(protect);

router.patch('/preferences', updatePreferences);
router.delete('/', deleteUser);

module.exports = router;
