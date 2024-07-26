const mongoose = require('mongoose');

const jobPostSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  Date: { type: String, required: true },
  Shift: { type: String, required: true },
  Location: { type: String, required: true },
  Starttime: { type: String, required: true },
  Endtime: { type: String, required: true },
  JobDescription: { type: String, required: true },
  Payment: { type: String, required: true },
  TemplateName: { type: String },
  isTemplate: { type: Boolean, default: false },
  status: { type: String, enum: ['open', 'assigned', 'upcoming', 'checkedIn', 'completed'], default: 'open' },
  checkedInTime: { type: Date },
  checkedOutTime: { type: Date },
signature: { type: String, required: false, },
  checkoutInput: { type: String }, // Additional input for checkout
}, { timestamps: true });



module.exports = mongoose.model('JobPost', jobPostSchema);

jobPostSchema.index({ Date: 1 }, { unique: false });

const JobPost = mongoose.model('JobPost', jobPostSchema);

module.exports = JobPost;
