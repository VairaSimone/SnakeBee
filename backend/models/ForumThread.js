import mongoose, { Schema } from 'mongoose';

const forumThreadSchema = new Schema(
    {
        title: { type: String, required: true },
        content: { type: String, required: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        category: { type: mongoose.Schema.Types.ObjectId, ref: 'ForumCategory', required: true },
        createdAt: { type: Date, default: Date.now },
        imageUrl: {type: String},
        subscriptions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], 
        posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ForumPost' }]
    },
    {
        collection: "ForumThread"
    }
)

const ForumThread = mongoose.models.ForumThread || mongoose.model("ForumThread", forumThreadSchema)
export default ForumThread