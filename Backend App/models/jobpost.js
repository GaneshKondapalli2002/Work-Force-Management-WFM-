const mongoose = require('mongoose');

// Validator function to check if TemplateName is required
const templateNameValidator = function() {
  if (this.isTemplate && !this.TemplateName) {
    return false;
  }
  return true;
};

const jobPostSchema = new mongoose.Schema({
  Date: { type: Date, required: true },
  Shift: { type: String, required: true },
  Location: { type: String, required: true },
  Starttime: { type: String, required: true },
  Endtime: { type: String, required: true },
  JobDescription: { type: String, required: true },
  Payment: { type: String, required: true },
  TemplateName: { type: String },
  isTemplate: { type: Boolean, default: false },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['open', 'assigned', 'upcoming', 'checkedIn', 'completed'],
    default: 'open',
  },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  checkInTime: { type: Date },
  checkOutTime: { type: Date },
}, { timestamps: true });

// Apply the custom validator
jobPostSchema.path('TemplateName').validate(templateNameValidator, 'Template name is required when saving as a template');
jobPostSchema.index({ Date: 1 }, { unique: false });

const JobPost = mongoose.model('JobPost', jobPostSchema);

module.exports = JobPost;
