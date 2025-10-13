import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaArrowRight } from "react-icons/fa";

const ArticleCard = ({ article, isFeatured = false }) => {
    const { i18n } = useTranslation();
    const currentLang = i18n.language;
    
    const title = article.title?.[currentLang] || article.title?.it;
    const plainTextContent = article.content?.[currentLang]?.replace(/<[^>]*>?/gm, '') || '';
    const excerpt = plainTextContent?.substring(0, isFeatured ? 200 : 100) + '...' || '';
    
    const getAuthorAvatar = () => {
        if (!article.author?.avatar) return 'https://static.thenounproject.com/png/363639-200.png';
        if (article.author.avatar.startsWith('http')) return article.author.avatar;
        return `${process.env.REACT_APP_BACKEND_URL_IMAGE}${article.author.avatar}`;
    };

  if (isFeatured) {
        return (
            <article className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center group relative bg-white p-6 rounded-xl shadow-lg border border-slate-200">
                {/* Immagine con effetto zoom */}
                <div className="overflow-hidden rounded-lg">
                    <Link to={`/blog/${article.slug}`}>
                        <img 
                            src={article.ogImage || 'https://via.placeholder.com/800x600'}
                            alt={title}
                            className="w-full h-auto object-cover aspect-video transform group-hover:scale-105 transition-transform duration-700 ease-in-out"
                        />
                    </Link>
                </div>
                {/* Contenuto testuale */}
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-emerald-600 uppercase tracking-wider mb-2">{article.categories?.[0] || 'In evidenza'}</span>
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4 leading-tight">
                        <Link to={`/blog/${article.slug}`} className="hover:text-slate-900 transition-colors duration-300">
                            {/* Effetto sottolineatura animata al passaggio del mouse */}
                            <span className="bg-left-bottom bg-gradient-to-r from-emerald-500 to-emerald-500 bg-[length:0%_2px] bg-no-repeat group-hover:bg-[length:100%_2px] transition-all duration-500">
                                {title}
                            </span>
                        </Link>
                    </h2>
                    <p className="text-slate-600 mb-6">{excerpt}</p>
                    {/* Dettagli autore */}
                    <div className="flex items-center text-sm text-slate-500">
                        <img src={getAuthorAvatar()} alt={article.author?.name} className="w-10 h-10 rounded-full mr-3 object-cover" />
                        <div>
                            <span className="font-semibold text-slate-700">{article.author?.name || 'SnakeBee Team'}</span>
                            <span className="mx-2">•</span>
                            <span>{new Date(article.publishedAt).toLocaleDateString('it-IT', { year: 'numeric', month: 'long' })}</span>
                        </div>
                    </div>
                </div>
            </article>
        );
    }

    // Card standard per gli altri articoli
    return (
        <article className="group relative flex flex-col bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 border border-slate-200 overflow-hidden">
            {/* Immagine */}
            <div className="overflow-hidden">
                <Link to={`/blog/${article.slug}`}>
                    <img 
                        src={article.ogImage || 'https://via.placeholder.com/600x400'}
                        alt={title}
                        className="w-full h-56 object-cover transform group-hover:scale-105 transition-transform duration-700 ease-in-out"
                    />
                </Link>
            </div>
            {/* Contenuto */}
            <div className="p-6 flex flex-col flex-grow">
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">{article.categories?.[0] || 'Articolo'}</span>
                <h2 className="text-xl font-bold text-slate-800 mb-3 flex-grow">
                    <Link to={`/blog/${article.slug}`} className="hover:text-emerald-700 transition-colors duration-300">
                        {title}
                    </Link>
                </h2>
                <Link to={`/blog/${article.slug}`} className="flex items-center text-sm font-semibold text-emerald-600 mt-auto group-hover:text-emerald-700 transition">
                    Leggi di più <FaArrowRight className="ml-2 transform group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
        </article>
    );
};

export default ArticleCard;