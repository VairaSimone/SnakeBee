// components/EventModal.jsx
import React, { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { postEvent, getEvents, deleteEvent } from '../services/api';

const EventModal = ({ show, handleClose, reptileId }) => {
  const [events, setEvents] = useState([]);
  const [type, setType] = useState('shed');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 5;
  const [expandedNotes, setExpandedNotes] = useState({});
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = events.slice(indexOfFirstEvent, indexOfLastEvent);
  const totalPages = Math.ceil(events.length / eventsPerPage);
  const [weight, setWeight] = useState('');

  const eventTypeLabels = {
    shed: 'Muta',
    feces: 'Feci',
    vet: 'Visita veterinaria',
      weight: 'Aggiornamento peso'

  };

  useEffect(() => {
    if (reptileId && show) {
      getEvents(reptileId).then(res => setEvents(res.data));
    }
  }, [reptileId, show]);

  const toggleNote = (id) => {
    setExpandedNotes(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleSubmit = async () => {
    if (!date) return;

      const newEvent = {
    reptileId,
    type,
    date,
    notes
  };

    if (type === 'weight') {
      if (!weight || isNaN(weight)) {
        alert("Inserisci un peso valido.");
        return;
      }
      newEvent.weight = parseFloat(weight);
    }

    await postEvent(newEvent);
    const updated = await getEvents(reptileId);
    setEvents(updated.data);
    setDate('');
    setNotes('');
    setWeight('');

  };

  const handleDelete = async (eventId) => {
    await deleteEvent(eventId);
    const updated = await getEvents(reptileId);
    setEvents(updated.data);
  };

  return (
    <Transition show={show} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
          leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
              leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all relative">
                <Dialog.Title className="text-lg font-semibold text-gray-800">📆 Eventi Rettile</Dialog.Title>

                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 text-gray-500 hover:text-red-600 text-xl"
                >
                  &times;
                </button>

                {/* FORM */}
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block font-medium text-sm mb-1 text-gray-800">Tipo evento</label>

                    <select
                      value={type}
                      onChange={(e) => {
                        setType(e.target.value);
                        if (e.target.value !== 'weight') setWeight('');
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#228B22] focus:border-[#228B22] bg-white text-gray-800 text-sm"
                    >                     <option value="shed">Muta</option>
                      <option value="feces">Feci</option>
                      <option value="vet">Visita veterinaria</option>
                      <option value="weight">Aggiornamento peso</option>

                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-sm mb-1 text-gray-800">Data evento</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#228B22] focus:border-[#228B22] bg-white text-gray-800 text-sm"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block font-medium text-sm mb-1 text-gray-800">Note (opzionale)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#228B22] focus:border-[#228B22] bg-white text-gray-800 text-sm"
                  />
                </div>

                {type === 'weight' && (
                  <div className="mt-4">
                    <label className="block font-medium text-sm mb-1 text-gray-800">Peso (grammi)</label>
                    <input
                      type="number"
                      min="0"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="Inserisci il peso in grammi"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#228B22] focus:border-[#228B22] bg-white text-gray-800 text-sm"
                    />
                  </div>
                )}


                <div className="mt-6 text-right">
                  <button
                    onClick={handleSubmit}
                    className="bg-[#228B22] text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Aggiungi evento
                  </button>
                </div>

                <hr className="my-4" />

                {/* EVENTI */}
                <div className="max-h-64 overflow-y-auto space-y-3">
                  {currentEvents.length > 0 ? (
                    currentEvents.map((e) => {
                      const isExpanded = expandedNotes[e._id];
                      const displayedNote = isExpanded || (e.notes?.length ?? 0) <= 100
                        ? e.notes
                        : e.notes.slice(0, 100) + '...';

                      return (
                        <div key={e._id} className="border border-gray-300 bg-white shadow-sm rounded-md p-3 max-w-full">
                          <div className="flex justify-between items-center mb-2">
                            <div>
                              <span className="text-sm font-bold text-purple-700">{eventTypeLabels[e.type]}</span>
                              <p className="text-xs text-gray-500">{new Date(e.date).toLocaleDateString()}</p>
                            </div>
                            <button
                              onClick={() => handleDelete(e._id)}
                              className="text-red-600 hover:underline text-sm"
                            >
                              Elimina
                            </button>
                          </div>

<div className="text-sm text-gray-800 whitespace-pre-wrap break-words overflow-hidden">
  {e.notes && (
    <>
      {displayedNote}
      {e.notes.length > 100 && (
        <button
          onClick={() => toggleNote(e._id)}
          className="ml-1 text-blue-600 text-xs hover:underline"
        >
          {isExpanded ? 'Mostra meno' : 'Mostra di più'}
        </button>
      )}
    </>
  )}

  {e.type === 'weight' && e.weight && (
    <div className="mt-2 text-sm text-gray-700">
      <span className="font-medium text-gray-800">Peso:</span> {e.weight} g
    </div>
  )}
</div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-gray-500">Nessun evento registrato.</p>
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
