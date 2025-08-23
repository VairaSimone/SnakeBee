import React, { useState, useEffect, Fragment, useMemo } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { PlusIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { postEvent, getEvents, deleteEvent } from '../services/api';
import { useTranslation } from 'react-i18next';

const EventModal = ({ show, handleClose, reptileId }) => {
  const [activeTab, setActiveTab] = useState('add');
  const [allEvents, setAllEvents] = useState([]);
  const [type, setType] = useState('shed');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [weight, setWeight] = useState('');
  const [historyFilter, setHistoryFilter] = useState('all');
    const { t } = useTranslation();

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

const closeModal = () => {
  setConfirmDelete(null); 
  handleClose();          
};
  const eventTypes = {
    shed: { label: t('eventModal.types.shed'), icon: '🐍' },
    feces: { label: t('eventModal.types.feces'), icon: '💩' },
    vet: { label: t('eventModal.types.vet'), icon: '🩺' },
    weight: { label: t('eventModal.types.weight'), icon: '⚖️' },
  };

  const filteredEvents = useMemo(() => {
    return allEvents
      .filter(e => historyFilter === 'all' || e.type === historyFilter)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [allEvents, historyFilter]);



  useEffect(() => {
    if (reptileId && show) {
      setLoading(true);
      getEvents(reptileId)
        .then(res => setAllEvents(res.data || []))
        .catch(err => console.error("Errore nel caricare gli eventi", err))
        .finally(() => setLoading(false));
    } else {
      setAllEvents([]);
      setError('');
      setType('shed');
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');
      setWeight('');
      setActiveTab('add');
    }
  }, [reptileId, show]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date) {
      setError(t('eventModal.errors.requiredDate'));
      return;
    }
 const trimmedNotes = notes.trim();
  const trimmedType = type.trim();
const parsedDate = new Date(date);

// Verifica che sia un oggetto Date valido
if (isNaN(parsedDate.getTime())) {
  setError(t('eventModal.errors.invalidDate'));
  return;
}

// Limita la data: ad esempio dal 1900 a oggi + 1 anno
const minDate = new Date('1900-01-01');
const maxDate = new Date();
maxDate.setFullYear(maxDate.getFullYear() + 1);

if (parsedDate < minDate || parsedDate > maxDate) {
  setError(t('eventModal.errors.invalidDate'));
  return;
}
  const newEvent = { reptileId, type: trimmedType, date, notes: trimmedNotes };

if (trimmedType === 'weight') {
    if (!weight || weight.trim() === '') {
      setError(t('eventModal.errors.requiredWeight'));
      return;
    }
    const parsedWeight = parseFloat(weight);
    if (isNaN(parsedWeight) || parsedWeight <= 0) {
      setError(t('eventModal.errors.invalidWeight'));
      return;
    }
    newEvent.weight = parsedWeight;
  }

    setLoading(true);
    setError('');
    try {
      await postEvent(newEvent);
      const { data: updatedEvents } = await getEvents(reptileId);
      setAllEvents(updatedEvents || []);
      setNotes('');
      setWeight('');
      setActiveTab('history');
    } catch (err) {
      const msg = err.response?.data?.message || t('eventModal.errors.saveFailed');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (eventId) => {
    setLoading(true);
    try {
      await deleteEvent(eventId);
      setAllEvents(prev => prev.filter(e => e._id !== eventId));
      setConfirmDelete(null);
    } catch (err) {
      setError(t('eventModal.errors.deleteFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition show={show} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
          leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
              leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-slate-800 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-xl font-bold leading-6 text-black dark:text-black">
                  {t('eventModal.title')}
                </Dialog.Title>
                <button onClick={closeModal} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  <XMarkIcon className="h-6 w-6" />
                </button>

                <div className="mt-4 border-b border-slate-200 dark:border-slate-700">
                  <nav className="-mb-px flex space-x-6">
                    <button onClick={() => setActiveTab('add')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'add' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
                      {t('eventModal.tabs.add')}
                    </button>
                    <button onClick={() => setActiveTab('history')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'history' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
                      {t('eventModal.tabs.history')}
                    </button>
                  </nav>
                </div>

                <div className="mt-5">
                  {activeTab === 'add' && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-black dark:text-black">{t('eventModal.form.type')}</label>
                        <select value={type} onChange={e => setType(e.target.value)} className="mt-1 block w-full rounded-md border border-indigo-300 bg-indigo-50 text-black shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                          {Object.entries(eventTypes).map(([key, { label }]) => (
                            <option key={key} value={key}>{label}</option>
                          ))}
                        </select>

                      </div>


                      <div>
                        <label className="block text-sm font-medium text-black dark:text-black">{t('eventModal.form.date')}</label>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="mt-1 block w-full rounded-md border border-indigo-300 bg-indigo-50 text-black shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                      </div>

                      {type === 'weight' && (
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('eventModal.form.weight')}</label>
                          <input type="number" step="0.1" min="0" value={weight} onChange={e => setWeight(e.target.value)} placeholder={t('eventModal.form.weightPlaceholder')} required className="mt-1 block w-full rounded-md border border-indigo-300 bg-indigo-50 text-black shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-black dark:text-black">{t('eventModal.form.notes')}</label>
                        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="mt-1 block w-full rounded-md border border-indigo-300 bg-indigo-50 text-black shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                      </div>

                      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

                      <div className="pt-4 flex justify-end">
                        <button type="submit" disabled={loading} className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed">
                          <PlusIcon className="h-5 w-5 mr-2" />
                          {loading ? t('eventModal.form.saving') : t('eventModal.form.submit') }
                        </button>
                      </div>
                    </form>
                  )}


                  {activeTab === 'history' && (
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                      <div className="mb-3">
                        <label className="text-sm font-medium text-black">{t('eventModal.history.filterLabel')}</label>
                        <select
                          value={historyFilter}
                          onChange={e => setHistoryFilter(e.target.value)}
                          className="mt-1 block w-full rounded-md border border-gray-300 bg-white text-black shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                          <option value="all">{t('eventModal.history.filterAll')}</option>
                          {Object.entries(eventTypes).map(([key, { label }]) => (
                            <option key={key} value={key}>{label}</option>
                          ))}
                        </select>
                      </div>

                      {loading && <p className="text-sm text-gray-500">{t('eventModal.history.loading')}</p>}
                      {!loading && filteredEvents.length === 0 && (
                        <div className="text-center py-8">
                          <p className="text-gray-500">{t('eventModal.history.empty')}</p>
                        </div>
                      )}

                      {filteredEvents.map(event => (
                        <div
                          key={event._id}
                          className={`flex justify-between items-start p-3 rounded-lg border-l-4 shadow-sm ${event.type === 'shed' ? 'border-green-500 bg-green-50' :
                              event.type === 'feces' ? 'border-yellow-500 bg-yellow-50' :
                                event.type === 'vet' ? 'border-blue-500 bg-blue-50' :
                                  'border-purple-500 bg-purple-50'
                            }`}
                        >
                          <div>
                            <p className="font-semibold text-black flex items-center">
                              <span className="mr-2">
                                {eventTypes[event.type]?.icon || '📌'}
                              </span>
                              {new Date(event.date).toLocaleDateString('it-IT', { year: 'numeric', month: 'long', day: 'numeric' })}
                              {event.weight && <span className="ml-2 font-bold text-indigo-600">({event.weight}g)</span>}
                            </p>
                            {event.notes && <p className="mt-1 text-sm text-black">{event.notes}</p>}
                          </div>
                          <button
                            onClick={() => setConfirmDelete(event._id)}
                            className="text-red-500 hover:text-red-700 ml-4 flex-shrink-0"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {confirmDelete && (
  <div className="fixed inset-0 flex items-center justify-center bg-black/50"     onClick={() => setConfirmDelete(null)} // clic fuori chiude
>
    <div className="bg-white p-4 rounded shadow text-black"  onClick={(e) => e.stopPropagation()}>
      <p>{t('eventModal.confirmDeleteMessage')}</p>
      <div className="flex justify-end space-x-2 mt-2">
        <button
          onClick={() => setConfirmDelete(null)}
          className="px-3 py-1 bg-gray-200 rounded text-black"
        >
          {t('Cancel')}
        </button>
        <button
          onClick={() => handleDelete(confirmDelete)}
          className="px-3 py-1 bg-red-500 text-white rounded"
        >
          {t('Delete')}
        </button>
      </div>
    </div>
  </div>
)}

                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default EventModal;
