import React, { useEffect, useState, useRef } from 'react';
import api from '../services/api.js';
import { useSelector } from 'react-redux';
import { selectUser } from '../features/userSlice.jsx';
import { Link } from 'react-router-dom';
import ReptileCreateModal from '../components/ReptileCreateModal.jsx';
import ReptileEditModal from '../components/ReptileEditModal.jsx';
import FeedingModal from '../components/FeedingModal.jsx';
import EventModal from '../components/EventModal.jsx';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal.jsx';
import MultipleFeedingModal from '../components/MultipleFeedingModal.jsx';
import {
  FaMars, FaVenus, FaPlus, FaTag, FaPencilAlt, FaDrumstickBite, FaCalendarAlt, FaTrash,
  FaChartBar, FaPercentage, FaUtensils, FaEgg, FaSyncAlt, FaArchive, FaClipboardList,
  FaCheckSquare, FaRegSquare
} from 'react-icons/fa';
import CalendarModal from '../components/CalendarModal.jsx'
import { useTranslation } from 'react-i18next';

// ... (hasPaidPlan, isDueOrOverdue, TabButton rimangono uguali) ...
function hasPaidPlan(user) {
  if (!user?.subscription) return false;
  const { plan, status } = user.subscription;
  return (plan === 'BREEDER');
}

const isDueOrOverdue = (dateString) => { // Riceve "2025-11-01T22:00:00"
if (!dateString || typeof dateString !== 'string') {
    return false;
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Inizio di oggi (locale)

  // 1. Estrai solo la data (es. "2025-11-01")
  const dateOnly = dateString.split('T')[0];

  // 2. Ora la logica originale funziona correttamente
  // Crea la data del pasto impostandola a mezzogiorno locale
  const feedingDate = new Date(dateOnly + 'T12:00:00');
  feedingDate.setHours(0, 0, 0, 0); // Inizio del giorno del pasto (locale)

  return feedingDate <= today;
};

// NUOVO: Componente Tab
const TabButton = ({ title, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`py-3 px-6 font-semibold transition-all duration-300 ${isActive
      ? 'border-b-2 border-forest text-forest'
      : 'text-charcoal/60 hover:text-charcoal'
      }`}
  >
    {title}
  </button>
);


// MODIFICA: Componente Card per Animali Archiviati
// Aggiunti props per gestire i modali
const ArchivedReptileCard = ({
  reptile,
  t,
  carouselRefs,
  scrollCarousel,
  setSelectedReptile, // NUOVO
  setShowEditModal,   // NUOVO
  setPendingDelete,   // NUOVO
  setShowDeleteModal  // NUOVO
}) => {
  const statusLabel = reptile.status === 'ceded'
    ? t('dashboard.status.ceded')
    : reptile.status === 'deceased' ? t('dashboard.status.deceased') : t('dashboard.status.other'); // Aggiunto 'other'
  const statusColor = reptile.status === 'ceded' ? 'bg-blue-600' : 'bg-gray-600';
  const statusDate = reptile.status === 'ceded'
    ? reptile.cededTo?.date
    : reptile.deceasedDetails?.date;

  // NUOVO: Azioni per i pulsanti (Edit e Delete)
  const editAction = () => { setSelectedReptile(reptile); setShowEditModal(true); };
  const deleteAction = () => { setPendingDelete(reptile); setShowDeleteModal(true); };

  return (
    // MODIFICA: Rimosso Link esterno, usiamo i pulsanti per le azioni
    <div key={reptile._id} className="bg-white rounded-2xl shadow-lg overflow-hidden group transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5 flex flex-col min-h-[460px] max-h-[460px]">
      <div className="relative h-[160px] w-full overflow-hidden">
        {/* Etichetta di stato */}
        <div
          className={`absolute top-2 left-2 z-20 px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg flex items-center gap-1.5 ${statusColor}`}
          title={statusLabel}
        >
          <FaArchive size={10} /> {statusLabel}
        </div>

        {/* Carosello Immagini */}
        {reptile.image?.length > 1 ? (
          <div className="relative h-full w-full">
            <div className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar h-full" ref={(el) => (carouselRefs.current[reptile._id] = el)}>
              {reptile.image.map((img, idx) => (
                <img key={idx} src={`${process.env.REACT_APP_BACKEND_URL_IMAGE || ''}${img}`} alt={`${reptile.name}-${idx}`} className="object-cover w-full h-full flex-shrink-0 snap-center transition-transform duration-500 group-hover:scale-105" />
              ))}
            </div>
            <button onClick={(e) => scrollCarousel(e, -1, reptile._id)} className="absolute left-0 top-1/2 -translate-y-1/2 h-full w-10 bg-black/20 text-white flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-opacity">‹</button>
            <button onClick={(e) => scrollCarousel(e, 1, reptile._id)} className="absolute right-0 top-1/2 -translate-y-1/2 h-full w-10 bg-black/20 text-white flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-opacity">›</button>
          </div>
        ) : (
          <img src={reptile.image?.[0] ? `${process.env.REACT_APP_BACKEND_URL_IMAGE || ''}${reptile.image[0]}` : 'https://res.cloudinary.com/dg2wcqflh/image/upload/v1757791253/Logo_duqbig.png'} alt={reptile.name} className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105" />
        )}
      </div>

      <div className="p-4 h-[300px] flex flex-col justify-between">
        {/* Info base */}
        <div>
          <div className="flex justify-between items-start">
            <h3 className="text-xl font-bold text-charcoal group-hover:text-forest transition-colors duration-300 truncate">{reptile.name}</h3>
            <span title={reptile.sex === 'M' ? 'Maschio' : 'Femmina'}>
              {reptile.sex === 'M' && <FaMars className="text-blue-500 text-xl" />}
              {reptile.sex === 'F' && <FaVenus className="text-pink-500 text-xl" />}
            </span>
          </div>
          <p className="text-sm text-charcoal/60 italic truncate">{reptile.species}</p>
          <p className="text-sm text-charcoal/80 mt-1 font-medium truncate">Morph: {reptile.morph || 'N/A'}</p>
        </div>

        {/* Info Archivio */}
        <div className="space-y-1">
          <p className="text-sm text-charcoal/80">
            {t('dashboard.common.onDate')}:
            <span className="font-semibold text-charcoal ml-1">
              {statusDate ? new Date(statusDate).toLocaleDateString() : 'N/A'}
            </span>
          </p>
          {reptile.status === 'ceded' && (
            <p className="text-sm text-charcoal/60 truncate" title={reptile.cededTo?.name ? `${t('dashboard.status.cededTo')}: ${reptile.cededTo.name} ${reptile.cededTo.surname || ''}` : ''}>
              {t('dashboard.status.cededTo')}: {reptile.cededTo?.name ? `${reptile.cededTo.name} ${reptile.cededTo.surname || ''}` : 'N/A'}
            </p>
          )}
          {reptile.status === 'deceased' && reptile.deceasedDetails?.notes && (
            <p className="text-sm text-charcoal/60 truncate" title={`${t('dashboard.common.notes')}: ${reptile.deceasedDetails.notes}`}>
              {t('dashboard.common.notes')}: {reptile.deceasedDetails.notes}
            </p>
          )}
          {/* Visualizza note generali se presenti e non ceduto/deceduto con note specifiche */}
          {(reptile.status === 'other' || (reptile.status === 'deceased' && !reptile.deceasedDetails?.notes)) && reptile.notes && (
            <p className="text-sm text-charcoal/60 truncate" title={`${t('dashboard.common.notes')}: ${reptile.notes}`}>
              {t('dashboard.common.notes')}: {reptile.notes}
            </p>
          )}
        </div>

        {/* NUOVO: Pulsanti Azione (Edit e Delete) */}
        <div className="mt-4 pt-4 border-t border-sand grid grid-cols-2 gap-4 text-center">
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); editAction(); }}
            title={t("dashboard.buttons.edit")}
            className={`text-blue-600 p-2 rounded-lg hover:bg-blue-600/10 transition-colors duration-200`}
          >
            <FaPencilAlt />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); deleteAction(); }}
            title={t("dashboard.buttons.delete")}
            className={`text-red-600 p-2 rounded-lg hover:bg-red-600/10 transition-colors duration-200`}
          >
            <FaTrash />
          </button>
        </div>
      </div>
    </div> // Chiusura del div esterno
  );
};


