const mongoose = require('mongoose');

const adminLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  actorEmail: { type: String, required: true },
  status: { type: String, enum: ['success','partial','error'], default: 'success' },
  targetType: { type: String },
  targetId: { type: String },
  counts: {
    created: { type: Number, default: 0 },
    updated: { type: Number, default: 0 },
    assigned: { type: Number, default: 0 },
    enrolled: { type: Number, default: 0 },
    skipped: { type: Number, default: 0 },
  },
  meta: { type: Object },
}, { timestamps: true });

adminLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AdminLog', adminLogSchema);
