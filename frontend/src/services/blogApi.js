import api from './api';

// --- Funzioni API Pubbliche ---

/**
 * Ottiene gli articoli pubblicati con paginazione e filtri.
 * @param {object} params - { page, limit, category, tag }
 */
export const getArticles = (params) => api.get('/blog', { params });

/**
 * Ottiene un singolo articolo tramite il suo slug.
 * @param {string} slug 
 */
export const getArticleBySlug = (slug) => api.get(`/blog/${slug}`);

/**
 * Invia una reazione a un articolo.
 * @param {string} articleId 
 * @param {string} reaction 
 */
export const reactToArticle = (articleId, reaction) => api.post(`/blog/${articleId}/react`, { reaction });


// --- Funzioni API per Admin ---

/**
 * Ottiene tutti gli articoli per il pannello admin (bozze, programmati, etc.).
 * @param {object} params - { page, limit, status }
 */
export const getAdminArticles = (params) => api.get('/blog/admin', { params });

/**
 * Crea un nuovo articolo.
 * @param {object} articleData 
 */
export const createArticle = (articleData) => api.post('/blog', articleData);

/**
 * Aggiorna un articolo esistente.
 * @param {string} articleId 
 * @param {object} articleData 
 */
export const updateArticle = (articleId, articleData) => api.put(`/blog/${articleId}`, articleData);

/**
 * Elimina un articolo.
 * @param {string} articleId 
 */
export const deleteArticle = (articleId) => api.delete(`/blog/${articleId}`);

/**
 * Ottiene le statistiche del blog.
 */
export const getBlogStats = () => api.get('/blog/stats');
/**
 * inserisci immagine
 * @param {string} formData 
 */

export const updateImage = (formData) => {
  // non è obbligatorio settare Content-Type: axios lo fa con il boundary.
  return api.post('/blog/upload', formData);
};


export const getArticleById = (id) => api.get(`/blog/admin/article/${id}`);
export const getCategories = async () => {
    const { data } = await api.get('/blog/categories');
    return data;
};