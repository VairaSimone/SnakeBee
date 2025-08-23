import mongoose, { Schema } from "mongoose";

const customEventSchema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  reptiles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Reptile" }], 
  title: { type: String, required: true },
  description: { type: String },
  date: { type: Date, required: true },
  endDate: { type: Date }, 
  color: { type: String, default: "#1E90FF" },
  sendReminder: { type: Boolean, default: false }
}, {
  collection: "CustomEvent",
  timestamps: true
});

const CustomEvent = mongoose.models.CustomEvent || mongoose.model("CustomEvent", customEventSchema);
export default CustomEvent;
