import express from 'express';
import * as blogController from '../controllers/Blog.controller.js';
import { authenticateJWT } from '../middlewares/Auth.js';
import { isAdmin, isOwnerOrAdmin } from '../middlewares/Authorization.js';
import { sanitizeContent } from '../middlewares/Sanitize.middleware.js';
import upload from '../config/MulterConfig.js';
import Article from '../models/Article.model.js';

const router = express.Router();

/*
 * ===============================================
 * Rotte per Admin
 * ===============================================
 * Protette da authenticateJWT e isAdmin
 */
router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Nessun file caricato' });
  res.json({ imageUrl: `/uploads/${req.file.filename}` });
});
// Crea un nuovo articolo (con sanitizzazione del contenuto)
router.post('/', authenticateJWT, isAdmin, sanitizeContent, blogController.createArticle);

// Aggiorna un articolo (con sanitizzazione del contenuto)
router.put('/:id', authenticateJWT, isAdmin, sanitizeContent, blogController.updateArticle);

// Elimina un articolo
router.delete('/:id', authenticateJWT, isAdmin, blogController.deleteArticle);

// Ottiene tutti gli articoli per il pannello di amministrazione (bozze, programmati, ecc.)
router.get('/admin', authenticateJWT, isAdmin, blogController.getAdminArticles);

// Ottiene le statistiche del blog
router.get('/stats', authenticateJWT, isAdmin, blogController.getBlogStats);

// Rotta admin per ottenere articolo per ID
router.get('/admin/article/:id', authenticateJWT, isAdmin, async (req, res, next) => {
    try {
        const { id } = req.params;
        const article = await Article.findById(id);
        if (!article) return res.status(404).json({ message: 'Articolo non trovato' });
        res.status(200).json(article);
    } catch (error) {
        next(error);
    }
});

/*
 * ===============================================
 * Rotte Pubbliche
 * ===============================================
 * Accessibili a tutti gli utenti
 */
router.get('/categories', blogController.getAvailableCategories);


// Ottiene tutti gli articoli pubblicati (con paginazione e filtri)
router.get('/', blogController.getPublishedArticles);


// Ottiene un singolo articolo tramite il suo slug
// authenticateJWT è opzionale qui, quindi lo gestiamo nel controller per capire se un utente è loggato
router.get('/:slug', (req, res, next) => {
    // Prova ad autenticare ma non fallire se il token non c'è
    const authHeader = req.header('Authorization');
    if (!authHeader) return next();
    authenticateJWT(req, res, next);
}, blogController.getArticleBySlug);


/*
 * ===============================================
 * Rotte per Utenti Autenticati
 * ===============================================
 */

// Permette a un utente di reagire a un articolo
router.post('/:id/react', authenticateJWT, blogController.reactToArticle);

export default router;
