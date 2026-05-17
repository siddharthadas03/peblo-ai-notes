const Note = require('../models/Note');
const { generateNoteInsights } = require('../services/geminiService');

const buildNoteQuery = (userId, query) => {
  const filter = { createdBy: userId };

  if (query.archived === 'true') filter.archived = true;
  if (query.archived === 'false') filter.archived = false;
  if (query.tag) filter.tags = query.tag;
  if (query.category) filter.category = query.category;
  if (query.search) {
    const regex = new RegExp(query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ title: regex }, { content: regex }, { tags: regex }, { category: regex }];
  }

  return filter;
};

const getNotes = async (req, res, next) => {
  try {
    const sort = req.query.sort === 'oldest' ? { updatedAt: 1 } : { updatedAt: -1 };
    const notes = await Note.find(buildNoteQuery(req.user._id, req.query)).sort(sort);
    res.json(notes);
  } catch (error) {
    next(error);
  }
};

const createNote = async (req, res, next) => {
  try {
    const note = await Note.create({
      title: req.body.title || 'Untitled note',
      content: req.body.content || '',
      tags: req.body.tags || [],
      category: req.body.category || 'General',
      createdBy: req.user._id
    });
    res.status(201).json(note);
  } catch (error) {
    next(error);
  }
};

const getNote = async (req, res, next) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, createdBy: req.user._id });
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json(note);
  } catch (error) {
    next(error);
  }
};

const updateNote = async (req, res, next) => {
  try {
    const allowed = ['title', 'content', 'tags', 'category', 'archived'];
    const update = {};
    allowed.forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(req.body, key)) update[key] = req.body[key];
    });

    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      update,
      { new: true, runValidators: true }
    );

    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json(note);
  } catch (error) {
    next(error);
  }
};

const deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json({ message: 'Note deleted' });
  } catch (error) {
    next(error);
  }
};

const toggleShare = async (req, res, next) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, createdBy: req.user._id });
    if (!note) return res.status(404).json({ message: 'Note not found' });

    note.isPublic = Boolean(req.body.isPublic);
    if (note.isPublic) note.ensureShareId();
    await note.save();

    res.json(note);
  } catch (error) {
    next(error);
  }
};

const generateSummary = async (req, res, next) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, createdBy: req.user._id });
    if (!note) return res.status(404).json({ message: 'Note not found' });

    const insights = await generateNoteInsights({ title: note.title, content: note.content });
    note.summary = insights.summary;
    note.actionItems = insights.actionItems;
    note.suggestedTitle = insights.suggestedTitle;
    note.aiUsageCount += 1;
    await note.save();

    res.json(note);
  } catch (error) {
    next(error);
  }
};

const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const [totalNotes, archivedNotes, recentNotes, tagAgg, weeklyAgg, aiAgg] = await Promise.all([
      Note.countDocuments({ createdBy: userId }),
      Note.countDocuments({ createdBy: userId, archived: true }),
      Note.find({ createdBy: userId }).sort({ updatedAt: -1 }).limit(5).select('title updatedAt category archived'),
      Note.aggregate([
        { $match: { createdBy: userId } },
        { $unwind: '$tags' },
        { $group: { _id: '$tags', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 }
      ]),
      Note.aggregate([
        { $match: { createdBy: userId, updatedAt: { $gte: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$updatedAt' } }, notes: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      Note.aggregate([
        { $match: { createdBy: userId } },
        { $group: { _id: null, count: { $sum: '$aiUsageCount' } } }
      ])
    ]);

    res.json({
      totalNotes,
      archivedNotes,
      recentNotes,
      mostUsedTags: tagAgg.map((tag) => ({ tag: tag._id, count: tag.count })),
      aiUsageCount: aiAgg[0]?.count || 0,
      weeklyActivity: weeklyAgg.map((item) => ({ date: item._id, notes: item.notes }))
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotes,
  createNote,
  getNote,
  updateNote,
  deleteNote,
  toggleShare,
  generateSummary,
  getDashboard
};
