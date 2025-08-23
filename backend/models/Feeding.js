import mongoose, { Schema } from 'mongoose';

const feedingSchema = new Schema(
    {
        reptile: { type: mongoose.Schema.Types.ObjectId, ref: 'Reptile', required: true },
        date: { type: Date, required: true },
        foodType: { type: String, required: true },
        quantity: { type: Number },
        weightPerUnit: { type: Number, required: true },  
        nextFeedingDate: { type: Date, required: function () { return this.wasEaten === true; } },
        notes: { type: String },
        wasEaten: { type: Boolean, default: true },
        retryAfterDays: { type: Number },
    },
    {
        collection: "Feeding"
    }
)

const Feeding = mongoose.models.Feeding || mongoose.model("Feeding", feedingSchema)
export default Feeding
