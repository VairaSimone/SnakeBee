import mongoose, { Schema } from 'mongoose';

const failedEmailSchema = new Schema({
  to: { type: String, required: true },
  subject: { type: String },
  text: { type: String },
  html: { type: String },
  error: { type: String },
  retries: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const FailedEmail = mongoose.models.FailedEmail || mongoose.model('FailedEmail', failedEmailSchema);
export default FailedEmail;
