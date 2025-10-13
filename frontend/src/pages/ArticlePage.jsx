import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getArticleBySlug } from '../services/blogApi';
import { FaSpinner, FaUserCircle, FaCalendarAlt } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import DOMPurify from 'dompurify';
import slugify from 'slugify';
import ArticleReactions from '../components/ArticleReactions';

// Componente per l'indice dei contenuti
const TableOfContents = ({ headings }) => {
    const { t } = useTranslation();
    if (!headings || headings.length === 0) return null;
    return (
        <aside className="hidden lg:block sticky top-28">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
                {t('blog.table_of_contents')}
            </h3>
            <ul className="space-y-3 border-l-2 border-slate-200 pl-4">
                {headings.map(h => (
                    <li key={h.id}>
                        <a href={`#${h.id}`} className="text-slate-600 hover:text-emerald-600 transition-colors text-sm font-medium">
                            {h.text}
                        </a>
                    </li>
                ))}
            </ul>
        </aside>
    );
};

const ArticlePage = () => {
    const { slug } = useParams(); 
const { t, i18n } = useTranslation();
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [headings, setHeadings] = useState([]);
    const [readProgress, setReadProgress] = useState(0);
    const contentRef = useRef(null);

    // Calcolo progress bar
    const handleScroll = useCallback(() => {
        const el = document.documentElement;
        const windowHeight = el.clientHeight;
        const scrollHeight = el.scrollHeight;
        const scrollTop = el.scrollTop;
        const progress = (scrollTop / (scrollHeight - windowHeight)) * 100;
        setReadProgress(progress);
    }, []);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                setLoading(true);
                const { data } = await getArticleBySlug(slug);
                setArticle(data);
            } catch (err) {
                setError(t('blog.article_not_found'));
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchArticle();
    }, [slug, t]);

    useEffect(() => {
        if (article && contentRef.current) {
            const nodes = contentRef.current.querySelectorAll('h2, h3');
            const extractedHeadings = Array.from(nodes).map(node => {
                const id = slugify(node.innerText, { lower: true, strict: true });
                node.id = id;
                return { id, text: node.innerText, level: node.tagName.toLowerCase() };
            });
            setHeadings(extractedHeadings);
        }
    }, [article]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <FaSpinner className="animate-spin text-emerald-500 text-4xl" />
            </div>
        );
    }

    if (error || !article) {
        return (
            <div className="text-center py-20 text-red-500 font-semibold text-lg">
                {error}
            </div>
        );
    }

    const title = article.title?.[i18n.language] || article.title?.it;
    const sanitizedContent = DOMPurify.sanitize(article.content?.[i18n.language] || article.content?.it);

    return (
        <>
            {/* Progress Bar */}
            <div className="fixed top-0 left-0 w-full h-1 z-50">
                <div className="h-full bg-gradient-to-r from-emerald-400 to-green-400" style={{ width: `${readProgress}%` }} />
            </div>

            <div>
                {/* Header con immagine di sfondo */}
                <header className="relative h-[60vh] min-h-[400px] flex items-center justify-center text-center text-white">
                    <div className="absolute inset-0 bg-black opacity-60 z-10"></div>
                    {article.ogImage && (
                        <img src={article.ogImage} alt={title} className="absolute inset-0 w-full h-full object-cover" />
                    )}
                    <div className="relative z-20 max-w-4xl mx-auto px-4">
                        <Link
                            to={`/blog?category=${article.categories?.[0]}`}
                            className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-4 inline-block"
                        >
                            {article.categories?.[0]}
                        </Link>
                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight mb-4">{title}</h1>
                        <div className="flex justify-center items-center text-gray-200 text-base mt-6 space-x-6">
                            <div className="flex items-center">
                                <FaUserCircle className="mr-2 text-emerald-400" /> 
                                <span>{article.author.name}</span>
                            </div>
                            <div className="flex items-center">
                                <FaCalendarAlt className="mr-2 text-emerald-400" /> 
                                <span>{new Date(article.publishedAt).toLocaleDateString(i18n.language === 'it' ? 'it-IT' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Colonna Indice */}
                        <div className="lg:col-span-3">
                            <TableOfContents headings={headings} />
                        </div>
                        
                        {/* Contenuto Principale */}
                        <main className="lg:col-span-9 xl:col-span-6 bg-white p-8 sm:p-10 rounded-xl shadow-lg border border-slate-200">
                            <article>
                                <div
                                    ref={contentRef}
                                    className="prose lg:prose-lg max-w-full 
                                               prose-h2:text-emerald-600 prose-h2:font-bold 
                                               prose-a:text-emerald-600 hover:prose-a:text-emerald-700
                                               prose-blockquote:border-l-4 prose-blockquote:border-emerald-500 prose-blockquote:text-slate-500
                                               prose-strong:text-slate-800 text-black"
                                    dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                                />
                                <hr className="my-12 border-slate-200" />
                                <div className="bg-slate-100 p-6 rounded-lg text-center">
                                    <h3 className="text-xl font-bold text-slate-800 mb-4">{t('blog.article_useful')}</h3>
                                    <ArticleReactions
                                        articleId={article._id}
                                        initialCounts={article.reactionCounts}
                                        initialUserReaction={article.currentUserReaction}
                                    />
                                </div>
                            </article>
                        </main>

                        {/* Colonna destra per widget futuri */}
                        <div className="hidden xl:block xl:col-span-3"></div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ArticlePage;
