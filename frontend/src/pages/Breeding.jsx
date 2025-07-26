import React, { useState, useEffect } from 'react';
import api from '../services/api';
import BreedingModal from '../components/BreedingModal';
import { eventTypes } from '../utils/constantsBreeding.js';
import { toast } from 'react-toastify';
import BreedingEditModal from '../components/BreedingEditModal.jsx';
// Badge colorati + leggibili
const getBadgeColor = (type) => {
  switch (type) {
    case 'pairing': return { bg: 'bg-blue-200', text: 'text-blue-900', icon: '🔗' };
    case 'ovulation': return { bg: 'bg-yellow-200', text: 'text-yellow-900', icon: '💦' };
    case 'clutch': return { bg: 'bg-purple-200', text: 'text-purple-900', icon: '🥚' };
    case 'incubationStart': return { bg: 'bg-orange-200', text: 'text-orange-900', icon: '🔥' };
    case 'incubationEnd': return { bg: 'bg-pink-200', text: 'text-pink-900', icon: '📦' };
    case 'birth': return { bg: 'bg-green-200', text: 'text-green-900', icon: '🐣' };
    default: return { bg: 'bg-gray-200', text: 'text-gray-900', icon: '❓' };
  }
};

const Breeding = () => {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [data, setData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [eventFilter, setEventFilter] = useState('all');
  const [maleFilter, setMaleFilter] = useState('all');
  const [femaleFilter, setFemaleFilter] = useState('all');
  const [editData, setEditData] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDelete = async () => {
    try {
      await api.delete(`/breeding/${deleteTarget._id}`);
      toast.success('Riproduzione eliminata');
      fetchRecap(year);
      setShowDeleteModal(false);
      setDeleteTarget(null);
    } catch {
      toast.error("Errore durante l'eliminazione");
    }
  };

  const fetchRecap = async (y) => {
    try {
      const res = await api.get(`/breeding/season/${y}`);
          const sortedData = res.data.data.sort((a, b) => new Date(a.pairingDate) - new Date(b.pairingDate));
      setData({
        original: sortedData,
        data: sortedData,
        count: res.data.count,
      });
    } catch {
      setData(null);
    }
  };

  useEffect(() => {
    fetchRecap(year);
  }, [year]);

  const applyAllFilters = (eventType, male, female) => {
    if (!data || !data.original) return;

    let filtered = [...data.original];

    if (eventType !== 'all') {
      filtered = filtered.filter(item =>
        item.events.some(e => e.type === eventType)
      );
    }

    if (male !== 'all') {
      filtered = filtered.filter(item => item.male?.name === male);
    }

    if (female !== 'all') {
      filtered = filtered.filter(item => item.female?.name === female);
    }

      filtered.sort((a, b) => new Date(a.pairingDate) - new Date(b.pairingDate));

    setData(prev => ({ ...prev, data: filtered }));
  };

  const handleFilterChange = (value) => {
    setEventFilter(value);
    applyAllFilters(value, maleFilter, femaleFilter);
  };

  const handleMaleChange = (value) => {
    setMaleFilter(value);
    applyAllFilters(eventFilter, value, femaleFilter);
  };

  const handleFemaleChange = (value) => {
    setFemaleFilter(value);
    applyAllFilters(eventFilter, maleFilter, value);
  };

  const seasonOpen = year === currentYear;

  const maleList = [...new Set(data?.original.map(i => i.male?.name).filter(Boolean))];
  const femaleList = [...new Set(data?.original.map(i => i.female?.name).filter(Boolean))];

  return (
    <div className="p-6 max-w-5xl mx-auto animate-breeding-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Riepilogo Stagione {year}</h2>
        {seasonOpen && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
          >
            + Nuovo evento
          </button>
        )}
      </div>

      {/* FILTRI */}
      <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-800">
        <div>
          <label className="font-semibold text-gray-800">Anno:</label>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
  className="bg-white text-black border p-2 ml-2 rounded focus:outline-none focus:ring focus:border-blue-400 transition duration-200 hover:ring-2 hover:ring-blue-300"
          >
            {Array.from({ length: 5 }).map((_, i) => {
              const y = currentYear - i;
              return <option key={y} value={y}>{y}</option>;
            })}
          </select>
        </div>

        <div>
          <label className="font-semibold text-gray-800">Evento:</label>
          <select
            value={eventFilter}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="bg-white text-black border p-2 ml-2 rounded focus:outline-none focus:ring focus:border-blue-400"
          >
            <option value="all">Tutti</option>
            {eventTypes.map((e) => (
              <option key={e.value} value={e.value}>{e.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-semibold text-gray-800">Maschio:</label>
          <select
            value={maleFilter}
            onChange={(e) => handleMaleChange(e.target.value)}
            className="bg-white text-black border p-2 ml-2 rounded focus:outline-none focus:ring focus:border-blue-400"
          >
            <option value="all">Tutti</option>
            {maleList.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-semibold text-gray-800">Femmina:</label>
          <select
            value={femaleFilter}
            onChange={(e) => handleFemaleChange(e.target.value)}
            className="bg-white text-black border p-2 ml-2 rounded focus:outline-none focus:ring focus:border-blue-400"
          >
            <option value="all">Tutte</option>
            {femaleList.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* CONTENUTO */}
      {data ? (
        <>
          <p className="text-sm text-gray-700 mb-4">
            Totale eventi: <strong className="text-gray-900">{data.data.length}</strong>
          </p>

          <div className="space-y-6">
            {data.data
              .filter(item => item.male?.name && item.male.name !== 'Animale eliminato' || item.female?.name && item.female.name !== 'Animale eliminato')
              .map((item) => (<div
                key={item._id}
  className="bg-white shadow rounded-lg p-4 border-l-4 border-blue-500 hover:shadow-xl hover:bg-blue-50 transition duration-300 ease-out card-animated"
              >
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>
                    {item.pairingDate
                      ? `Accoppiamento: ${new Date(item.pairingDate).toLocaleDateString()}`
                      : ''}
                  </span>
                  <span className="text-xs bg-blue-200 text-blue-900 px-2 py-1 rounded">
                    Stagione {item.seasonYear}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mt-2">
                  {item.male?.name || '♂️ Animale eliminato'} × {item.female?.name || '♀️ Animale eliminato'}
                </h3>
                {item.notes && (
                  <div className="mt-3 text-sm text-gray-700 italic">
                    📝 <span className="font-medium">Note:</span> {item.notes}
                  </div>
                )}

                <div className="mt-3 flex flex-wrap gap-2 text-sm">
                  {[...item.events]
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .map((e, i) => {
                      const { bg, text, icon } = getBadgeColor(e.type);
                      const label = eventTypes.find((et) => et.value === e.type)?.label || e.type;
                      return (
                        <span
                          key={i}
  className={`inline-flex items-center gap-1 ${bg} ${text} px-3 py-1 rounded-full badge-animated`}
                        >

                          <span>{icon}</span>
                          <span>
                            {label} – {new Date(e.date).toLocaleDateString()}
                          </span>
                        </span>
                      );
                    })}
                </div>

                {item.hatchlings?.length > 0 && (
                  <div className="mt-3 text-green-900 text-sm font-medium">
                    🐣 Cuccioli nati: <strong>{item.hatchlings.length}</strong>
                    <ul className="list-disc list-inside mt-2 text-green-800">
                      {item.hatchlings.map((h, index) => (
                        <li key={index}>{h.name || `Cucciolo ${index + 1}`}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {seasonOpen && (
                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={() => setEditData(item)}
                      className="text-sm text-blue-700 underline btn-hover"
                    >
                      ✏️ Modifica
                    </button>
                    <button
                      onClick={() => {
                        setDeleteTarget(item);
                        setShowDeleteModal(true);
                      }}
                      className="text-sm text-red-700 underline btn-hover"
                    >
                      🗑️ Elimina
                    </button>  </div>
                )}
              </div>
              ))}
          </div>
        </>
      ) : (
        <p className="text-red-600 font-medium">Impossibile caricare il riepilogo.</p>
      )}

      <BreedingModal
        show={showModal}
        handleClose={() => {
          setShowModal(false);
          fetchRecap(year);
        }}
        refresh={() => fetchRecap(year)}
        seasonOpen={seasonOpen}
      />
      {editData && (
        <BreedingEditModal
          breeding={editData}
          show={!!editData}
          handleClose={() => setEditData(null)}
          refresh={() => fetchRecap(year)}
        />
      )}
      {showDeleteModal && deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Conferma Eliminazione</h3>
            <p className="text-gray-700 mb-6">
              Sei sicuro di voler eliminare l'evento tra <strong>{deleteTarget.male?.name}</strong> × <strong>{deleteTarget.female?.name}</strong>?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteTarget(null);
                }}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 text-black"
              >
                Annulla
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Elimina
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Breeding;
