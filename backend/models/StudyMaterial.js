const mongoose = require('mongoose');

const studyMaterialSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  subjectName: { type: String, required: true },
  fileName: { type: String, required: true },
  fileUrl: { type: String, required: true },
  mimeType: { type: String, required: true },
  size: { type: Number, default: 0 },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

studyMaterialSchema.index({ subjectName: 1, uploadedBy: 1 });

module.exports = mongoose.model('StudyMaterial', studyMaterialSchema);
