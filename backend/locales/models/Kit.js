import mongoose from 'mongoose';

const kitSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 }, // Euro, IVA 22% inclusa
    quantity: { type: Number, required: true, min: 0, default: 0 },
    images: [{ type: String }],
    active: { type: Boolean, default: true },
    includedProducts: [{ type: String }], // Lista prodotti inclusi nel kit
    vatRate: { type: Number, default: 22 },   // IVA italiana
    slug: { type: String, unique: true, sparse: true },
  },
  { timestamps: true, collection: 'Kit' }
);

kitSchema.index({ active: 1 });
kitSchema.index({ name: 'text', description: 'text' });

const Kit = mongoose.models.Kit || mongoose.model('Kit', kitSchema);
export default Kit;