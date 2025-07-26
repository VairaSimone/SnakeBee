import mongoose, { Schema } from 'mongoose';

const forumCategorySchema = new Schema(
    {
        name: { type: String, required: true },
        description: { type: String },
        createdAt: { type: Date, default: Date.now }
    },
    {
        collection: "ForumCategory"
    }
)

const ForumCategory = mongoose.models.ForumCategory || mongoose.model("ForumCategory", forumCategorySchema)
export default ForumCategory