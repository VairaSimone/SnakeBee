// src/pages/Shop.js
import React, { useState, useEffect, useCallback } from 'react';
import { getPublicReptiles } from '../services/api';
import { useNavigate } from 'react-router-dom';
import ReptileCardPublic from '../components/ReptileCardPublic';
import { useTranslation } from 'react-i18next';
// import { Link } from 'react-router-dom'; // Già presente
import {
  Store,
  SlidersHorizontal,
  Filter,
  X,
  Tag,
  MapPin,
  AlertTriangle,
  SearchX,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ChevronDown,User, // <-- ICONA AGGIUNTA
  Calendar
} from 'lucide-react';

const SkeletonCard = () => (
  <div className="bg-white p-4 rounded-2xl shadow-lg animate-pulse">
    <div className="w-full h-48 bg-stone-200 rounded-xl mb-4"></div>
    <div className="h-6 bg-stone-200 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-stone-200 rounded w-1/2 mb-3"></div>
    <div className="h-4 bg-stone-200 rounded w-1/4"></div>
  </div>
);

const Shop = () => {
  const [reptiles, setReptiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ species: '', morph: '', zona: '', sex: '',
    minPrice: '',
    maxPrice: '',
    breederName: '',
    birthYear: '' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const { t } = useTranslation();
  const navigate = useNavigate();

  const fetchReptiles = useCallback(async (currentPage, currentFilters) => {
    // ... (logica fetchReptiles invariata) ...
    setLoading(true);
    setError(null);
    try {
      const activeFilters = Object.fromEntries(
        Object.entries(currentFilters).filter(([_, v]) => v !== '')
      );
      const params = { ...activeFilters, page: currentPage, perPage: 20 };
      const { data } = await getPublicReptiles(params);
      setReptiles(data.dati || []);
      setTotalPages(data.totalPages || 0);
    } catch (err) {
      setError(t('shop.error', 'Impossibile caricare i rettili.'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchReptiles(page, filters);
  }, [page, fetchReptiles]);

  const handleFilterChange = (e) => {
    // ... (invariato) ...
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleFilterSubmit = (e) => {
    // ... (invariato) ...
    e.preventDefault();
    setPage(1);
    fetchReptiles(1, filters);
  };

  const handleClearFilters = () => {
    // ... (invariato) ...
    const clearedFilters = { species: '', morph: '', zona: '',sex: '',
        minPrice: '',
        maxPrice: '',
        breederName: '',
        birthYear: '' };
    setFilters(clearedFilters);
    setPage(1);
    fetchReptiles(1, clearedFilters);
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* --- HEADER RIDISEGNATO --- */}
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-10 gap-4">
          <h1 className="text-4xl font-bold tracking-tight text-stone-800 flex items-center gap-3">
            <Store className="w-9 h-9 text-amber-600" />
            {t('shop.title', 'SnakeBee Shop')}
          </h1>
          <div className="text-center"> {/* Rimosso mb-6, già gestito dal gap del flex parent */}
            <button
              onClick={() => navigate('/shop/breeders')}
              className="inline-flex items-center group px-6 py-2 bg-emerald-600 text-white font-semibold rounded-lg shadow-md hover:bg-emerald-700 transition-colors duration-300" // Cambiato colore a emerald per coerenza
            >
              {t('shop.breederList', 'Vedi tutti gli allevatori')}
              <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>

        {/* --- NUOVO LAYOUT: FILTRI (Sidebar) + CONTENUTO (Grid) --- */}
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          
          {/* --- COLONNA FILTRI (Sidebar) --- */}
          <aside className="lg:col-span-1">
            {/* Pulsante Toggle per Mobile */}
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="w-full flex lg:hidden justify-between items-center text-lg font-semibold text-stone-800 bg-white p-4 rounded-2xl shadow-lg"
            >
              <span className='flex items-center gap-2'>
                <SlidersHorizontal className="w-6 h-6 text-amber-600" />
                {t('shop.filterTitle', 'Filtri di Ricerca')}
              </span>
              <ChevronDown 
                className={`w-5 h-5 transition-transform ${isFilterOpen ? 'rotate-180' : 'rotate-0'}`} 
              />
            </button>

            {/* Contenitore Filtri (Sticky su Desktop, Collassabile su Mobile) */}
            <> 
              {(isFilterOpen || (typeof window !== 'undefined' && window.innerWidth >= 1024)) && (
                <div
                  key="filter-panel"
                  className={`
                    bg-white p-6 rounded-2xl shadow-lg 
                    lg:sticky lg:top-24 
                    ${isFilterOpen ? 'block' : 'hidden'} lg:block 
                    ${(isFilterOpen && (typeof window !== 'undefined' && window.innerWidth < 1024)) ? 'mt-4' : 'mt-0'} lg:mt-0
                    transition-all duration-300 ease-in-out ${isFilterOpen ? 'opacity-100 max-h-screen' : 'opacity-0 max-h-0'} lg:opacity-100 lg:max-h-full overflow-hidden
                  `}
                >
                  <h2 className="text-xl font-semibold text-stone-800 mb-5 flex items-center gap-2 hidden lg:flex">
                    <SlidersHorizontal className="w-6 h-6 text-amber-600" />
                    {t('shop.filterTitle', 'Filtri di Ricerca')}
                  </h2>

                  <form onSubmit={handleFilterSubmit} className="space-y-5">
                    {/* Input Species */}
                    <div>
                      <label htmlFor="species" className="block text-sm font-medium text-stone-600 mb-1">
                        {t('shop.filterSpeciesLabel', 'Specie')}
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">
                          <Tag className="w-5 h-5" />
                        </span>
                        <input
                          type="text" name="species" id="species" value={filters.species} onChange={handleFilterChange}
                          placeholder={t('shop.filterSpecies', 'es. Python regius')}
                          className="text-black w-full pl-10 pr-3 py-2 border border-stone-300 rounded-lg shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-150"
                        />
                      </div>
                    </div>
                    
                    {/* Input Morph */}
                    <div>
                      <label htmlFor="morph" className="block text-sm font-medium text-stone-600 mb-1">
                        {t('shop.filterMorphLabel', 'Morph')}
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">
                          <Tag className="w-5 h-5" />
                        </span>
                        <input
                          type="text" name="morph" id="morph" value={filters.morph} onChange={handleFilterChange}
                          placeholder={t('shop.filterMorph', 'es. Piebald')}
                          className="text-black w-full pl-10 pr-3 py-2 border border-stone-300 rounded-lg shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-150"
                        />
                      </div>
                    </div>

                    {/* Input Zona */}
                    <div>
                      <label htmlFor="zona" className="block text-sm font-medium text-stone-600 mb-1">
                        {t('shop.filterZoneLabel', 'Zona')}
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">
                          <MapPin className="w-5 h-5" />
                        </span>
                        <input
                          type="text" name="zona" id="zona" value={filters.zona} onChange={handleFilterChange}
                          placeholder={t('shop.filterZone', 'es. Milano')}
                          className="text-black w-full pl-10 pr-3 py-2 border border-stone-300 rounded-lg shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-150"
                        />
                      </div>
                    </div>
{/* Filtro Sesso */}
                    <div>
                      <label htmlFor="sex" className="block text-sm font-medium text-stone-600 mb-1">
                        {t('shop.filterSexLabel', 'Sesso')}
                      </label>
                      <select
                        name="sex" id="sex" value={filters.sex} onChange={handleFilterChange}
                        className="text-black w-full pl-3 pr-3 py-2 border border-stone-300 rounded-lg shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-150"
                      >
                        <option value="">{t('shop.filterSexAll', 'Tutti')}</option>
                        <option value="M">{t('shop.filterSexM', 'Maschio')}</option>
                        <option value="F">{t('shop.filterSexF', 'Femmina')}</option>
                        <option value="Unknown">{t('shop.filterSexU', 'Sconosciuto')}</option>
                      </select>
                    </div>

                    {/* Filtro Range Prezzo */}
                    <div>
                      <label className="block text-sm font-medium text-stone-600 mb-1">
                        {t('shop.filterPriceLabel', 'Range di Prezzo')}
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number" name="minPrice" value={filters.minPrice} onChange={handleFilterChange}
                          placeholder={t('shop.filterPriceMin', 'Min')}
                          className="text-black w-full px-3 py-2 border border-stone-300 rounded-lg shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-150"
                          min="0"
                        />
                        <span className="text-stone-500">-</span>
                        <input
                          type="number" name="maxPrice" value={filters.maxPrice} onChange={handleFilterChange}
                          placeholder={t('shop.filterPriceMax', 'Max')}
                          className="text-black w-full px-3 py-2 border border-stone-300 rounded-lg shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-150"
                          min="0"
                        />
                      </div>
                    </div>

                    {/* Filtro Nome Allevatore */}
                    <div>
                      <label htmlFor="breederName" className="block text-sm font-medium text-stone-600 mb-1">
                        {t('shop.filterBreederLabel', 'Allevatore')}
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">
                          <User className="w-5 h-5" />
                        </span>
                        <input
                          type="text" name="breederName" id="breederName" value={filters.breederName} onChange={handleFilterChange}
                          placeholder={t('shop.filterBreeder', 'Nome allevatore...')}
                          className="text-black w-full pl-10 pr-3 py-2 border border-stone-300 rounded-lg shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-150"
                        />
                      </div>
                    </div>

                    {/* Filtro Anno Nascita */}
                     <div>
                      <label htmlFor="birthYear" className="block text-sm font-medium text-stone-600 mb-1">
                        {t('shop.filterYearLabel', 'Anno di Nascita')}
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">
                          <Calendar className="w-5 h-5" />
                        </span>
                        <input
                          type="number" name="birthYear" id="birthYear" value={filters.birthYear} onChange={handleFilterChange}
                          placeholder={t('shop.filterYear', 'es. 2023')}
                          className="text-black w-full pl-10 pr-3 py-2 border border-stone-300 rounded-lg shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-150"
                          min="2000" 
                          max={new Date().getFullYear()} // Imposta l'anno corrente come max
                        />
                      </div>
                    </div>

                    {/* Pulsanti Azione */}
                    <div className="flex flex-col gap-3 pt-3">
                      <button 
                        type="submit" 
                        className="w-full bg-amber-600 text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-amber-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                      >
                        <Filter className="w-5 h-5" />
                        {t('shop.filterButton', 'Filtra')}
                      </button>
                      <button 
                        type="button" 
                        onClick={handleClearFilters}
                        className="w-full bg-stone-200 text-stone-700 py-2.5 px-4 rounded-lg font-semibold hover:bg-stone-300 transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        <X className="w-5 h-5" />
                        {t('shop.clearFilters', 'Azzera')}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </>
          </aside>

          {/* --- COLONNA CONTENUTO (Griglia) --- */}
          <main className="lg:col-span-3 mt-8 lg:mt-0">
            
            {/* --- STATO DI CARICAMENTO (Skeleton Grid) --- */}
            {/* CORRETTO: Classi della griglia unificate */}
            {loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
              </div>
            )}

            {/* --- STATO DI ERRORE --- */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-800 p-6 rounded-2xl shadow-lg shadow-red-100/50" role="alert">
                <div className="flex items-center">
                  <AlertTriangle className="h-6 w-6 mr-3 text-red-600" />
                  <p className="font-semibold text-lg">{error}</p>
                </div>
              </div>
            )}

            {/* --- STATO "NESSUN RISULTATO" --- */}
            {!loading && !error && reptiles.length === 0 && (
              <div className="text-center bg-white p-12 rounded-2xl shadow-lg text-stone-500">
                <SearchX className="w-16 h-16 mx-auto mb-5 text-stone-400" />
                <h3 className="text-2xl font-semibold text-stone-700 mb-2">
                  {t('shop.noResultsTitle', 'Nessun risultato')}
                </h3>
                <p>{t('shop.noResults', 'Nessun rettile trovato. Prova a modificare i filtri.')}</p>
              </div>
            )}

            {/* --- GRIGLIA RISULTATI (CORRETTA) --- */}
            {/* CORRETTO: Rimosso il div e la griglia annidati.
                Il titolo <h2> è ora fuori dalla griglia. */}
            {!loading && !error && reptiles.length > 0 && (
              <>
                <h2 className="text-2xl font-bold mb-6 text-stone-800">
                  {t('shop.resultsTitle', 'Rettili in Vendita')}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {reptiles.map(reptile => (
                    <ReptileCardPublic key={reptile._id} reptile={reptile} />
                  ))}
                </div>
              </>
            )}

            {/* --- PAGINAZIONE --- */}
            {totalPages > 1 && !loading && !error && (
              <nav className="flex flex-col sm:flex-row justify-between items-center mt-12 border-t border-stone-200 pt-8 gap-4">
                <button 
                  onClick={() => setPage(p => p - 1)} 
                  disabled={page === 1}
                  className="inline-flex items-center justify-center px-5 py-2.5 border border-stone-300 text-sm font-semibold rounded-lg text-stone-700 bg-white hover:bg-stone-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <ChevronLeft className="w-5 h-5 mr-2" />
                  {t('shop.prev', 'Precedente')}
                </button>
                <span className="text-sm font-medium text-stone-600">
                  {t('shop.page', { defaultValue: 'Pagina {{page}} di {{totalPages}}', page, totalPages })}
                </span>
                <button 
                  onClick={() => setPage(p => p + 1)} 
                  disabled={page === totalPages}
                  className="inline-flex items-center justify-center px-5 py-2.5 border border-stone-300 text-sm font-semibold rounded-lg text-stone-700 bg-white hover:bg-stone-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {t('shop.next', 'Successiva')}
                  <ChevronRight className="w-5 h-5 ml-2" />
                </button>
              </nav>
            )}

          </main>
        </div>
      </div>
    </div>
  );
};

export default Shop;