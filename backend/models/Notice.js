const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema({
  filename: String,
  url: String,
  mimetype: String,
  size: Number,
}, { _id: false });

const noticeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  attachments: [attachmentSchema],
  visibleTo: { type: [String], default: ['all'] }, 
  published: { type: Boolean, default: true },
  expiresAt: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

noticeSchema.index({ createdAt: -1 });
noticeSchema.index({ expiresAt: 1 });

module.exports = mongoose.model('Notice', noticeSchema);
