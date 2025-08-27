import React, { useEffect, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { BarChart, LineChart, XAxis, YAxis, Tooltip, Legend, Bar, Line, ResponsiveContainer, CartesianGrid } from 'recharts';
import { PlusIcon, CalendarIcon, PencilIcon, TrashIcon, ChevronDownIcon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import api from '../services/api';
import Modal from '../components/BreedingModal.jsx';
import { selectUser } from '../features/userSlice.jsx';
import { useTranslation } from 'react-i18next';
import Select from "react-select";

const FilterBar = ({ yearFilter, setYearFilter, onFiltersChange }) => {
  const [speciesFilter, setSpeciesFilter] = useState("");
  const [morphFilter, setMorphFilter] = useState("");
  const { t } = useTranslation();


  const handleChange = (field, value) => {
    if (field === "species") setSpeciesFilter(value);
    if (field === "morph") setMorphFilter(value);
    onFiltersChange({ species: field === "species" ? value : speciesFilter, morph: field === "morph" ? value : morphFilter });
  };

  return (
    <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200/80">
      <div className="relative">
        <select
          className="input-field appearance-none pr-10 text-black"
          value={yearFilter}
          onChange={e => setYearFilter(Number(e.target.value))}
        >
          {[...Array(10)].map((_, i) => {
            const year = new Date().getFullYear() - i;
            return <option key={year} value={year}>{year}</option>;
          })}
        </select>
        <ChevronDownIcon className="w-5 h-5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>

      {/* Filtro Nome */}
      <div className="relative flex-1">
        <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder={t('breedingDashboard.speciesFilter')}
          value={speciesFilter}
          onChange={e => handleChange("species", e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {/* Filtro Morph */}
      <div className="relative flex-1">
        <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder={t('breedingDashboard.comboFilter')}
          value={morphFilter}
          onChange={e => handleChange("morph", e.target.value)}
          className="input-field pl-10"
        />
      </div>
    </div>
  );
}

function Toast({ message, type = 'error', onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => onClose(), 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    error: 'bg-red-100 text-red-800 border-red-300',
    success: 'bg-green-100 text-green-800 border-green-300',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    info: 'bg-blue-100 text-blue-800 border-blue-300',
  };

  return (
    <div
      className={`fixed top-6 right-6 px-4 py-2 rounded-lg shadow-md border ${colors[type]} transition-opacity`}
    >
      {message}
    </div>
  );
}
const OUTCOME_ENUM = ['Success', 'Partial', 'Failed', 'Unknown'];
const useBreedingTranslator = () => {
  const { t } = useTranslation();
  const map = {
    Mating: t('breedingDashboard.breedingOutcomes.Mating'),
    Ovulation: t('breedingDashboard.breedingOutcomes.Ovulation'),
    'Prelay Shed': t('breedingDashboard.breedingOutcomes.PrelayShed'),
    'Egg Laid': t('breedingDashboard.breedingOutcomes.EggLaid'),
    Birth: t('breedingDashboard.breedingOutcomes.Birth'),
    Hatching: t('breedingDashboard.breedingOutcomes.Hatching'),
    Failed: t('breedingDashboard.breedingOutcomes.Failed'),
    Success: t('breedingDashboard.breedingOutcomes.Success'),
    Partial: t('breedingDashboard.breedingOutcomes.Partial'),
    Unknown: t('breedingDashboard.breedingOutcomes.Unknown'),
  };
  return (key) => map[key] || key;
};

function hasPaidPlan(user) {
  if (!user?.subscription) return false;
  const { plan, status } = user.subscription;
  return (plan === 'PRACTITIONER' || plan === 'BREEDER');
}
const formatDate = (date) => new Date(date).toLocaleDateString('it-IT', { year: 'numeric', month: 'short', day: 'numeric' });

const StatCard = ({ title, children }) => (
  <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200/80">
    <h3 className="text-lg font-semibold text-charcoal mb-4">{title}</h3>
    <div style={{ width: '100%', height: 250 }}>
      <ResponsiveContainer>
        {children}
      </ResponsiveContainer>
    </div>
  </div>
);

const BreedingCard = ({ breeding, onAddEvent, onUpdateOutcome, onEditEvent, onDeleteEventRequest, onDeleteBreedingRequest }) => {
  const { t } = useTranslation();
  const translate = useBreedingTranslator();

  const [showAllEvents, setShowAllEvents] = useState(false);
  const outcomeColors = {
    Success: 'bg-green-100 text-green-800',
    Partial: 'bg-amber/20 text-amber',
    Failed: 'bg-red-100 text-red-700',
    Unknown: 'bg-slate-100 text-slate-600',
  };
  const eventsToShow = showAllEvents ? breeding.events : breeding.events?.slice(-5);


  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden transition-shadow duration-300 hover:shadow-lg">
      {/* Header card */}
      <div className="p-4 border-b border-slate-200 flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold text-charcoal">
            {breeding.male?.name || breeding.male?.morph} <span className="font-light text-slate-400 mx-1">×</span> {breeding.female?.name || breeding.female?.morph}
          </h3>
          <p className="text-sm text-slate-500">{breeding.species} – <span className="italic">{breeding.morphCombo || ''}</span></p>
        </div>
        <div className={`text-xs font-semibold px-3 py-1 rounded-full ${outcomeColors[breeding.outcome]}`}>
          {translate(breeding.outcome)}
        </div>
            <button
      onClick={() => onDeleteBreedingRequest(breeding._id)}
      className="text-slate-400 hover:text-red-500 transition-colors"
    >
      <TrashIcon className="w-5 h-5" />
    </button>
      </div>

      {/*  Card */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 border-b border-slate-200 flex justify-between items-start">


          <div className="md:col-span-1 space-y-3">
            <h4 className="font-semibold text-slate-700">{t('breedingDashboard.detailsClutch')}</h4>
            <div className="text-sm space-y-2">
              <p><span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${breeding.isLiveBirth ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>{breeding.isLiveBirth ? t('breedingDashboard.liveBirth') : t('breedingDashboard.oviparous')}</span></p>
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-slate-50 rounded-lg p-2 text-center">
                  <p className="text-xs text-slate-500">{t('breedingDashboard.total')}</p>
                  <p className="text-lg font-bold text-green-800">{breeding.clutchSize?.total || 0}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-2 text-center">
                  <p className="text-xs text-slate-500">{t('breedingDashboard.fertile')}</p>
                  <p className="text-lg font-bold text-green-700">{breeding.clutchSize?.fertile || 0}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-2 text-center">
                  <p className="text-xs text-slate-500">{t('breedingDashboard.hatchedOrBorn')}</p>
                  <p className="text-lg font-bold text-green-600">{breeding.clutchSize?.hatchedOrBorn || 0}</p>
                </div>
              </div>
            </div>
            <div className="pt-2 flex flex-wrap gap-2">
              <button onClick={() => onAddEvent(breeding._id)} className="btn btn-sm btn-primary-outline">
                <PlusIcon className="w-4 h-4 mr-1.5" /> {t('breedingDashboard.buttons.addEvent')}
              </button>
              <button onClick={() => onUpdateOutcome(breeding._id)} className="btn btn-sm btn-secondary-outline">
                {t('breedingDashboard.buttons.updateOutcome')}
              </button>
            </div>
          </div>
          </div>

          {/* Event */}
          <div className="md:col-span-2">
            <h4 className="font-semibold text-slate-700 mb-2">{t('breedingDashboard.eventsRegistered')}</h4>
            {eventsToShow?.length > 0 ? (
              <ul className="space-y-2 text-sm">
                {eventsToShow.map(event => (
                  <li key={event._id} className="flex justify-between items-center p-2 rounded-lg">
                    <div className="flex items-center">
                      <CalendarIcon className="w-4 h-4 mr-2 text-slate-400" />
                      <div>
                        <span className="font-semibold text-slate-700">{translate(event.type)}</span>
                        <p className="text-xs text-slate-500">{formatDate(event.date)}</p>
                        {event.notes && <p className="text-xs text-slate-400 italic">"{event.notes}"</p>}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button onClick={() => onEditEvent(breeding._id, event)} className="text-slate-400 hover:text-blue-500 transition-colors">
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button onClick={() => onDeleteEventRequest(breeding._id, event._id)} className="text-slate-400 hover:text-red-500 transition-colors">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-4 px-2 rounded-lg">
                <p className="text-sm text-slate-500">{t('breedingDashboard.noEvents')}</p>
              </div>
            )}

            {/* Pulsante mostra tutti / mostra meno */}
            {breeding.events?.length > 5 && (
              <button
                className="mt-2 text-sm text-blue-500 hover:underline"
                onClick={() => setShowAllEvents(!showAllEvents)}
              >
                {showAllEvents ? t('breedingDashboard.showLess') : t('breedingDashboard.showAll')}
              </button>
            )}
          </div>
        </div>
      </div>
      
      );
};


      export default function BreedingPage() {
  const [reptiles, setReptiles] = useState([]);
      const [breedings, setBreedings] = useState([]);
      const user = useSelector(selectUser);
      const [editingEventId, setEditingEventId] = useState(null);
      const [showConfirmModal, setShowConfirmModal] = useState(false);
      const [eventToDelete, setEventToDelete] = useState(null);
      const [selectedBreedingId, setSelectedBreedingId] = useState(null);
      const [showEventModal, setShowEventModal] = useState(false);
      const [showOutcomeModal, setShowOutcomeModal] = useState(false);
      const [eventData, setEventData] = useState({type: '', date: '', notes: '' });
      const [yearFilter, setYearFilter] = useState(new Date().getFullYear());
      const [showModal, setShowModal] = useState(false);
      const {t} = useTranslation();
      const [formData, setFormData] = useState({male: '', female: '', species: '', morphCombo: '', isLiveBirth: false });
      const [outcomeData, setOutcomeData] = useState({outcome: '', clutchSize: {total: '', fertile: '', hatchedOrBorn: '' } });
      const [toast, setToast] = useState({show: false, message: '', type: 'error' });
      const translate = useBreedingTranslator();
      const [filters, setFilters] = useState({species: "", morph: "" });
      const [eventError, setEventError] = useState("");

  const filteredBreedings = useMemo(() => {
    return breedings.filter(b => {
      const matchSpecies = filters.species ?
      (b.species?.toLowerCase().includes(filters.species.toLowerCase()))
      : true;
      const matchMorph = filters.morph ?
      (b.morphCombo?.toLowerCase().includes(filters.morph.toLowerCase()))
      : true;
      return matchSpecies && matchMorph;
    });
  }, [breedings, filters]);

  const showToast = (message, type = 'error') => {
        setToast({ show: true, message, type });
  };
  const closeToast = () => setToast({...toast, show: false });

  const handleAddEvent = (breedingId) => {
        setSelectedBreedingId(breedingId);
      setEditingEventId(null);
      setEventData({type: '', date: '', notes: '' });
      setShowEventModal(true);
  };

  const requestDeleteEvent = (bid, eid) => {
        setEventToDelete({ bid, eid });
      setShowConfirmModal(true);
  };

  const confirmDeleteEvent = async () => {
    if (!eventToDelete) return;
      const {bid, eid} = eventToDelete;
      try {
        await api.delete(`/breeding/${bid}/event/${eid}`);
      setBreedings(prev =>
        prev.map(b => b._id === bid
      ? {...b, events: b.events.filter(ev => ev._id !== eid) }
      : b
      )
      );
    } catch (error) {
        showToast(t('breedingDashboard.errors.deleteEvent'), 'error');
    } finally {
        setShowConfirmModal(false);
      setEventToDelete(null);
    }
  };
      const [breedingToDelete, setBreedingToDelete] = useState(null);
  const requestDeleteBreeding = (bid) => {
        setBreedingToDelete(bid);
      setShowConfirmModal(true);
  };

  const confirmDeleteBreeding = async () => {
    if (!breedingToDelete) return;
      try {
        await api.delete(`/breeding/${breedingToDelete}`);
      setBreedings(prev => prev.filter(b => b._id !== breedingToDelete));
      setShowConfirmModal(false);
      setBreedingToDelete(null);
      showToast(t('breedingDashboard.successDeletePair'), 'success');
    } catch (err) {
        showToast(err.response?.data?.error || t('breedingDashboard.errors.deletePair'), 'error');
    }
  };
  const handleUpdateOutcome = (breedingId) => {
    const breeding = breedings.find(b => b._id === breedingId);
      setOutcomeData({
        outcome: 'Unknown',
      clutchSize: {
        total: breeding?.clutchSize?.total || '',
      fertile: breeding?.clutchSize?.fertile || '',
      hatchedOrBorn: breeding?.clutchSize?.hatchedOrBorn || ''
      }
    });
      setSelectedBreedingId(breedingId);
      setShowOutcomeModal(true);
  };

  const submitOutcome = async () => {
    try {
      const payload = {
        outcome: outcomeData.outcome,
      clutchSize: {
        total: outcomeData.clutchSize.total ? Number(outcomeData.clutchSize.total) : undefined,
      fertile: outcomeData.clutchSize.fertile ? Number(outcomeData.clutchSize.fertile) : undefined,
      hatchedOrBorn: outcomeData.clutchSize.hatchedOrBorn ? Number(outcomeData.clutchSize.hatchedOrBorn) : undefined
        }
      };
      await api.patch(`/breeding/${selectedBreedingId}/outcome`, payload);
      setBreedings(prev =>
        prev.map(b =>
      b._id === selectedBreedingId
      ? {...b, outcome: payload.outcome || b.outcome, clutchSize: {...b.clutchSize, ...payload.clutchSize } }
      : b
      )
      );
      setShowOutcomeModal(false);
    } catch (err) {
        showToast(err.response?.data?.error || t('breedingDashboard.errors.updateOutcome'), 'error');
    }
  };
  const extractErrorMessage = (err) => {
    if (!err) return "Unknown error";
      if (err.response?.data?.error) return err.response.data.error;
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) return err.response.data.errors.join(', ');
      return err.message || "Unknown error";
  };
  const submitEvent = async () => {
    if (!eventData.type || !eventData.date) {
        setEventError(t('breedingDashboard.errors.missingEventFields'));
      return;
    }
      try {
      const res = await api.post(`/breeding/${selectedBreedingId}/event`, eventData);
      const updatedBreeding = res.data;
      setBreedings(prev => prev.map(b => b._id === selectedBreedingId ? updatedBreeding : b));
      setShowEventModal(false);
      setEventError(""); // reset errore
    } catch (err) {
      const msg = err.response?.data?.error || t('breedingDashboard.errors.createPair');
      setEventError(msg); // mostra l'errore dentro il modale
    }
  };

  const openEditEventModal = (bid, ev) => {
        setSelectedBreedingId(bid);
      setEventData({type: ev.type, date: ev.date.split('T')[0], notes: ev.notes });
      setEditingEventId(ev._id);
      setShowEventModal(true);
  };

  const submitEditEvent = async () => {
    try {
      const res = await api.patch(`/breeding/${selectedBreedingId}/event/${editingEventId}`, eventData);
      const updatedBreeding = res.data;
      setBreedings(prev => prev.map(b => b._id === selectedBreedingId ? updatedBreeding : b));
      setShowEventModal(false);
      setEditingEventId(null);
      setEventError(""); // reset errore
    } catch (err) {
      const msg = err.response?.data?.error || t('breedingDashboard.errors.updateEvent');
      setEventError(msg); // mostra l'errore dentro il modale
    }
  };

const handleSubmit = async () => {
  try {
    if (!formData.male || !formData.female || !formData.species) {
      showToast(t('breedingDashboard.errors.mandatoryFields'), 'warning');
      return;
    }
    const payload = { ...formData, year: yearFilter };
    await api.post('/breeding', payload);

    // subito dopo ricarichi tutto
    const res = await api.get(`/breeding?year=${yearFilter}`);
    setBreedings(res.data);

    setShowModal(false);
    setFormData({ male: '', female: '', species: '', morphCombo: '', isLiveBirth: false });
  } catch (err) {
    showToast(err.response?.data?.error || t('breedingDashboard.errors.missingEventFields'), 'error');
  }
};

  useEffect(() => {
        api.get(`/reptile/${user._id}/allreptile`)
          .then(res => {
            if (!Array.isArray(res.data.dati)) return;
            const breeders = res.data.dati.filter(r => r.isBreeder);
            setReptiles(breeders);
          })
          .catch(err => console.error('Error', err));
  }, [user._id]);

  useEffect(() => {
    if (!user._id) return;
      api.get(`/breeding?year=${yearFilter}`)
      .then(res => {
        if (!Array.isArray(res.data)) return;
        const sortedBreedings = res.data.map(b => ({
        ...b,
        events: b.events.sort((a, b) => new Date(b.date) - new Date(a.date))
        }));
      setBreedings(sortedBreedings);
      })
      .catch(err => console.error('Error:', err));
  }, [yearFilter, user._id]);

  const monthlyEventsData = useMemo(() => {
    const months = Array(12).fill(0).map((_, i) => ({
        name: new Date(0, i).toLocaleString(user.language, {month: 'short' }),
      Deposizioni: 0,
      Schiuse: 0,
    }));
    breedings.forEach(b => {
        b.events?.forEach(e => {
          const month = new Date(e.date).getMonth();
          if (e.type === 'Egg Laid' || e.type === 'Birth') {
            months[month].Deposizioni++;
          } else if (e.type === 'Hatching') {
            months[month].Schiuse++;
          }
        });
    });
      return months;
  }, [breedings]);

  const yearlySuccessData = useMemo(() => {
    const map = { };
    breedings.forEach(b => {
      const y = b.year;
      map[y] = map[y] || {year: y, total: 0, success: 0 };
      map[y].total++;
      if (b.outcome === 'Success') map[y].success++;
    });
      return Object.values(map)
      .sort((a, b) => a.year - b.year)
      .map(o => ({
        year: o.year,
        'Tasso di Successo': o.total > 0 ? +(100 * o.success / o.total).toFixed(1) : 0
      }));
  }, [breedings]);

      const uniqueSpecies = [
      ...new Map(
      reptiles
        .filter(r => r.species)
        .map(r => [r.species.trim().toLowerCase(), r.species.trim()])
      ).values()
      ];
      {
        !hasPaidPlan(user) && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center z-50">
            <h2 className="text-2xl font-bold text-brick">{t('breedingDashboard.restrictedAccessTitle')}</h2>
            <p className="text-charcoal mt-2">{t('breedingDashboard.restrictedAccessUpgrade')}</p>
          </div>
        )
      }
      return (


      <div className="">
        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="relative">
            {/* Banner fisso */}
            <div className="">
              <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="relative">
                  {/* Banner fisso */}
                  {!hasPaidPlan(user) && (
                    <div className="sticky top-0 z-50 bg-yellow-100 border-b border-yellow-300 text-yellow-800 px-4 py-3 text-center font-medium mb-6">
                      🔒 {t('breedingDashboard.restrictedAccessBanner')}
                    </div>
                  )}
                </div>
              </main>
            </div>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-charcoal mb-4">{t('breedingDashboard.dashboardTitle')}</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <StatCard title={t('breedingDashboard.eventsPerMonth', { year: yearFilter })}>
                  <BarChart data={monthlyEventsData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fill: '#64748b' }} fontSize={12} />
                    <YAxis tick={{ fill: '#64748b' }} fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }} />
                    <Legend wrapperStyle={{ fontSize: '0.875rem' }} />
                    <Bar dataKey="Deposizioni" fill="#3b82f6" name="Deposizioni/Parti" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Schiuse" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </StatCard>
                <StatCard title={t('breedingDashboard.yearlySuccessRate')}>
                  <LineChart data={yearlySuccessData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="year" tick={{ fill: '#64748b' }} fontSize={12} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#64748b' }} fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }} />
                    <Line type="monotone" dataKey="Tasso di Successo" stroke="#228B22" strokeWidth={3} dot={{ r: 5, fill: '#228B22' }} activeDot={{ r: 8 }} />
                  </LineChart>
                </StatCard>
              </div>
            </section>

            <section>
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold text-charcoal">{t('breedingDashboard.breedingOfYear', { year: yearFilter })}</h2>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <FilterBar
                      yearFilter={yearFilter}
                      setYearFilter={setYearFilter}
                      onFiltersChange={setFilters}
                    />


                  </div>
                  <button className="btn btn-primary" disabled={!hasPaidPlan(user)} onClick={() => setShowModal(true)}>
                    <PlusIcon className="w-5 h-5 mr-2" />
                    {t('breedingDashboard.newPair')}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {filteredBreedings.length > 0 ? (
                  filteredBreedings.map(b => (
                    <BreedingCard
                      key={b._id}
                      breeding={b}
                      onAddEvent={handleAddEvent}
                      onUpdateOutcome={handleUpdateOutcome}
                      onEditEvent={openEditEventModal}
                      onDeleteEventRequest={requestDeleteEvent}
                      onDeleteBreedingRequest={requestDeleteBreeding}
                    />
                  ))
                ) : (
                  <div className="xl:col-span-2 text-center py-16 px-6 bg-white rounded-2xl shadow-sm border border-slate-200/80">

                    <h3 className="text-xl font-semibold text-charcoal">{t('breedingDashboard.noPairsTitle', { year: yearFilter })}</h3>
                    <p className="text-slate-500 mt-2">{t('breedingDashboard.noPairsDescription')}</p>
                    <button className="btn btn-primary mt-6" disabled={!hasPaidPlan(user)} onClick={() => setShowModal(true)}>
                      <PlusIcon className="w-5 h-5 mr-2" />
                      {t('breedingDashboard.addFirstPair')}
                    </button>
                  </div>
                )}
              </div>
            </section>
          </div>

        </main>

{showModal && (
  <Modal onClose={() => setShowModal(false)}>
    <h2 className="text-2xl font-bold text-charcoal mb-6">
      {t('breedingDashboard.createNewPair')}
    </h2>
    <div className="space-y-4">
      
      {/* SPECIE */}
      <Select
        className="react-select-container"
        classNamePrefix="react-select"
        placeholder={t('breedingDashboard.selectSpecies')}
        value={
          formData.species
            ? { value: formData.species, label: formData.species }
            : null
        }
        onChange={(opt) =>
          setFormData({ ...formData, species: opt.value, male: '', female: '' })
        }
        options={uniqueSpecies.map((species) => ({
          value: species,
          label: species,
        }))}
    
      />

      {/* MASCHIO */}
      <Select
        className="react-select-container"
        classNamePrefix="react-select"
        placeholder={t('breedingDashboard.selectMale')}
        value={
          reptiles.find((r) => r._id === formData.male)
            ? {
                value: formData.male,
                label: `${
                  reptiles.find((r) => r._id === formData.male)?.name ||
                  'Senza nome'
                } (${
                  reptiles.find((r) => r._id === formData.male)?.morph ||
                  'Classic'
                })`,
              }
            : null
        }
        onChange={(opt) => setFormData({ ...formData, male: opt?.value || '' })}
        options={reptiles
          .filter(
            (r) =>
              r.sex === 'M' &&
              r.species?.trim().toLowerCase() ===
                formData.species?.trim().toLowerCase()
          )
          .map((r) => ({
            value: r._id,
            label: `${r.name || 'Senza nome'} (${r.morph || 'Classic'})`,
          }))}
        isDisabled={!formData.species}
      />

      {/* FEMMINA */}
      <Select
        className="react-select-container"
        classNamePrefix="react-select"
        placeholder={t('breedingDashboard.selectFemale')}
        value={
          reptiles.find((r) => r._id === formData.female)
            ? {
                value: formData.female,
                label: `${
                  reptiles.find((r) => r._id === formData.female)?.name ||
                  'Senza nome'
                } (${
                  reptiles.find((r) => r._id === formData.female)?.morph ||
                  'Classic'
                })`,
              }
            : null
        }
        onChange={(opt) =>
          setFormData({ ...formData, female: opt?.value || '' })
        }
        options={reptiles
          .filter(
            (r) =>
              r.sex === 'F' &&
              r.species?.trim().toLowerCase() ===
                formData.species?.trim().toLowerCase()
          )
          .map((r) => ({
            value: r._id,
            label: `${r.name || 'Senza nome'} (${r.morph || 'Classic'})`,
          }))}
        isDisabled={!formData.species}
      />

      {/* MORPH COMBO */}
      <input
        className="input-field"
        type="text"
        placeholder="Morph Combo (es. Pastel x Banana)"
        value={formData.morphCombo}
        onChange={(e) =>
          setFormData({ ...formData, morphCombo: e.target.value })
        }
      />

      {/* LIVE BIRTH */}
      <label className="flex items-center space-x-3 cursor-pointer">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-slate-300 text-forest focus:ring-forest/50"
          checked={formData.isLiveBirth}
          onChange={(e) =>
            setFormData({ ...formData, isLiveBirth: e.target.checked })
          }
        />
        <span className="text-slate-700">
          {t('breedingDashboard.isLiveBirth')}
        </span>
      </label>

      <button className="btn btn-primary w-full" onClick={handleSubmit}>
        {t('breedingDashboard.savePair')}
      </button>
    </div>
  </Modal>
)}
        {showEventModal && (
          <Modal onClose={() => { setShowEventModal(false); setEditingEventId(null); }}>
            <h2 className="text-2xl font-bold text-charcoal mb-6">{editingEventId ? t('breedingDashboard.editEvent') : t('breedingDashboard.addEvent')}</h2>
            <div className="space-y-4">
              <select
                value={eventData.type}
                onChange={e => setEventData({ ...eventData, type: e.target.value, typeError: false })}
                className={`${eventData.typeError ? 'border-red-500' : ''} input-field`}
              >
                <option value="">{t('breedingDashboard.eventType')}</option>
                {['Mating', 'Ovulation', 'Prelay Shed', 'Egg Laid', 'Birth', 'Hatching', 'Failed'].map(key => (
                  <option key={key} value={key}>{t(`breedingDashboard.breedingOutcomes.${key.replace(/\s+/g, '')}`)}</option>
                ))}
              </select>
              <input type="date" className="input-field" value={eventData.date} onChange={e => setEventData({ ...eventData, date: e.target.value })} />
              <input type="text" placeholder={t('breedingDashboard.eventNotes')} className="input-field" value={eventData.notes} onChange={e => setEventData({ ...eventData, notes: e.target.value })} />
              {eventError && <p className="text-red-600 text-sm">{eventError}</p>}

              <button className="btn btn-primary w-full" onClick={editingEventId ? submitEditEvent : submitEvent}>
                {editingEventId ? t('breedingDashboard.editEvent') : t('breedingDashboard.saveEvent')}
              </button>
            </div>
          </Modal>
        )}

        {showOutcomeModal && (
          <Modal onClose={() => setShowOutcomeModal(false)}>
            <h2 className="text-2xl font-bold text-charcoal mb-6">{t('breedingDashboard.updateOutcome')}</h2>
            <div className="space-y-4">
              <select
                className="input-field"
                value={outcomeData.outcome}
                onChange={e => setOutcomeData(d => ({ ...d, outcome: e.target.value }))}
              >
                <option value="">{t('breedingDashboard.selectOutcome')}</option>
                {OUTCOME_ENUM.map(key => (
                  <option key={key} value={key}>
                    {translate(key)}
                  </option>
                ))}
              </select>
              <input className="input-field" type="number" placeholder={t('breedingDashboard.totalClutch')} value={outcomeData.clutchSize.total} onChange={e => setOutcomeData(d => ({ ...d, clutchSize: { ...d.clutchSize, total: e.target.value } }))} />
              <input className="input-field" type="number" placeholder={t('breedingDashboard.fertileClutch')} value={outcomeData.clutchSize.fertile} onChange={e => setOutcomeData(d => ({ ...d, clutchSize: { ...d.clutchSize, fertile: e.target.value } }))} />
              <input className="input-field" type="number" placeholder={t('breedingDashboard.hatchedOrBorn')} value={outcomeData.clutchSize.hatchedOrBorn} onChange={e => setOutcomeData(d => ({ ...d, clutchSize: { ...d.clutchSize, hatchedOrBorn: e.target.value } }))} />
              {eventError && <p className="text-red-600 text-sm">{eventError}</p>}

              <button className="btn btn-secondary w-full" onClick={submitOutcome}>{t('breedingDashboard.saveOutcome')}</button>

            </div>
          </Modal>
        )}

        {showConfirmModal && (
          <Modal onClose={() => { setShowConfirmModal(false); setEventToDelete(null); setBreedingToDelete(null); }}>
            <h2 className="text-2xl font-bold text-charcoal mb-4">
              {eventToDelete ? t('breedingDashboard.confirmDeleteEventTitle') : t('breedingDashboard.confirmDeletePairTitle')}
            </h2>
            <p className="text-slate-600 mb-6">
              {eventToDelete ? t('breedingDashboard.confirmDeleteEventMessage') : t('breedingDashboard.confirmDeletePairMessage')}
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowConfirmModal(false)} className="btn btn-secondary-outline">
                {t('breedingDashboard.cancel')}
              </button>
              <button
                onClick={eventToDelete ? confirmDeleteEvent : confirmDeleteBreeding}
                className="btn btn-danger"
              >
                {t('breedingDashboard.confirmDelete')}
              </button>
            </div>
          </Modal>
        )}

        {toast.show && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={closeToast}
          />
        )}

      </div>

      );
}