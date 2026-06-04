import mongoose, { Schema } from 'mongoose';

const breedingEventSchema = new Schema({
  type: {
    type: String,
    enum: ['Mating', 'Ovulation', 'Prelay Shed', 'Egg Laid', 'Birth', 'Hatching', 'Failed'],
    required: true
  },
  date: { type: Date, required: true },
  notes: { type: String },
});

const breedingSchema = new Schema({
  male: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reptile',
    required: true
  },
  female: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reptile',
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  species: {
    type: String,
    required: true
  },
  morphCombo: {
    type: String 
  },
  isLiveBirth: {
    type: Boolean,
    default: false
  },
  clutchSize: {
    total: { type: Number },
    fertile: { type: Number },
    hatchedOrBorn: { type: Number }
  },
  outcome: {
    type: String,
    enum: ['Success', 'Partial', 'Failed', 'Unknown'],
    default: 'Unknown'
  },
  events: [breedingEventSchema],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  collection: "Breeding",
  timestamps: true
});

const Breeding = mongoose.models.Breeding || mongoose.model('Breeding', breedingSchema);
export default Breeding;
