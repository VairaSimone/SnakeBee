// src/pages/BreederList.js
import React, { useState, useEffect } from 'react';
import { getPublicBreeders } from '../services/api';
import BreederCard from '../components/BreederCard';
import { useTranslation } from 'react-i18next';
// NUOVO: Import di icone 'solid' e per la paginazione/stati
import {
  UserGroupIcon, // Sostituisce UsersIcon (outline)
  ArrowPathIcon, // Per il caricamento
  ExclamationTriangleIcon, // Per l'errore
  InboxIcon, // Per lo stato vuoto
  ChevronLeftIcon, // Paginazione
  ChevronRightIcon // Paginazione
} from '@heroicons/react/24/solid';
import { ArrowLeftIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

// NUOVO: Componente Skeleton per il caricamento
const SkeletonCard = () => (
  <div className="bg-white p-6 rounded-2xl shadow-lg animate-pulse">
    <div className="flex items-center gap-4">
      <div className="w-16 h-16 bg-stone-200 rounded-full flex-shrink-0"></div>
      <div className="flex-grow space-y-2">
        <div className="h-5 bg-stone-200 rounded w-3/4"></div>
        <div className="h-4 bg-stone-200 rounded w-1/2"></div>
      </div>
    </div>
  </div>
);


const BreederList = () => {
  const [breeders, setBreeders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchBreeders = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = { page, perPage: 20 };
        const { data } = await getPublicBreeders(params);
        setBreeders(data.dati || []);
        setTotalPages(data.totalPages || 0);
      } catch (err) {
        setError(t('breeders.error', 'Impossibile caricare gli allevatori.'));
      } finally {
        setLoading(false);
      }
    };
    fetchBreeders();
  }, [page, t]);

  return (
    <div className=" min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <Link 
          to="/shop" // Modifica questo percorso se punta a una route diversa
          className="inline-flex items-center gap-2 text-sm font-medium text-amber-700 hover:text-amber-900 mb-4 transition-colors duration-200 text-black"
        >
          <ArrowLeftIcon className="w-5 h-5 text-black" />
          {t('shop.back', 'Torna allo Shop')}
        </Link>

        {/* TITOLO MIGLIORATO */}
        <h1 className="text-4xl font-bold tracking-tight text-stone-800 flex items-center gap-3 mb-10">
          <UserGroupIcon className="w-9 h-9 text-amber-600" />
          {t('breeders.title', 'Allevatori Pubblici')}
        </h1>

        {/* --- STATO DI CARICAMENTO (SKELETON) --- */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* --- STATO DI ERRORE --- */}
        {error && (
          <div className="max-w-2xl mx-auto bg-red-50 border-l-4 border-red-500 text-red-800 p-6 rounded-2xl shadow-lg shadow-red-100/50" role="alert">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-6 w-6 mr-3 text-red-600" />
              <p className="font-semibold text-lg">{error}</p>
            </div>
          </div>
        )}

        {/* --- STATO VUOTO --- */}
        {!loading && !error && breeders.length === 0 && (
          <div className="text-center bg-white p-12 rounded-2xl shadow-lg text-stone-500">
            <InboxIcon className="w-16 h-16 mx-auto mb-5 text-stone-400" />
            <h3 className="text-2xl font-semibold text-stone-700 mb-2">
              {t('breeders.noResultsTitle', 'Nessun allevatore trovato')}
            </h3>
            <p>{t('breeders.noResults', 'Al momento non ci sono allevatori pubblici disponibili.')}</p>
          </div>
        )}
        
        {/* --- GRIGLIA RISULTATI --- */}
        {!loading && !error && breeders.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {breeders.map(breeder => (
              <BreederCard key={breeder._id} breeder={breeder} />
            ))}
          </div>
        )}

        {/* --- PAGINAZIONE MIGLIORATA --- */}
        {totalPages > 1 && !loading && !error && (
          <nav className="flex flex-col sm:flex-row justify-between items-center mt-12 border-t border-stone-200 pt-8 gap-4">
            <button 
              onClick={() => setPage(p => p - 1)} 
              disabled={page === 1}
              className="inline-flex items-center justify-center px-5 py-2.5 border border-stone-300 text-sm font-semibold rounded-lg text-stone-700 bg-white hover:bg-stone-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <ChevronLeftIcon className="w-5 h-5 mr-2" />
              {t('shop.prev', 'Precedente')}
            </button>
            <span className="text-sm font-medium text-stone-600">
              {t('shop.page', 'Pagina {{page}} di {{totalPages}}', { page, totalPages })}
            </span>
            <button 
              onClick={() => setPage(p => p + 1)} 
              disabled={page === totalPages}
              className="inline-flex items-center justify-center px-5 py-2.5 border border-stone-300 text-sm font-semibold rounded-lg text-stone-700 bg-white hover:bg-stone-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {t('shop.next', 'Successiva')}
              <ChevronRightIcon className="w-5 h-5 ml-2" />
            </button>
          </nav>
        )}
      </div>
    </div>
  );
};

export default BreederList;