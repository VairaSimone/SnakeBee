import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getArticles, getCategories } from '../services/blogApi';
import ArticleCard from '../components/ArticleCard';
import { FaSpinner } from 'react-icons/fa';

const BlogPage = () => {
    const { t } = useTranslation();
    const [articles, setArticles] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchParams, setSearchParams] = useSearchParams();
    const activeCategory = searchParams.get('category');

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await getCategories();
                setCategories(data);
            } catch (err) {
                console.error('Errore caricamento categorie:', err);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchArticles = async () => {
            setLoading(true);
            try {
                const params = { page: 1, limit: 12, category: activeCategory };
                const { data } = await getArticles(params);
                setArticles(data.articles || []);
            } catch (err) {
                setError(t('blog.error_loading_articles'));
            } finally {
                setLoading(false);
            }
        };
        fetchArticles();
    }, [activeCategory, t]);

    const featuredArticle = useMemo(() => articles?.[0], [articles]);
    const otherArticles = useMemo(() => articles?.slice(1), [articles]);

    if (loading)
        return (
            <div className="flex justify-center items-center h-screen bg-slate-50">
                <FaSpinner className="animate-spin text-emerald-500 text-5xl" />
            </div>
        );

    if (error)
        return (
            <div className="text-center py-20 text-red-500 font-semibold bg-slate-50 h-screen">
                {error}
            </div>
        );

    return (
        <div className="text-slate-800 min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
                <header className="text-center mb-12">
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-green-500">
                        {t('blog.blog_title')}
                    </h1>
                    <p className="text-lg text-slate-600 mt-4 max-w-2xl mx-auto">
                        {t('blog.blog_subtitle')}
                    </p>
                </header>

                <nav className="flex justify-center flex-wrap gap-3 mb-16">
                    <button
                        onClick={() => setSearchParams({})}
                        className={`px-4 py-2 text-sm font-semibold rounded-full transition ${
                            !activeCategory
                                ? 'bg-emerald-500 text-white shadow'
                                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-300'
                        }`}
                    >
                        {t('blog.all')}
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSearchParams({ category: cat })}
                            className={`px-4 py-2 text-sm font-semibold rounded-full transition ${
                                activeCategory === cat
                                    ? 'bg-emerald-500 text-white shadow'
                                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-300'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </nav>

                {articles.length > 0 ? (
                    <>
                        {featuredArticle && (
                            <div className="mb-16">
                                <ArticleCard article={featuredArticle} isFeatured />
                            </div>
                        )}
                        {otherArticles.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {otherArticles.map((article) => (
                                    <ArticleCard key={article._id} article={article} />
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-20 border-2 border-dashed border-slate-300 rounded-lg">
                        <p className="text-slate-500 text-xl">{t('blog.no_articles')}</p>
                        <p className="text-slate-400 mt-2">{t('blog.try_another_category')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BlogPage;
