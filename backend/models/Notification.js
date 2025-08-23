import mongoose, { Schema } from 'mongoose';

const notificationSchema = new Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        reptile: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Reptile' }],
        type: { type: String, enum: ['feeding', 'health', 'new_post', 'billing'], required: true },
        message: { type: String, required: true },
        date: { type: Date, required: true },
        status: { type: String, enum: ['sent', 'pending'], default: 'pending' },
        read: { type: Boolean, default: false },
    },
    {
        collection: "Notification"
    }
)

const Notification = mongoose.models.Notification || mongoose.model("Notification", notificationSchema)
export default Notification