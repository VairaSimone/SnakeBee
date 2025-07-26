import mongoose, { Schema } from 'mongoose';

const hatchlingSchema = new Schema({
  morph:        { type: String },
  weight:       { type: Number },       // in grammi
  sex:          { type: String, enum: ['M', 'F', 'U'], default: 'Unknown' },
  photoUrl:     { type: String },       // link Cloudinary
}, { _id: false });

const eventSchema = new Schema({
  type: {
    type: String,
    enum: ['pairing','ovulation','clutch','incubationStart','incubationEnd','birth'],
    required: true
  },
  date: { type: Date, required: true },
  notes: { type: String }
}, { _id: false });


const breedingSchema = new Schema({
  male:              { type: Schema.Types.ObjectId, ref: 'Reptile', required: true },
  female:            { type: Schema.Types.ObjectId, ref: 'Reptile', required: true },
  user:              { type: Schema.Types.ObjectId, ref: 'User', required: true },
  pairingDate:       { type: Date },
  ovulationDate:     { type: Date },
  clutchDate:        { type: Date },
  incubationStart:   { type: Date },
  incubationEnd:     { type: Date },
  incubationNotes:   { type: String },
  outcome:           { type: String, enum: ['Success', 'Failed', 'Unknown'], default: 'Unknown' },
  hatchlings:        [hatchlingSchema],
  notes:             { type: String },
  seasonYear: { type: Number, required: true, index: true },
  events: [eventSchema],
hatchlings: [hatchlingSchema],
}, {
  collection: 'Breeding',
  timestamps: true
});


eventSchema.path('date').validate(function(value) {
  // recupera l’ultimo evento di tipo precedente
  const prevTypes = {
    'ovulation': 'pairing',
    'clutch': 'ovulation',
    'incubationStart': 'clutch',
    'incubationEnd': 'incubationStart',
    'birth': 'incubationEnd'
  };
  const prev = prevTypes[this.type];
  if (!prev) return true; 
  // cerca evento precedente
  const prevEvt = this.ownerDocument().events.find(e => e.type === prev);
  return prevEvt && value >= prevEvt.date;
}, props => `${props.value.toISOString()} non è coerente con la sequenza eventi`);

export default mongoose.models.Breeding || mongoose.model('Breeding', breedingSchema);
