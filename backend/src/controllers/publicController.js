const Note = require('../models/Note');

const getSharedNote = async (req, res, next) => {
  try {
    const note = await Note.findOne({ shareId: req.params.shareId, isPublic: true })
      .select('title content tags category summary actionItems suggestedTitle updatedAt createdAt')
      .populate('createdBy', 'name');

    if (!note) return res.status(404).json({ message: 'Shared note not found' });
    res.json(note);
  } catch (error) {
    next(error);
  }
};

module.exports = { getSharedNote };
