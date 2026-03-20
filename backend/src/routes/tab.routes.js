const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const {
  createTab,
  updateTab,
  getTabs,
  getGraveyardTabs,
  getOpenTabs,
  deleteTab,
  deleteGraveyardTabs,
} = require('../controllers/tab.controller');
const { suggestIntent } = require('../services/ai.service');

const router = express.Router();

// Apply protect middleware to all tab routes
router.use(protect);

router.post('/', createTab);
router.get('/graveyard', getGraveyardTabs);
router.delete('/graveyard', deleteGraveyardTabs);
router.get('/open', getOpenTabs);
router.get('/', getTabs);

// NOTE: ai-intent MUST be declared BEFORE /:id so Express doesn't
// treat the literal string 'ai-intent' as a tab ObjectId param.
router.post('/ai-intent', async (req, res) => {
  const { url, title, metaDescription } = req.body;
  if (!url && !title) {
    return res.status(400).json({ message: 'url or title is required' });
  }
  const suggestion = await suggestIntent({ url, title, metaDescription });
  res.status(200).json({ suggestion });
});

router.patch('/:id', updateTab);
router.delete('/:id', deleteTab);

module.exports = router;

