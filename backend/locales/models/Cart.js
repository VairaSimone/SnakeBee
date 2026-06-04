import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  kit: { type: mongoose.Schema.Types.ObjectId, ref: 'Kit', required: true },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  priceSnapshot: { type: Number, required: true }, // Prezzo al momento dell'aggiunta
});

const cartSchema = new mongoose.Schema(
  {
    // Per utenti loggati
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    // Per guest – generato lato server e inviato come cookie
    sessionId: { type: String, default: null },
    items: [cartItemSchema],
    // TTL: carrello guest scade dopo 7 giorni, utente loggato dopo 30
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  },
  { timestamps: true, collection: 'Cart' }
);

// Indici per lookup rapidi
cartSchema.index({ user: 1 }, { sparse: true });
cartSchema.index({ sessionId: 1 }, { sparse: true });
// TTL index – MongoDB elimina automaticamente i carrelli scaduti
cartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Cart = mongoose.models.Cart || mongoose.model('Cart', cartSchema);
export default Cart;