const express = require('express');
const {
  getNotes,
  createNote,
  getNote,
  updateNote,
  deleteNote,
  toggleShare,
  generateSummary,
  getDashboard
} = require('../controllers/noteController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/dashboard', getDashboard);
router.route('/').get(getNotes).post(createNote);
router.route('/:id').get(getNote).put(updateNote).delete(deleteNote);
router.patch('/:id/share', toggleShare);
router.post('/:id/ai-summary', generateSummary);

module.exports = router;
