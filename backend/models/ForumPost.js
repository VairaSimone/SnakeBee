import mongoose, { Schema } from 'mongoose';

const forumPostSchema = new Schema(
    {
        title: { type: String },
        content: { type: String, required: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        category: { type: mongoose.Schema.Types.ObjectId, ref: 'ForumCategory', required: true },
        thread: { type: mongoose.Schema.Types.ObjectId, ref: 'ForumThread', required: true }, // Aggiungi questo campo
        createdAt: { type: Date, default: Date.now },
        likes: { type: Number, default: 0 }, 
        likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],           
        image: {type: String},
        reports: [{ reason: { type: String }, reportedAt: { type: Date, default: Date.now } }],
        posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ForumPost' }]    },
    {
        collection: "ForumPost"
    }
)

const ForumPost = mongoose.models.ForumPost || mongoose.model("ForumPost", forumPostSchema)
export default ForumPost