const Dashboard = () => {
  // ... (tutti gli stati rimangono uguali) ...
  const user = useSelector(selectUser);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

  // NUOVO: Stato per il tab attivo
  const [activeTab, setActiveTab] = useState('active');

  // MODIFICA: Stati per gli animali ATTIVI
  const [allReptiles, setAllReptiles] = useState([]); // Animali attivi
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState('name');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [error, setError] = useState(null);
  const [filterMorph, setFilterMorph] = useState('');
  const [filterSex, setFilterSex] = useState('');
  const [filterBreeder, setFilterBreeder] = useState('');
  const [activeFilterSpecies, setActiveFilterSpecies] = useState(''); // MODIFICA: Rinominato da filterSpecies
  const [filterName, setFilterName] = useState(''); // <-- NUOVO STATO
  // NUOVO: Stati per gli animali ARCHIVIATI
  const [archivedReptiles, setArchivedReptiles] = useState([]);
  const [archivedLoading, setArchivedLoading] = useState(true);
  const [archivedSortKey, setArchivedSortKey] = useState('statusDate'); // 'statusDate' o 'species'
  const [archivedSortOrder, setArchivedSortOrder] = useState('desc');
  const [archivedPage, setArchivedPage] = useState(1);
  const [archivedTotalPages, setArchivedTotalPages] = useState(1);
  const [archivedTotalResults, setArchivedTotalResults] = useState(0);
  const [archivedError, setArchivedError] = useState(null);
  const [archivedFilterSpecies, setArchivedFilterSpecies] = useState('');
  const [archivedFilterStatus, setArchivedFilterStatus] = useState(''); // 'ceded' o 'deceased'

  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedReptile, setSelectedReptile] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFeedingModal, setShowFeedingModal] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedReptileIds, setSelectedReptileIds] = useState(new Set());
  const [showMultipleFeedingModal, setShowMultipleFeedingModal] = useState(false);
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    successRate: null,
    feedingRefusalRate: null,
    averageShedInterval: null,
    incubationBySpecies: []
  });
  const [isCalendarOpen, setCalendarOpen] = useState(false);

  const carouselRefs = useRef({});

  // ... (scrollCarousel, fetchStats, fetchReptiles, fetchArchivedReptiles, handleDelete, handleDataRefresh rimangono uguali) ...
  const scrollCarousel = (e, direction, reptileId) => {
    e.preventDefault();
    e.stopPropagation();
    const scrollAmount = 250;
    const node = carouselRefs.current[reptileId];
    if (node) {
      node.scrollBy({ left: scrollAmount * direction, behavior: 'smooth' });
    }
  };

