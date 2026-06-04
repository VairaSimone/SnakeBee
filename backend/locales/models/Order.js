import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  kit: { type: mongoose.Schema.Types.ObjectId, ref: 'Kit', required: true },
  name: { type: String, required: true },        // snapshot nome
  unitPrice: { type: Number, required: true },   // snapshot prezzo al momento ordine
  quantity: { type: Number, required: true, min: 1 },
});

const shippingAddressSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  postalCode: { type: String, required: true },
  province: { type: String, required: true },
  country: { type: String, default: 'IT' },
}, { _id: false });

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true }, // es. SB-20240001
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    guestEmail: { type: String, default: null },  // per acquisti guest
    items: [orderItemSchema],
    subtotal: { type: Number, required: true },   
    shippingCost: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true },
    vatRate: { type: Number, default: 22 },
    status: {
      type: String,
      enum: ['PENDING', 'PAID', 'SHIPPED', 'CANCELLED'],
      default: 'PENDING',
    },
    shippingAddress: { type: shippingAddressSchema, required: true },
    trackingCode: { type: String, default: null },
    notes: { type: String, default: null },
    // Stripe references
    stripeSessionId: { type: String, unique: true, sparse: true },
    stripePaymentIntentId: { type: String, unique: true, sparse: true },
    // Rimborso
    refundedAt: { type: Date, default: null },
    refundReason: { type: String, default: null },
  },
  { timestamps: true, collection: 'Order' }
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ stripeSessionId: 1 }, { sparse: true });

// Auto-genera orderNumber prima del salvataggio
orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `SB-${year}${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
export default Order;