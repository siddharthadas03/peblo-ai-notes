const crypto = require('crypto');
const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      default: 'Untitled note'
    },
    content: {
      type: String,
      default: ''
    },
    tags: {
      type: [String],
      default: []
    },
    category: {
      type: String,
      trim: true,
      default: 'General'
    },
    archived: {
      type: Boolean,
      default: false
    },
    isPublic: {
      type: Boolean,
      default: false
    },
    shareId: {
      type: String,
      unique: true,
      sparse: true
    },
    summary: {
      type: String,
      default: ''
    },
    actionItems: {
      type: [String],
      default: []
    },
    suggestedTitle: {
      type: String,
      default: ''
    },
    aiUsageCount: {
      type: Number,
      default: 0
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    }
  },
  { timestamps: true }
);

noteSchema.index({ title: 'text', content: 'text', tags: 'text', category: 'text' });

noteSchema.methods.ensureShareId = function ensureShareId() {
  if (!this.shareId) {
    this.shareId = crypto.randomBytes(12).toString('hex');
  }
};

module.exports = mongoose.model('Note', noteSchema);
