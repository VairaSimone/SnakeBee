import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getAdminArticles, deleteArticle } from '../../services/blogApi';
import { FaEdit, FaTrash, FaPlus, FaSpinner, FaSearch } from 'react-icons/fa';
import { toast } from 'react-toastify';

// Componente per i badge di stato (più pulito)
const StatusBadge = ({ status }) => {
    const statusStyles = {
        published: 'bg-green-100 text-green-800',
        draft: 'bg-yellow-100 text-yellow-800',
        scheduled: 'bg-blue-100 text-blue-800',
    };
    return (
        <span className={`px-2 py-1 text-xs font-semibold leading-tight rounded-full ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
};

// Modale di conferma per l'eliminazione
const ConfirmationModal = ({ isOpen, onClose, onConfirm, message }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h3 className="text-lg font-bold mb-4 text-black">Conferma Eliminazione</h3>
                <p className="text-black mb-6">{message}</p>
                <div className="flex justify-end space-x-4">
                    <button onClick={onClose} className="text-black px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">
                        Annulla
                    </button>
                    <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                        Elimina
                    </button>
                </div>
            </div>
        </div>
    );
};


const AdminBlogDashboard = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    
    // State per il modale
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [articleToDelete, setArticleToDelete] = useState(null);

    const fetchArticles = async () => {
        setLoading(true);
        try {
            const { data } = await getAdminArticles({ page: 1, limit: 100 });
            setArticles(data.articles || []);
        } catch (error) {
            toast.error("Impossibile caricare gli articoli.");
            setArticles([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchArticles();
    }, []);
    
    const handleDeleteClick = (article) => {
        setArticleToDelete(article);
        setIsModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!articleToDelete) return;
        try {
            await deleteArticle(articleToDelete._id);
            toast.success(`Articolo "${articleToDelete.title.it}" eliminato!`);
            setIsModalOpen(false);
            setArticleToDelete(null);
            fetchArticles();
        } catch (error) {
            toast.error("Errore durante l'eliminazione.");
        }
    };

    const filteredArticles = useMemo(() => {
        return articles
            .filter(article => statusFilter === 'all' || article.status === statusFilter)
            .filter(article => article.title.it.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [articles, searchTerm, statusFilter]);

    if (loading) {
        return <div className="flex justify-center items-center h-screen"><FaSpinner className="animate-spin text-4xl text-indigo-600" /></div>;
    }

    return (
        <div className="p-4 md:p-8 min-h-screen">
            <ConfirmationModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={confirmDelete}
                message={`Sei sicuro di voler eliminare l'articolo: "${articleToDelete?.title.it}"? L'azione è irreversibile.`}
            />

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Gestione Blog</h1>
                <Link to="/admin/blog/new" className="mt-4 md:mt-0 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg inline-flex items-center shadow-md transition-transform transform hover:scale-105">
                    <FaPlus className="mr-2" /> Crea Articolo
                </Link>
            </div>

            {/* Barra Filtri e Ricerca */}
            <div className="bg-white p-4 rounded-lg shadow-md mb-6 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative w-full md:w-2/3">
                    <FaSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Cerca per titolo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="text-black w-full md:w-1/3 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    <option value="all">Tutti gli stati</option>
                    <option value="published">Pubblicato</option>
                    <option value="draft">Bozza</option>
                    <option value="scheduled">Programmato</option>
                </select>
            </div>

            {/* Griglia Articoli */}
            {filteredArticles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredArticles.map(article => (
                        <div key={article._id} className="bg-white rounded-lg shadow-lg overflow-hidden transition-shadow duration-300 hover:shadow-2xl flex flex-col">
                            <img src={article.ogImage || 'https://via.placeholder.com/400x200?text=Nessuna+Immagine'} alt={article.title.it} className="w-full h-48 object-cover"/>
                            <div className="p-4 flex flex-col flex-grow">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-lg font-bold text-gray-800 flex-1 pr-2">{article.title.it}</h3>
                                    <StatusBadge status={article.status} />
                                </div>
                                <p className="text-sm text-gray-500 mb-4">
                                    Pubblicazione: {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('it-IT') : 'Non programmata'}
                                </p>
                                <div className="mt-auto flex justify-end space-x-3 pt-4 border-t border-gray-100">
                                    <Link to={`/admin/blog/edit/${article._id}`} className="text-gray-500 hover:text-indigo-600 transition-colors p-2 rounded-full hover:bg-gray-100">
                                        <FaEdit size={18} />
                                    </Link>
                                    <button onClick={() => handleDeleteClick(article)} className="text-gray-500 hover:text-red-600 transition-colors p-2 rounded-full hover:bg-gray-100">
                                        <FaTrash size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-white rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold text-gray-700">Nessun articolo trovato</h2>
                    <p className="text-gray-500 mt-2">Nessun articolo corrisponde ai criteri di ricerca, oppure non hai ancora scritto nulla.</p>
                    <Link to="/admin/blog/new" className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg inline-flex items-center shadow-md transition-transform transform hover:scale-105">
                       <FaPlus className="mr-2" /> Inizia a scrivere
                    </Link>
                </div>
            )}
        </div>
    );
};

export default AdminBlogDashboard;