const parseDateString = (dateStr) => {
if (!dateStr || typeof dateStr !== 'string') {
    return 'N/A';
  }  
  // 1. Estrai solo la data (es. "2025-11-01") dalla stringa API
  const dateOnly = dateStr.split('T')[0];

  // 2. Ora la logica originale funziona correttamente
  // Aggiungendo T12:00:00 si evita che new Date() interpreti la stringa
  // come UTC e la sposti al giorno prima.
  return new Date(dateOnly + 'T12:00:00').toLocaleDateString();
}
 
  const fetchStats = async () => {
    try {
      const [success, refusal, shed, incubation] = await Promise.all([
        api.get('breeding/analytics/success-rate'),
        api.get('feedings/analytics/refused-feedings'),
        api.get('reptile/analytics/shed-interval'),
        api.get('breeding/analytics/incubation')
      ]);
      setStats({
        successRate: success.data.successRate,
        feedingRefusalRate: refusal.data.refusalRate,
        averageShedInterval: Number(shed.data.averageIntervalDays),
        incubationBySpecies: incubation.data
      });

    } catch (err) {
    }

  };

  // MODIFICA: Fetch per animali ATTIVI
  const fetchReptiles = async () => {
    if (!user?._id) return;
    try {
      setLoading(true);

      const params = {
        page,
        sortKey,
        filterMorph,
        filterSpecies: activeFilterSpecies, // MODIFICA: usa lo stato rinominato
        filterSex,
        filterBreeder,
        filterName,
      };

      const { data } = await api.get(`/reptile/${user._id}/AllReptileUser`, { params });

      setAllReptiles(data.dati || []);
      setTotalPages(data.totalPages || 1);
      setTotalResults(data.totalResults || 0);

      setError(null);
    } catch (err) {
      setError(t('dashboard.errorReptile'));
    } finally {
      setLoading(false);
    }
  };

  // NUOVO: Fetch per animali ARCHIVIATI
  const fetchArchivedReptiles = async () => {
    if (!user?._id) return;
    try {
      setArchivedLoading(true);
      const params = {
        page: archivedPage,
        sortKey: archivedSortKey,
        sortOrder: archivedSortOrder,
        filterSpecies: archivedFilterSpecies,
        filterStatus: archivedFilterStatus,
      };
      const { data } = await api.get(`/reptile/user/archived`, { params });
      setArchivedReptiles(data.dati || []);
      setArchivedTotalPages(data.totalPages || 1);
      setArchivedTotalResults(data.totalResults || 0);
      setArchivedError(null);
    } catch (err) {
      setArchivedError(t('dashboard.errorArchivedReptile')); // Aggiungi questa traduzione
    } finally {
      setArchivedLoading(false);
    }
  };


  const handleDelete = async (id) => {
    try {
      await api.delete(`/reptile/${id}`);
      // MODIFICA: Esegui il refresh di entrambe le liste
      handleDataRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  // NUOVO: Funzione unica per aggiornare entrambe le liste
  const handleDataRefresh = () => {
    fetchReptiles();
    fetchArchivedReptiles();
    setSelectedReptileIds(new Set());
  }

  const handleReptileSelect = (reptileId) => {
    setSelectedReptileIds(prevSet => {
      const newSet = new Set(prevSet);
      if (newSet.has(reptileId)) {
        newSet.delete(reptileId);
      } else {
        newSet.add(reptileId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedReptileIds.size === allReptiles.length) {
      setSelectedReptileIds(new Set()); // Deseleziona tutti
    } else {
      setSelectedReptileIds(new Set(allReptiles.map(r => r._id))); // Seleziona tutti
    }
  };
  // ... (useEffect, StatCard, getPageNumbers, top3Incubations rimangono uguali) ...
  useEffect(() => {
    if (page !== 1) {
      setPage(1);
    } else if (user?._id) {
      fetchReptiles();
    }
  }, [sortKey, filterMorph, activeFilterSpecies, filterSex, filterBreeder, filterName]); // MODIFICA: usa activeFilterSpecies

  useEffect(() => {
    if (user?._id) {
      fetchReptiles();
    }
  }, [user, page]); // Rimosso fetchStats da qui

  // NUOVO: Logica useEffect per ARCHIVIATI
  useEffect(() => {
    if (archivedPage !== 1) {
      setArchivedPage(1);
    } else if (user?._id) {
      fetchArchivedReptiles();
    }
  }, [archivedSortKey, archivedSortOrder, archivedFilterSpecies, archivedFilterStatus]);

  useEffect(() => {
    if (user?._id) {
      fetchArchivedReptiles();
    }
  }, [user, archivedPage]);

  // NUOVO: useEffect per caricare STATS solo una volta
  useEffect(() => {
    if (user?._id) {
      fetchStats();
    }
  }, [user]);


  const StatCard = ({ icon, title, value, unit, bgColor, children }) => (
    <div className={`flex-1 p-4 rounded-xl shadow-md flex items-start gap-4 ${bgColor}`}>
      <div className="text-2xl text-white bg-white/20 p-3 rounded-lg">{icon}</div>
      <div>
        <p className="text-sm font-medium text-white/80">{title}</p>
        {children ? (
          <div className="text-white font-bold">{children}</div>
        ) : (
          <p className="text-2xl text-white font-bold">
            {value ?? 'N/A'}<span className="text-base ml-1">{unit}</span>
          </p>
        )}
      </div>
    </div>
  );
  // === Funzione helper per il paginatore ===
  const getPageNumbers = (currentPage, totalPages, delta = 2) => {
    const range = [];
    const rangeWithDots = [];
    let lastPage = 0;

    // range contiene: [1 ... totalPages], con "delta" pagine intorno all'attuale
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    // aggiunge "..." quando ci sono salti
    for (let i of range) {
      if (lastPage) {
        if (i - lastPage === 2) {
          rangeWithDots.push(lastPage + 1);
        } else if (i - lastPage > 2) {
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(i);
      lastPage = i;
    }

    return rangeWithDots;
  };

  const top3Incubations = React.useMemo(() => {
    if (!stats.incubationBySpecies || stats.incubationBySpecies.length === 0) return [];

    return [...stats.incubationBySpecies]
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  }, [stats.incubationBySpecies]);

  return (
    <div className="bg-clay min-h-screen font-sans text-charcoal p-4 sm:p-6 lg:p-8 relative">
      <div className="max-w-screen-xl mx-auto">
        {/* ... (Bottone Calendario, Header, Statistiche, Tabs rimangono uguali) ... */}
        {hasPaidPlan(user) && (
          <button
            onClick={() => setCalendarOpen(true)}
            title={t('dashboard.calendar')}
            className="fixed bottom-6 right-6 z-30 bg-purple-600 text-white p-4 rounded-full shadow-lg hover:bg-purple-700 transition-all duration-300 transform hover:scale-110"
          >
            <FaCalendarAlt size={24} />
          </button>
        )}


        {/* === HEADER === */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-olive">{t('dashboard.title')}</h1>
            <p className="text-charcoal/70 mt-1">
              {/* MODIFICA: Mostra il count del tab attivo */}
              {activeTab === 'active'
                ? t('dashboard.manageReptiles', { count: totalResults })
                : t('dashboard.manageArchived', { count: archivedTotalResults }) // Aggiungi questa traduzione
              }
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-forest text-white px-5 py-3 rounded-lg font-semibold hover:bg-olive transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <FaPlus />
            {t('dashboard.addReptile')}
          </button>
        </header>

        {/* === STATISTICS SECTION === */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-charcoal mb-4 flex items-center gap-2">
            <FaChartBar />{t('dashboard.quickStats')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={<FaPercentage />} title={t('dashboard.stats.successRate')} value={stats.successRate} unit="%" bgColor="bg-forest" />
            <StatCard icon={<FaUtensils />} title={t('dashboard.stats.feedingRefusal')} value={stats.feedingRefusalRate} bgColor="bg-amber" />
            <StatCard icon={<FaSyncAlt />} title={t('dashboard.stats.avgShedInterval')} value={typeof stats.averageShedInterval === 'number' ? stats.averageShedInterval.toFixed(1) : '0'} unit={t('dashboard.units.days')} bgColor="bg-blue-500" />
            <StatCard icon={<FaEgg />} title={t('dashboard.stats.incubationBySpecies')} bgColor="bg-purple-500">
              <div className="text-sm space-y-1 mt-1">
                {top3Incubations.length > 0 ? top3Incubations.map(s => (
                  <div key={s.species}>
                    <span className="font-semibold">{s.species}:</span>
                    {!isNaN(Number(s.averageIncubationDays)) ? Number(s.averageIncubationDays).toFixed(0) : 'N/A'} {t('units.days')}
                  </div>
                )) : <p className="text-base">{t('dashboard.common.noData')}</p>}
              </div>
            </StatCard>
          </div>
        </section>

        {/* NUOVO: TABS */}
        <section className="mb-8">
          <div className="flex border-b border-sand">
            <TabButton
              title={`${t('dashboard.tabs.active')} (${totalResults})`}
              isActive={activeTab === 'active'}
              onClick={() => {
                setActiveTab('active');
                setSelectedReptileIds(new Set()); // NUOVO: resetta selezione
              }} />
            <TabButton
              title={`${t('dashboard.tabs.archived')} (${archivedTotalResults})`}
              isActive={activeTab === 'archived'}
              onClick={() => {
                setActiveTab('archived');
                setSelectedReptileIds(new Set()); // NUOVO: resetta selezione
              }} />
          </div>
        </section>
        {activeTab === 'active' && selectedReptileIds.size > 0 && (
          <div className="mb-6 p-4 bg-forest/10 rounded-xl shadow-md flex flex-col sm:flex-row justify-between items-center gap-4 border border-forest">
            <div className="font-semibold text-charcoal">
              {t('dashboard.multiSelect.selected', { count: selectedReptileIds.size })}
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleSelectAll}
                className="px-4 py-2 rounded-md text-sm font-medium bg-white text-charcoal border border-gray-300 hover:bg-gray-50"
              >
                {/* MODIFICA: Mostra testo corretto se tutti sono già selezionati */}
                {selectedReptileIds.size === allReptiles.length
                  ? t('dashboard.multiSelect.deselectAll')
                  : t('dashboard.multiSelect.selectAll', { count: allReptiles.length })
                }
              </button>
              <button
                onClick={() => setShowMultipleFeedingModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-forest text-white hover:bg-olive"
              >
                <FaClipboardList />
                {t('dashboard.multiSelect.feedSelected')}
              </button>
            </div>
          </div>
        )}
        {/* ... (Filtri attivi e archiviati rimangono uguali) ... */}
        {activeTab === 'active' && (
          <>
            <div className="sm:hidden mb-4">
              <button
                onClick={() => setFiltersOpen(!filtersOpen)}
                className="w-full bg-forest text-white py-2 px-4 rounded-md font-semibold flex justify-between items-center"
              >
                {t('dashboard.filters.toggleFilters')}
                <span>{filtersOpen ? '▲' : '▼'}</span>
              </button>
            </div>

            <div
              className={`bg-sand p-4 rounded-xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8 shadow-sm
  ${!filtersOpen && 'hidden sm:grid'}`}
            >
              {/* Sort */}
              <div>
                <label className="block text-sm font-bold text-charcoal/80 mb-1">
                  {t('dashboard.filters.sortBy')}
                </label>
                <select
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value)}
                  className="w-full h-10 rounded-md border-transparent focus:ring-2 focus:ring-forest bg-white text-charcoal shadow px-2"
                >
                  <option value="name">{t('dashboard.filters.name')}</option>
                  <option value="species">{t('dashboard.filters.species')}</option>
                  <option value="nextFeedingDate">{t('dashboard.filters.nextMeal')}</option>
                <option value="lastFeedingDate">{t('dashboard.filters.lastMeal')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-charcoal/80 mb-1">
                  {t('dashboard.filters.searchName')}
                </label>
                <input
                  type="text"
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                  placeholder={t('dashboard.filters.namePlaceholder')}
                  className="w-full h-10 rounded-md border-transparent focus:ring-2 focus:ring-forest bg-white text-charcoal shadow px-2"
                />
              </div>

              {/* Morph */}
              <div>
                <label className="block text-sm font-bold text-charcoal/80 mb-1">
                  {t('dashboard.filters.searchMorph')}
                </label>
                <input
                  type="text"
                  value={filterMorph}
                  onChange={(e) => setFilterMorph(e.target.value)}
                  placeholder={t('dashboard.filters.morphPlaceholder')}
                  className="w-full h-10 rounded-md border-transparent focus:ring-2 focus:ring-forest bg-white text-charcoal shadow px-2"
                />
              </div>

              {/* Sex */}
              <div>
                <label className="block text-sm font-bold text-charcoal/80 mb-1">
                  {t('dashboard.filters.sex')}
                </label>
                <select
                  value={filterSex}
                  onChange={(e) => setFilterSex(e.target.value)}
                  className="w-full h-10 rounded-md border-transparent focus:ring-2 focus:ring-forest bg-white text-charcoal shadow px-2"
                >
                  <option value="">{t('dashboard.filters.all')}</option>
                  <option value="M">{t('dashboard.filters.male')}</option>
                  <option value="F">{t('dashboard.filters.female')}</option>
                </select>
              </div>

              {/* Species */}
              <div>
                <label className="block text-sm font-bold text-charcoal/80 mb-1">
                  {t('dashboard.filters.searchSpecies')}
                </label>
                <input
                  type="text"
                  value={activeFilterSpecies} // MODIFICA: usa stato rinominato
                  onChange={(e) => setActiveFilterSpecies(e.target.value)} // MODIFICA: usa stato rinominato
                  placeholder={t('dashboard.filters.speciesPlaceholder')}
                  className="w-full h-10 rounded-md border-transparent focus:ring-2 focus:ring-forest bg-white text-charcoal shadow px-2"
                />
              </div>

              {/* Breeder */}
              <div>
                <label className="block text-sm font-bold text-charcoal/80 mb-1">
                  {t('dashboard.filters.breeder')}
                </label>
                <select
                  value={filterBreeder}
                  onChange={(e) => setFilterBreeder(e.target.value)}
                  className="w-full h-10 rounded-md border-transparent focus:ring-2 focus:ring-forest bg-white text-charcoal shadow px-2"
                >
                  <option value="">{t('dashboard.filters.all')}</option>
                  <option value="true">{t('dashboard.common.yes')}</option>
                  <option value="false">{t('dashboard.common.no')}</option>
                </select>
              </div>
            </div>
          </>
        )}

        {/* NUOVO: CONTROLLI E FILTRI (ARCHIVIATI) */}
        {activeTab === 'archived' && (
          <div className="bg-sand p-4 rounded-xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 shadow-sm">
            {/* Sort Key */}
            <div>
              <label className="block text-sm font-bold text-charcoal/80 mb-1">
                {t('dashboard.filters.sortBy')}
              </label>
              <select
                value={archivedSortKey}
                onChange={(e) => setArchivedSortKey(e.target.value)}
                className="w-full h-10 rounded-md border-transparent focus:ring-2 focus:ring-forest bg-white text-charcoal shadow px-2"
              >
                <option value="statusDate">{t('dashboard.filters.statusDate')}</option>
                <option value="species">{t('dashboard.filters.species')}</option>
              </select>
            </div>

            {/* Species */}
            <div>
              <label className="block text-sm font-bold text-charcoal/80 mb-1">
                {t('dashboard.filters.searchSpecies')}
              </label>
              <input
                type="text"
                value={archivedFilterSpecies}
                onChange={(e) => setArchivedFilterSpecies(e.target.value)}
                placeholder={t('dashboard.filters.speciesPlaceholder')}
                className="w-full h-10 rounded-md border-transparent focus:ring-2 focus:ring-forest bg-white text-charcoal shadow px-2"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-bold text-charcoal/80 mb-1">
                {t('dashboard.filters.status')}
              </label>
              <select
                value={archivedFilterStatus}
                onChange={(e) => setArchivedFilterStatus(e.target.value)}
                className="w-full h-10 rounded-md border-transparent focus:ring-2 focus:ring-forest bg-white text-charcoal shadow px-2"
              >
                <option value="">{t('dashboard.filters.all')}</option>
                <option value="ceded">{t('dashboard.status.ceded')}</option>
                <option value="deceased">{t('dashboard.status.deceased')}</option>
              </select>
            </div>
          </div>
        )}

        {/* ... (Griglia Attivi rimane uguale) ... */}
        {activeTab === 'active' && (
          <main>
            {loading ? (
              <div className="text-center py-20">
                <div className="animate-spin h-12 w-12 border-4 border-forest border-t-transparent rounded-full mx-auto" />
                <p className="mt-4 text-charcoal/80 text-lg">{t('dashboard.common.loadingReptiles')}</p>
              </div>
            ) : allReptiles.length === 0 ? (
              <div className="text-center py-20 bg-sand rounded-xl">
                <h3 className="text-2xl font-bold text-olive">{t('dashboard.common.noReptilesFound')}</h3>
                <p className="mt-2 text-charcoal/70">
                  {totalResults > 0 ? t('dashboard.common.noReptilesFiltered') : t('dashboard.common.noReptilesRegistered')}
                </p>
                <button onClick={() => setShowCreateModal(true)} className="mt-6 flex items-center gap-2 bg-forest text-white px-5 py-3 rounded-lg font-semibold  no-underline hover:no-underline hover:bg-olive transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                  <FaPlus /> {t('dashboard.common.addFirstReptile')}
                </button>
              </div>
            ) : (

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

                {allReptiles.map(reptile => {

                  // NUOVO: Variabile per leggibilità
                  const isSelected = selectedReptileIds.has(reptile._id);

                  return (
                    <Link
                      to={`/reptiles/${reptile._id}`}
                      key={reptile._id}
                      // MODIFICA: Stili dinamici per la selezione
                      className={`bg-white rounded-2xl shadow-lg overflow-hidden group transition-all duration-300 no-underline hover:no-underline flex flex-col min-h-[460px] max-h-[460px] relative
                        ${isSelected
                          ? 'scale-[0.98] shadow-forest/30 shadow-lg' // Stato "selezionato"
                          : 'hover:-translate-y-1.5 hover:shadow-2xl' // Stato "non selezionato"
                        }`
                      }
                    >

                      {/* MODIFICA: Sostituito <input> con un <button> e icone */}
                      <button
                        type="button"
                        title={t('dashboard.buttons.select')}
                        className="absolute top-3 right-3 z-30 p-2 rounded-full bg-white/70 backdrop-blur-sm shadow-lg cursor-pointer hover:bg-white/100 transition-all duration-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handleReptileSelect(reptile._id);
                        }}
                      >
                        {isSelected ? (
                          <FaCheckSquare size={22} className="text-forest" />
                        ) : (
                          <FaRegSquare size={22} className="text-charcoal/60" />
                        )}
                      </button>

                      {/* MODIFICA: Bordo di evidenziazione (usiamo 'ring' che è più pulito di 'border') */}
                      {isSelected && (
                        <div className="absolute top-0 left-0 w-full h-full rounded-2xl ring-4 ring-forest pointer-events-none z-20"></div>
                      )}

                      <div className="relative h-[160px] w-full overflow-hidden">
                        {reptile.label?.text && (
                          <div
                            className="absolute top-2 left-2 z-20 px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg flex items-center gap-1.5"
                            style={{ backgroundColor: reptile.label.color || '#228B22' }}
                            title={reptile.label.text}
                          >
                            <FaTag size={10} /> {reptile.label.text}
                          </div>
                        )}
                        {reptile.image?.length > 1 ? (
                          <div className="relative h-full w-full">
                            <div className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar h-full" ref={(el) => (carouselRefs.current[reptile._id] = el)}>
                              {reptile.image.map((img, idx) => (
                                <img key={idx} src={`${process.env.REACT_APP_BACKEND_URL_IMAGE || ''}${img}`} alt={`${reptile.name}-${idx}`} className="object-cover w-full h-full flex-shrink-0 snap-center transition-transform duration-500  no-underline hover:no-underline group-hover:scale-105" />
                              ))}
                            </div>
                            <button onClick={(e) => scrollCarousel(e, -1, reptile._id)} className="absolute left-0 top-1/2 -translate-y-1/2 h-full w-10 bg-black/20 text-white flex items-center justify-center z-10 opacity-0  no-underline hover:no-underline group-hover:opacity-100 transition-opacity">‹</button>
                            <button onClick={(e) => scrollCarousel(e, 1, reptile._id)} className="absolute right-0 top-1/2 -translate-y-1/2 h-full w-10 bg-black/20 text-white flex items-center justify-center z-10 opacity-0  no-underline hover:no-underline group-hover:opacity-100 transition-opacity">›</button>
                          </div>
                        ) : (
                          <img src={reptile.image?.[0] ? `${process.env.REACT_APP_BACKEND_URL_IMAGE || ''}${reptile.image[0]}` : 'https://res.cloudinary.com/dg2wcqflh/image/upload/v1757791253/Logo_duqbig.png'} alt={reptile.name} className="object-cover w-full h-full transition-transform duration-500  no-underline hover:no-underline group-hover:scale-105" />
                        )}
                      </div>

                      <div className="p-4 h-[300px] flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <h3 className="text-xl font-bold text-charcoal  no-underline hover:no-underline group-hover:text-forest transition-colors duration-300 truncate">{reptile.name}</h3>
                          <span title={reptile.sex === 'M' ? 'Maschio' : 'Femmina'}>
                            {reptile.sex === 'M' && <FaMars className="text-blue-500 text-xl" />}
                            {reptile.sex === 'F' && <FaVenus className="text-pink-500 text-xl" />}
                          </span>
                        </div>
                        <p className="text-sm text-charcoal/60   no-underline hover:no-underline italic truncate">{reptile.species}</p>
                        <p className="text-sm text-charcoal/80 mt-1  no-underline hover:no-underline font-medium truncate">Morph: {reptile.morph || 'N/A'}</p>
                        <p className="text-sm text-charcoal/80  no-underline hover:no-underline">
                          {t('feedingCard.nextFeeding')} <span className={`font-semibold  no-underline hover:no-underline ${isDueOrOverdue(reptile.nextFeedingDate)
                            ? 'text-red-600'
                            : 'text-charcoal'
                            }`}>{parseDateString(reptile.nextFeedingDate)}</span>
                        </p>

                        <div className="mt-4 pt-4 border-t border-sand grid grid-cols-4 gap-2 text-center">
                          {[
                            { icon: <FaPencilAlt />, label: t("dashboard.buttons.edit"), color: "blue", action: () => { setSelectedReptile(reptile); setShowEditModal(true); } },
                            { icon: <FaDrumstickBite />, label: t("dashboard.buttons.feeding"), color: "amber", action: () => { setSelectedReptile(reptile); setShowFeedingModal(true); } },
                            { icon: <FaCalendarAlt />, label: t("dashboard.buttons.events"), color: "purple", action: () => { setSelectedReptile(reptile); setShowEventModal(true); } },
                            { icon: <FaTrash />, label: t("dashboard.buttons.delete"), color: "brick", action: () => { setPendingDelete(reptile); setShowDeleteModal(true); } }].map(btn => (
                              <button key={btn.label} onClick={(e) => { e.preventDefault(); e.stopPropagation(); btn.action(); }} title={btn.label} className={`text-${btn.color} p-2 rounded-lg hover:bg-${btn.color}/10 transition-colors duration-200`}>
                                {btn.icon}
                              </button>
                            ))}
                        </div>
                      </div>
                    </Link>
)})}
              </div>
            )}
          </main>
        )}

        {/* MODIFICA: Griglia Archiviati */}
        {activeTab === 'archived' && (
          <main>
            {archivedLoading ? (
              <div className="text-center py-20">
                <div className="animate-spin h-12 w-12 border-4 border-forest border-t-transparent rounded-full mx-auto" />
                <p className="mt-4 text-charcoal/80 text-lg">{t('dashboard.common.loadingReptiles')}</p>
              </div>
            ) : archivedReptiles.length === 0 ? (
              <div className="text-center py-20 bg-sand rounded-xl">
                <h3 className="text-2xl font-bold text-olive">{t('dashboard.common.noArchivedReptiles')}</h3>
                <p className="mt-2 text-charcoal/70">
                  {archivedTotalResults > 0 ? t('dashboard.common.noReptilesFiltered') : t('dashboard.common.noArchivedFound')}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {archivedReptiles.map(reptile => (
                  <ArchivedReptileCard
                    key={reptile._id}
                    reptile={reptile}
                    t={t}
                    carouselRefs={carouselRefs}
                    scrollCarousel={scrollCarousel}
                    // NUOVO: Passa i setter ai componenti figlio
                    setSelectedReptile={setSelectedReptile}
                    setShowEditModal={setShowEditModal}
                    setPendingDelete={setPendingDelete}
                    setShowDeleteModal={setShowDeleteModal}
                  />
                ))}
              </div>
            )}
          </main>
        )}

        {/* ... (Paginazione Attivi e Archiviati, Modali rimangono uguali) ... */}
        {activeTab === 'active' && totalPages > 1 && (
          <footer className="flex justify-center mt-8 gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className={`px-3 py-2 rounded-md font-semibold transition-colors ${page === 1 ? 'bg-sand text-gray-400 cursor-not-allowed' : 'bg-sand text-charcoal/80 hover:bg-olive/20'}`}
            >
              ‹
            </button>

            {getPageNumbers(page, totalPages).map((p, idx) =>
              p === "..." ? (
                <span key={idx} className="px-3 py-2 text-charcoal/50">...</span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-3 py-2 rounded-md font-semibold transition-colors ${p === page ? 'bg-forest text-white shadow' : 'bg-sand text-charcoal/80 hover:bg-olive/20'}`}
                >
                  {p}
                </button>
              )
            )}

            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className={`px-3 py-2 rounded-md font-semibold transition-colors ${page === totalPages ? 'bg-sand text-gray-400 cursor-not-allowed' : 'bg-sand text-charcoal/80 hover:bg-olive/20'}`}
            >
              ›
            </button>
          </footer>
        )}

        {/* NUOVO: PAGINATION (ARCHIVIATI) */}
        {activeTab === 'archived' && archivedTotalPages > 1 && (
          <footer className="flex justify-center mt-8 gap-2">
            <button
              disabled={archivedPage === 1}
              onClick={() => setArchivedPage((p) => Math.max(1, p - 1))}
              className={`px-3 py-2 rounded-md font-semibold transition-colors ${archivedPage === 1 ? 'bg-sand text-gray-400 cursor-not-allowed' : 'bg-sand text-charcoal/80 hover:bg-olive/20'}`}
            >
              ‹
            </button>

            {getPageNumbers(archivedPage, archivedTotalPages).map((p, idx) =>
              p === "..." ? (
                <span key={idx} className="px-3 py-2 text-charcoal/50">...</span>
              ) : (
                <button
                  key={p}
                  onClick={() => setArchivedPage(p)}
                  className={`px-3 py-2 rounded-md font-semibold transition-colors ${p === archivedPage ? 'bg-forest text-white shadow' : 'bg-sand text-charcoal/80 hover:bg-olive/20'}`}
                >
                  {p}
                </button>
              )
            )}

            <button
              disabled={archivedPage === archivedTotalPages}
              onClick={() => setArchivedPage((p) => Math.min(archivedTotalPages, p + 1))}
              className={`px-3 py-2 rounded-md font-semibold transition-colors ${archivedPage === archivedTotalPages ? 'bg-sand text-gray-400 cursor-not-allowed' : 'bg-sand text-charcoal/80 hover:bg-olive/20'}`}
            >
              ›
            </button>
          </footer>
        )}
      </div>
      <CalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setCalendarOpen(false)}
      />

      {/* MODIFICA: Aggiornati i callback onSuccess per refreshare entrambe le liste */}
      <ReptileCreateModal show={showCreateModal} handleClose={() => setShowCreateModal(false)} onSuccess={handleDataRefresh} setReptiles={setAllReptiles} />
      <ReptileEditModal show={showEditModal} handleClose={() => setShowEditModal(false)} reptile={selectedReptile} onSuccess={handleDataRefresh} setReptiles={setAllReptiles} />
      <FeedingModal show={showFeedingModal} handleClose={() => setShowFeedingModal(false)} reptileId={selectedReptile?._id} onSuccess={handleDataRefresh} setReptiles={setAllReptiles} />
      <MultipleFeedingModal
        show={showMultipleFeedingModal}
        handleClose={() => setShowMultipleFeedingModal(false)}
        reptileIds={selectedReptileIds}
        onSuccess={() => {
          handleDataRefresh(); // Aggiorna i dati
          setShowMultipleFeedingModal(false); // Chiude il modale
          // handleDataRefresh resetta già la selezione
        }}
      />
      <EventModal show={showEventModal} handleClose={() => setShowEventModal(false)} reptileId={selectedReptile?._id} setReptiles={setAllReptiles} onSuccess={handleDataRefresh} />
      <ConfirmDeleteModal show={showDeleteModal} onClose={() => { setShowDeleteModal(false); setPendingDelete(null); }} onConfirm={() => { if (pendingDelete?._id) { handleDelete(pendingDelete._id); } setShowDeleteModal(false); setPendingDelete(null); }} reptile={pendingDelete} />
    </div>
  );
};

export default Dashboard;