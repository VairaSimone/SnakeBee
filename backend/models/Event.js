import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  reptile: { type: mongoose.Schema.Types.ObjectId, ref: 'Reptile', required: true },
  type: { type: String, enum: ['shed', 'feces', 'vet', 'weight'], required: true },
  date: { type: Date, required: true },
  notes: { type: String },
  weight: { type: Number },
  cost: {
    amount: { type: Number, min: 0 },
    currency: { type: String, enum: ['EUR', 'USD', 'GBP', 'JPY', 'CHF'], default: 'EUR' },
    description: { type: String } // Es: "Visita controllo + esame feci"
  }
}, {
  timestamps: true
});

const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);
export default Event;
