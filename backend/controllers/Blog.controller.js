import Article from '../models/Article.model.js';
import mongoose from 'mongoose';
import User from "../models/User.js";
import { notifyNewsletterAboutArticle, notifyUsersAboutArticle } from '../utils/notifyNewsLetter.js';

// --- Funzioni per Amministratori ---

/**
 * @description Crea un nuovo articolo del blog. Solo per admin.
 * @route POST /api/blog
 */
export const createArticle = async (req, res, next) => {
    console.log("req.body:", req.body);
    console.log("req.user.userid:", req.user.userid);

    try {
        const { title, content, status, publishedAt, tags, categories, meta, ogImage } = req.body;

        if (!title?.it || !title?.en || !content?.it || !content?.en) {
            return res.status(400).json({ errors: ['Titolo e contenuto in tutte le lingue sono obbligatori'] });
        }

        const newArticle = new Article({
            title,
            content,
            author: req.user.userid,
            status,
            publishedAt: status === 'published'
                ? new Date()
                : (status === 'scheduled' && publishedAt ? new Date(publishedAt) : null),
            tags,
            categories,
            meta,
            ogImage,
        });

        console.log("newArticle:", newArticle);

        await newArticle.save();
        if (newArticle.status === 'published') {
            notifyNewsletterAboutArticle(newArticle);
        }
        if (newArticle.status === 'published') {
            await notifyUsersAboutArticle(newArticle);
        }
        res.status(201).json(newArticle);
    } catch (error) {
        console.error("Errore createArticle:", error);
        if (error.code === 11000) {
            error.status = 409;
            error.messages = ['Slug già esistente'];
        }
        next(error);
    }
};

/**
 * @description Aggiorna un articolo esistente. Solo per admin.
 * @route PUT /api/blog/:id
 */
export const updateArticle = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        if (updates.status === 'published' && !updates.publishedAt) {
            updates.publishedAt = new Date();
        }

        const updatedArticle = await Article.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

        if (!updatedArticle) {
            return res.status(404).json({ message: req.t('blog_not_found') });
        }
        res.status(200).json(updatedArticle);
    } catch (error) {
        if (error.code === 11000) {
            error.status = 409;
            error.messages = [req.t('blog_slug_conflict')];
        }
        next(error);
    }
};

/**
 * @description Elimina un articolo. Solo per admin.
 * @route DELETE /api/blog/:id
 */
export const deleteArticle = async (req, res, next) => {
    try {
        const { id } = req.params;
        const deletedArticle = await Article.findByIdAndDelete(id);
        if (!deletedArticle) {
            return res.status(404).json({ message: req.t('blog_not_found') });
        }
        res.status(204).send(); // No content
    } catch (error) {
        next(error);
    }
};

/**
 * @description Ottiene tutti gli articoli per il pannello admin (inclusi bozze e programmati).
 * @route GET /api/blog/admin
 */
export const getAdminArticles = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, status, category, tag } = req.query;
        const query = {};
        if (status) query.status = status;
        if (category) query.categories = category;
        if (tag) query.tags = tag;

        const articles = await Article.find(query)
            .populate('author', 'name avatar')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await Article.countDocuments(query);

        res.status(200).json({
            articles,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        });
    } catch (error) {
        next(error);
    }
}


// --- Funzioni Pubbliche ---

/**
 * @description Ottiene tutti gli articoli pubblicati, con filtri e paginazione.
 * @route GET /api/blog
 */
