import React, { useEffect, useState } from 'react';
import api from '../services/api.js';
import { useSelector } from 'react-redux';
import { selectUser } from '../features/userSlice.jsx';
import { Link } from 'react-router-dom';
import ReptileCreateModal from '../components/ReptileCreateModal.jsx';
import ReptileEditModal from '../components/ReptileEditModal.jsx';
import FeedingModal from '../components/FeedingModal.jsx';
import BreedingModal from '../components/BreedingModal.jsx';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal.jsx';
import { FaMars, FaVenus } from 'react-icons/fa';
import EventModal from '../components/EventModal.jsx';

const Dashboard = () => {
  const user = useSelector(selectUser);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [allReptiles, setAllReptiles] = useState([]);
  const [sortedReptiles, setSortedReptiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState('name');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);
  const [filterMorph, setFilterMorph] = useState('');
  const [filterSex, setFilterSex] = useState('');
  const [filterBreeder, setFilterBreeder] = useState('');
  const [showEventModal, setShowEventModal] = useState(false);

  const [selectedReptile, setSelectedReptile] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFeedingModal, setShowFeedingModal] = useState(false);
  const [showBreedingModal, setShowBreedingModal] = useState(false);
const [stats, setStats] = useState({
  successRate: null,
  feedingRefusalRate: null,
  averageShedInterval: null,
  incubationBySpecies: []
});

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
      averageShedInterval: shed.data.averageIntervalDays,
      incubationBySpecies: incubation.data
    });
  } catch (err) {
    console.error('Errore nel recupero delle statistiche:', err);
  }
};

  const fetchReptiles = async () => {
    if (!user?._id) return;
    try {
      setLoading(true);
      const { data } = await api.get(`/reptile/${user._id}/allreptile`, { params: { page } });

      const enriched = await Promise.all(
        data.dati.map(async (r) => {
          const feedings = await api.get(`/feedings/${r._id}`).then(res => res.data.dati || []);
          const nextDate = feedings.length
            ? new Date(Math.max(...feedings.map(x => new Date(x.nextFeedingDate))))
            : null;
          return { ...r, nextFeedingDate: nextDate };
        })
      );

      setAllReptiles(enriched);
      setTotalPages(data.totalPages || 1);
      setError(null);
    } catch (err) {
      setError('Impossibile caricare i rettili');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    let filtered = [...allReptiles];

    if (filterMorph.trim() !== '') {
      filtered = filtered.filter(r => r.morph?.toLowerCase().includes(filterMorph.toLowerCase()));
    }

    if (filterSex) {
      filtered = filtered.filter(r => r.sex === filterSex);
    }

    if (filterBreeder !== '') {
      filtered = filtered.filter(r => r.isBreeder === (filterBreeder === 'true'));
    }

    const sorted = [...filtered].sort((a, b) => {
      if (sortKey === 'nextFeedingDate') {
        return new Date(a.nextFeedingDate) - new Date(b.nextFeedingDate);
      }
      return a[sortKey]?.localeCompare(b[sortKey]);
    });

    setSortedReptiles(sorted);
  }, [sortKey, allReptiles, filterMorph, filterSex, filterBreeder]);

  useEffect(() => {
    if (user?._id) {
      fetchReptiles();
      fetchStats()
    } else {
      return (
        <div className="p-4 text-center">
          <p className="text-gray-600">Utente non disponibile. Attendere o rifare il login.</p>
        </div>
      );
    }
  }, [user, page]);
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible' && user?._id) {
        fetchReptiles();
      }
    }, 1000 * 60 * 2); // ogni 2 minuti

    return () => clearInterval(interval); // pulizia
  }, [user]);
  useEffect(() => {
    const sorted = [...allReptiles].sort((a, b) => {
      if (sortKey === 'nextFeedingDate') return new Date(a.nextFeedingDate) - new Date(b.nextFeedingDate);
      return a[sortKey]?.localeCompare(b[sortKey]);
    });
    setSortedReptiles(sorted);
  }, [sortKey, allReptiles]);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/reptile/${id}`);
      fetchReptiles(); // refetch dopo eliminazione
    } catch (err) {
      console.error('Errore eliminazione rettile', err);
    }
  };

  return (
    <div className="p-4 bg-[#FAF3E0] min-h-screen animate-dashboard-fade-in">
   

   
   
   
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#2B2B2B]">La tua Dashboard</h2>
          <p className="text-sm text-gray-700">Hai {allReptiles.length} rettil{allReptiles.length !== 1 ? 'i' : 'e'} registrat{allReptiles.length !== 1 ? 'i' : 'o'}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button onClick={() => setShowCreateModal(true)} className="btn-animate bg-[#228B22] text-white px-4 py-2 rounded hover:bg-green-700">+ Aggiungi rettile</button>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-[#2B2B2B] mb-1">Ordina per:</label>
        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value)}
          className="block w-60 rounded-md border-gray-300 shadow-sm focus:ring-[#228B22] focus:border-[#228B22] bg-white text-[#2B2B2B]"
        >
          <option value="name">Nome</option>
          <option value="species">Specie</option>
          <option value="nextFeedingDate">Prossimo pasto</option>
        </select>

        <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#2B2B2B] mb-1">Cerca per Morph:</label>
            <input
              type="text"
              value={filterMorph}
              onChange={(e) => setFilterMorph(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-[#228B22] focus:border-[#228B22] bg-white text-[#2B2B2B]"
              placeholder="Inserisci morph"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2B2B2B] mb-1">Filtro Sesso:</label>
            <select
              value={filterSex}
              onChange={(e) => setFilterSex(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-[#228B22] focus:border-[#228B22] bg-white text-[#2B2B2B]"
            >
              <option value="">Tutti</option>
              <option value="M">Maschio</option>
              <option value="F">Femmina</option>
              <option value="Unknown">Sconosciuto</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2B2B2B] mb-1">Riproducibili:</label>
            <select
              value={filterBreeder}
              onChange={(e) => setFilterBreeder(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-[#228B22] focus:border-[#228B22] bg-white text-[#2B2B2B]"
            >
              <option value="">Tutti</option>
              <option value="true">Solo riproducibili</option>
              <option value="false">Non riproducibili</option>
            </select>
          </div>
        </div>

      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-green-400 border-t-transparent rounded-full mx-auto" />
          <p className="mt-2 text-gray-600">Caricamento in corso...</p>
        </div>
      ) : allReptiles.length === 0 ? (
        <div className="text-center text-gray-600">
          <p>Non hai ancora registrato nessun rettile.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 bg-[#228B22] text-white px-4 py-2 rounded hover:bg-green-700"
          >
            + Aggiungi il primo rettile
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedReptiles.map(reptile => (
            <Link
              to={`/reptiles/${reptile._id}`}
              key={reptile._id}
              className="bg-white rounded-xl shadow p-4 transition cursor-pointer relative block animate-card-appear group hover:scale-[1.02] hover:shadow-xl hover:ring-2 hover:ring-[#228B22] duration-300 ease-out card-glow"
            >
<div className="relative aspect-w-16 aspect-h-10 mb-2">
{reptile.label?.text && (
  <div
    className="
      absolute -top-2 left-2
      px-2 py-[2px]
      rounded-full text-[10px] sm:text-xs
      font-semibold text-white shadow-md z-20
      transition-transform group-hover:scale-105
      truncate
      max-w-[50%] sm:max-w-[40%] md:max-w-[30%]
            max-h-[20px] sm:max-h-[22px] md:max-h-[24px]

    "
    style={{
      backgroundColor: reptile.label.color || '#228B22',
      boxShadow: '0 1px 4px rgba(0, 0, 0, 0.2)',
      border: '1px solid rgba(255, 255, 255, 0.15)',
      backdropFilter: 'blur(2px)',
      letterSpacing: '0.3px',
      fontFamily: `'Segoe UI', 'Helvetica Neue', sans-serif`,
      lineHeight: '1.1',
      whiteSpace: 'nowrap',
    }}
    title={reptile.label.text}
  >
    {reptile.label.text}
  </div>
)}

  <img
    src={reptile.image || 'https://res.cloudinary.com/dg2wcqflh/image/upload/v1753088270/sq1upmjw7xgrvpkghotk.png'}
    alt={reptile.name}
    className="object-cover w-full h-full rounded transition-transform duration-300 ease-out group-hover:scale-105 group-hover:rotate-[0.5deg]"
  />
</div>


              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold group-hover:text-[#228B22] transition duration-300">{reptile.name}</h3>
                <span title={reptile.gender} className="transition-transform duration-300 group-hover:scale-125">
                  {reptile.sex === 'M' && <FaMars className="text-blue-600" />}
                  {reptile.sex === 'F' && <FaVenus className="text-pink-500" />}
                </span>
              </div>
              <p className="text-sm text-gray-700">Specie: {reptile.species}</p>
              <p className="text-sm text-gray-700">Morph: {reptile.morph || 'N/A'}</p>
              <p className="text-sm text-gray-700">
                Prossimo pasto: {reptile.nextFeedingDate ? new Date(reptile.nextFeedingDate).toLocaleDateString() : 'Nessuno'}
              </p>

              <div className="flex flex-wrap gap-2 mt-3">
                <button
                  onClick={(e) => {
                    e.preventDefault(); e.stopPropagation();
                    setSelectedReptile(reptile); setShowEditModal(true);
                  }}
                  className="flex-1 min-w-[90px] text-sm bg-blue-600 text-white py-1 rounded hover:bg-blue-700 hover:scale-105 transition-transform duration-200"
                >
                  Modifica
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault(); e.stopPropagation();
                    setSelectedReptile(reptile); setShowFeedingModal(true);
                  }}
                  className="flex-1 min-w-[90px] text-sm bg-orange-400 text-white py-1 rounded hover:bg-orange-700 hover:scale-105 transition-transform duration-200"
                >
                  Alimentazione
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault(); e.stopPropagation();
                    setSelectedReptile(reptile);
                    setShowEventModal(true);
                  }}
                  className="flex-1 min-w-[90px] text-sm bg-purple-600 text-white py-1 rounded hover:bg-purple-700 hover:scale-105 transition-transform duration-200"
                >
                  Eventi
                </button>

                <button
                  onClick={(e) => {
                    e.preventDefault(); e.stopPropagation();
                    setPendingDelete(reptile); setShowDeleteModal(true);
                  }}
                  className="flex-1 min-w-[90px] text-sm bg-red-500 text-white py-1 rounded hover:bg-red-700 hover:scale-105 transition-transform duration-200"
                >
                  Elimina
                </button>
              </div>
            </Link>

          ))}
        </div>
      )}

      <div className="flex justify-center mt-6 gap-2">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => setPage(i + 1)}
            className={`px-3 py-1 rounded ${i + 1 === page ? 'bg-[#228B22] text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <ReptileCreateModal
        show={showCreateModal}
        handleClose={() => setShowCreateModal(false)}
        setReptiles={setAllReptiles}
        onSuccess={fetchReptiles}
      />
      <ReptileEditModal
        show={showEditModal}
        handleClose={() => setShowEditModal(false)}
        reptile={selectedReptile}
        setReptiles={setAllReptiles}
        onSuccess={fetchReptiles}

      />
      <FeedingModal
        show={showFeedingModal}
        handleClose={() => setShowFeedingModal(false)}
        reptileId={selectedReptile?._id}
        onSuccess={fetchReptiles}
      />
      <BreedingModal
        show={showBreedingModal}
        handleClose={() => setShowBreedingModal(false)}
      />
      <EventModal
        show={showEventModal}
        handleClose={() => setShowEventModal(false)}
        reptileId={selectedReptile?._id}
      />
      <ConfirmDeleteModal
        show={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setPendingDelete(null);
        }}
        onConfirm={() => {
          if (pendingDelete?._id) {
            handleDelete(pendingDelete._id);
            setShowDeleteModal(false);
            setPendingDelete(null);
          }
        }}
        reptile={pendingDelete}
      />
    </div>
  );
};

export default Dashboard;
