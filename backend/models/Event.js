import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  reptile: { type: mongoose.Schema.Types.ObjectId, ref: 'Reptile', required: true },
  type: { type: String, enum: ['shed', 'feces', 'vet', 'weight'], required: true },
  date: { type: Date, required: true },
  notes: { type: String },
  weight: { type: Number }
}, {
  timestamps: true
});

const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);
export default Event;