export const getPublishedArticles = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, category, tag } = req.query;
        const query = {
            status: 'published',
            publishedAt: { $lte: new Date() }
        };

        if (category) query.categories = category;
        if (tag) query.tags = tag;

        const articles = await Article.find(query)
            .populate('author', 'name avatar')
            .sort({ publishedAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await Article.countDocuments(query);
        const articlesWithReactionCounts = articles.map(article => {
            const reactionCounts = article.reactions.reduce((acc, r) => {
                acc[r.reaction] = (acc[r.reaction] || 0) + 1;
                return acc;
            }, {});
            return { ...article.toObject(), reactionCounts };
        });

        res.status(200).json({
            articles: articlesWithReactionCounts,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @description Ottiene un singolo articolo tramite il suo slug.
 * @route GET /api/blog/:slug
 */
export const getArticleBySlug = async (req, res, next) => {
    try {
        const { slug } = req.params;
        const user = req.user;

        const article = await Article.findOneAndUpdate(
            { slug },
            { $inc: { views: 1 } }, 
            { new: true }
        ).populate('author', 'name avatar');

        if (!article) {
            return res.status(404).json({ message: req.t('blog_not_found') });
        }

        if (article.status !== 'published' && (!user || user.role !== 'admin')) {
            return res.status(403).json({ message: req.t('blocked_access') });
        }

        const reactionCounts = article.reactions.reduce((acc, r) => {
            acc[r.reaction] = (acc[r.reaction] || 0) + 1;
            return acc;
        }, {});

        let currentUserReaction = null;
        if (user) {
            const reaction = article.reactions.find(r => r.user.toString() === user.userid);
            currentUserReaction = reaction ? reaction.reaction : null;
        }

        res.status(200).json({
            ...article.toObject(),
            reactionCounts,
            currentUserReaction
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @description Permette a un utente autenticato di reagire a un articolo.
 * @route POST /api/blog/:id/react
 */
export const reactToArticle = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.userid;
        const { reaction } = req.body; // 'like', 'dislike', 'love', etc.

        if (!['like', 'dislike', 'love', 'fire', 'thumbup'].includes(reaction)) {
            return res.status(400).json({ message: req.t('blog_invalid_reaction') });
        }

        const article = await Article.findById(id);
        if (!article) {
            return res.status(404).json({ message: req.t('blog_not_found') });
        }

        const existingReactionIndex = article.reactions.findIndex(r => r.user.toString() === userId);

        if (existingReactionIndex > -1) {
            if (article.reactions[existingReactionIndex].reaction === reaction) {
                article.reactions.splice(existingReactionIndex, 1);
            } else {
                article.reactions[existingReactionIndex].reaction = reaction;
            }
        } else {
            article.reactions.push({ user: userId, reaction });
        }

        await article.save();
        const reactionCounts = article.reactions.reduce((acc, r) => {
            acc[r.reaction] = (acc[r.reaction] || 0) + 1;
            return acc;
        }, {});

        res.status(200).json({
            reactionCounts,
            currentUserReaction: existingReactionIndex > -1 && article.reactions[existingReactionIndex]?.reaction === reaction ? null : reaction
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @description Fornisce statistiche di base sul blog. Solo per admin.
 * @route GET /api/blog/stats
 */
export const getBlogStats = async (req, res, next) => {
    try {
        const totalArticles = await Article.countDocuments({ status: 'published' });

        const totalViewsResult = await Article.aggregate([
            { $group: { _id: null, totalViews: { $sum: '$views' } } }
        ]);
        const totalViews = totalViewsResult.length > 0 ? totalViewsResult[0].totalViews : 0;

        const mostViewedArticles = await Article.find({ status: 'published' })
            .sort({ views: -1 })
            .limit(5)
            .select('title slug views');

        res.status(200).json({
            totalArticles,
            totalViews,
            mostViewedArticles
        });
    } catch (error) {
        next(error);
    }
}

/**
 * @description Ottiene tutte le categorie disponibili dagli articoli pubblicati
 * @route GET /api/blog/categories
 */
export const getAvailableCategories = async (req, res, next) => {
    try {
        const categories = await Article.distinct("categories", {
            status: "published",
            publishedAt: { $lte: new Date() }
        });
        const validCategories = categories.filter(Boolean);

        res.status(200).json(validCategories);
    } catch (error) {
        next(error);
    }
};
