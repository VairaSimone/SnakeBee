import mongoose, { Schema } from "mongoose";

const newsletterSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email"],
    },
    language: {
      type: String,
      enum: ["it", "en"],
      default: "it",
    },
    acceptedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: "Newsletter", timestamps: true }
);

const Newsletter =
  mongoose.models.Newsletter || mongoose.model("Newsletter", newsletterSchema);
export default Newsletter;
