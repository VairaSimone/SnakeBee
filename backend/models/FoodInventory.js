// models/FoodInventory.js
import mongoose, { Schema } from 'mongoose';

const foodInventorySchema = new Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    foodType: {
      type: String,
      enum: ['Topo', 'Ratto', 'Coniglio', 'Pulcino', 'Altro'],
      required: true,
    },
    quantity: { type: Number, required: true },
    weightPerUnit: { type: Number }, // es: 30g
  },
  {
    collection: 'FoodInventory',
    timestamps: true,
  }
);

const FoodInventory = mongoose.models.FoodInventory || mongoose.model('FoodInventory', foodInventorySchema);
export default FoodInventory;
