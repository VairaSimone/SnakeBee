import React, { Fragment, useEffect, useRef, useState } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import api from '../services/api';
import { toast } from 'react-toastify';
import { eventTypes, sexOptions } from '../utils/constantsBreeding';
import { validateDatesSequence } from '../utils/validateDatesSequence';
import { Dialog, Transition } from '@headlessui/react';

const hatchlingSchema = yup.object({
  morph: yup.string().required('Morph è richiesto'),
  sex: yup.string().oneOf(['M', 'F', 'U']).required('Sesso è richiesto'),
  weight: yup.number().positive('Peso deve essere positivo').required('Peso è richiesto'),
});

const schema = yup.object({
  events: yup.array().of(
    yup.object({
      type: yup.string().oneOf(eventTypes.map(e => e.value)).required(),
      date: yup.date().typeError('Data evento obbligatoria').required('Data evento obbligatoria'),
      notes: yup.string().max(300)
    })
  ).min(1),
  hatchlings: yup.array().of(hatchlingSchema),
  notes: yup.string().max(500)
});

const BreedingEditModal = ({ breeding, show, handleClose, refresh }) => {
  const modalRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const { register, control, handleSubmit, reset, formState: { errors, isValid } } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      events: [],
      hatchlings: [],
      notes: ''
    }
  });

  const watchedEvents = useWatch({ control, name: 'events' });
const hasBirthEvent = watchedEvents?.some(e => e?.type === 'birth');

  const { fields: events, append: addEvent, remove: removeEvent } = useFieldArray({ control, name: 'events' });
  const { fields: hatchlings, append: addHatchling, remove: removeHatchling } = useFieldArray({ control, name: 'hatchlings' });

  // Chiudi modale cliccando fuori

  useEffect(() => {
    if (show && breeding) {
      const initialEvents = breeding.events.map(e => ({
        ...e,
        date: e.date ? new Date(e.date).toISOString().split('T')[0] : ''
      }));

      reset({
        events: initialEvents,
        hatchlings: breeding.hatchlings || [],
        notes: breeding.notes || ''
      });
    }
  }, [show, breeding]);

  const onSubmit = async (data) => {
    const seq = validateDatesSequence(data.events);
    if (!seq.valid) {
      toast.error(seq.message);
      return;
    }

    try {
      setLoading(true);
      await api.put(`/breeding/${breeding._id}`, {
        events: data.events,
        hatchlings: data.hatchlings,
        notes: data.notes
      });

      toast.success('Riproduzione aggiornata con successo');
      refresh();
      handleClose(); 
    } catch (err) {
      toast.error('Errore durante l’aggiornamento');
    } finally {
      setLoading(false);
    }
  };

  if (!show || !breeding) return null;
return (
<Transition show={show} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
<div className="flex min-h-screen items-start md:items-center justify-center p-4 overflow-y-auto">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                <Dialog.Title className="text-xl font-semibold text-gray-800">Modifica Riproduzione</Dialog.Title>
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 text-gray-500 hover:text-red-600 text-xl"
                >
                  &times;
                </button>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">

                  {/* Eventi */}
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-1">Eventi</label>
                    {events.map((field, idx) => (
                      <div key={field.id} className="grid md:grid-cols-4 gap-2 mb-2">
                        <select {...register(`events.${idx}.type`)} className="bg-white tx-black border p-2 rounded text-sm">
                          {eventTypes.map(e => (
                            <option key={e.value} value={e.value}>{e.label}</option>
                          ))}
                        </select>

                        <input type="date" {...register(`events.${idx}.date`)} className="bg-white tx-black border p-2 rounded text-sm" />
                        <input type="text" placeholder="Note" {...register(`events.${idx}.notes`)} className="bg-white tx-black border p-2 rounded text-sm" />

                        <button type="button" onClick={() => removeEvent(idx)} className="text-red-600 text-xl">✕</button>
                      </div>
                    ))}

                    <select
                      onChange={e => {
                        if (!e.target.value) return;
                        addEvent({ type: e.target.value, date: '', notes: '' });
                        e.target.value = '';
                      }}
                      className="bg-white tx-black border p-2 rounded text-sm mt-2"
                    >
                      <option value="">+ Aggiungi evento</option>
                      {eventTypes.map(e => (
                        <option key={e.value} value={e.value}>{e.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Cuccioli */}
{/* Cuccioli (visibili solo se c'è un evento di nascita) */}
{hasBirthEvent && (
  <div>
    <label className="block text-sm font-medium text-gray-800 mb-1">Cuccioli</label>

    {hatchlings.map((f, i) => (
      <div key={f.id} className="grid md:grid-cols-4 gap-2 mb-2">
        <input
          placeholder="Morph"
          {...register(`hatchlings.${i}.morph`)}
          className="bg-white tx-black border p-2 rounded text-sm"
        />
        <input
          type="number"
          placeholder="Peso (g)"
          {...register(`hatchlings.${i}.weight`)}
          className="bg-white tx-black border p-2 rounded text-sm"
        />
        <select
          {...register(`hatchlings.${i}.sex`)}
          className="bg-white tx-black border p-2 rounded text-sm"
        >
          <option value="">Sesso</option>
          {sexOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => removeHatchling(i)}
          className="bg-white tx-black text-red-600 text-xl"
        >
          ✕
        </button>
      </div>
    ))}

    <button
      type="button"
      onClick={() => addHatchling({ morph: '', weight: '', sex: 'U' })}
      className=" bg-white tx-blacktext-blue-600 mt-2 text-sm"
    >
      + Cucciolo
    </button>
  </div>
)}

                  {/* Note */}
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-1">Note generali</label>
                    <textarea
                      {...register('notes')}
                      className="bg-white tx-black border p-2 rounded w-full text-sm"
                      rows={3}
                    />
                    {errors.notes && <p className="text-red-600 text-sm mt-1">{errors.notes.message}</p>}
                  </div>

                  <div className="text-right">
                    <button
                      type="submit"
                      disabled={!isValid || loading}
                      className={`px-4 py-2 rounded font-semibold ${
                        isValid
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {loading ? 'Salvataggio in corso...' : 'Salva modifiche'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default BreedingEditModal;
