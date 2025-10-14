import mongoose, { Schema } from 'mongoose';
import slugify from 'slugify';

const localizedString = {
    it: { type: String, required: true },
    en: { type: String, required: true },
};

const articleSchema = new Schema(
    {
        title: localizedString,
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            index: true,
        },
        content: localizedString,
        author: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        status: {
            type: String,
            enum: ['draft', 'published', 'scheduled'],
            default: 'draft',
        },
        publishedAt: {
            type: Date,
            default: null, 
        },
        tags: [{ type: String, trim: true, lowercase: true }],
        categories: [{ type: String, trim: true, lowercase: true }],
        views: {
            type: Number,
            default: 0,
        },
        meta: {
            title: localizedString,
            description: localizedString,
        },
        ogImage: {
            type: String, 
        },
        reactions: [
            {
                user: {
                    type: Schema.Types.ObjectId,
                    ref: 'User',
                    required: true,
                },
                reaction: {
                    type: String,
                    enum: ['like', 'dislike', 'love', 'fire', 'thumbup'],
                    required: true,
                },
            },
        ],
    },
    {
        timestamps: true, 
        collection: 'articles',
    }
);

articleSchema.pre('validate', async function (next) {
  if (!this.slug || this.isModified('title.it')) {
    const baseSlug = slugify(this.title?.it || this.title?.en || 'articolo', { lower: true, strict: true, locale: 'it' });
    let slug = baseSlug;
    const exists = await mongoose.models.Article.findOne({ slug });
    if (exists) slug = `${baseSlug}-${Date.now().toString(36)}`;
    this.slug = slug;
  }
  next();
});

const Article = mongoose.models.Article || mongoose.model('Article', articleSchema);

export default Article;
