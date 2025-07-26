import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../features/userSlice';
import api from '../services/api';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { validateDatesSequence } from '../utils/validateDatesSequence';
import { eventTypes, sexOptions } from '../utils/constantsBreeding.js';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

const currentYear = new Date().getFullYear();

const hatchlingSchema = yup.object({
  morph: yup.string().required('Morph è richiesto'),
  sex: yup.string().oneOf(['M', 'F', 'U']).required('Sesso è richiesto'),
  weight: yup
    .number()
    .transform((value, originalValue) =>
      String(originalValue).trim() === '' ? null : Number(originalValue)
    )
    .typeError('Peso deve essere un numero')
    .positive('Peso deve essere positivo')
    .required('Peso è richiesto'),
});

const schema = yup.object({
  male: yup.string().required('Maschio obbligatorio'),
  female: yup.string()
    .required('Femmina obbligatoria')
    .notOneOf([yup.ref('male')], 'Maschio e femmina devono essere diversi'),
  seasonYear: yup.number()
    .required('Anno stagione obbligatorio')
    .oneOf([currentYear], `L'anno deve essere ${currentYear}`), // blocco l'anno al corrente
  notes: yup.string().max(500),
  events: yup.array().of(
    yup.object({
      type: yup.string().oneOf(eventTypes.map(e => e.value)).required(),
      date: yup
        .date()
        .transform((value, originalValue) => originalValue === '' ? null : value)
        .required('Data evento obbligatoria')
        .min(new Date(currentYear, 0, 1), `Data non può essere prima del ${currentYear}`) // minimo 1 gennaio anno corrente
        .max(new Date(currentYear, 11, 31), `La data non può essere dopo il ${currentYear}`) // massimo 31 dicembre anno corrente
        .typeError('Data evento non valida'),
    })
  ).min(1, 'Almeno un evento richiesto'),
  hatchlings: yup.array().of(hatchlingSchema)
    .when('events', {
      is: (events) => events?.some(e => e.type === 'birth'),
      then: (schema) => schema.min(1, 'Almeno un cucciolo è richiesto se c’è un evento di nascita'),
      otherwise: (schema) => schema.max(0),
    }),
});

const BreedingModal = ({ show, handleClose, refresh, seasonOpen }) => {
  const user = useSelector(selectUser);
  const [reptiles, setReptiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const modalRef = useRef(null);

  const { register, control, handleSubmit, reset, formState: { errors, isValid }, setValue, watch } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      male: '',
      female: '',
      seasonYear: currentYear,
      events: [{ type: 'pairing', date: '', notes: '' }],
      hatchlings: []
    }
  });
  const eventsWatch = watch('events');
  const hasBirthEvent = eventsWatch.some(e => e.type === 'birth'); // o 'birth' se usi altro nome

  const { fields: events, append: addEvent, remove: removeEvent } = useFieldArray({ control, name: 'events' });
  const { fields: hatchlings, append: addHatchling, remove: removeHatchling } = useFieldArray({ control, name: 'hatchlings' });
  useEffect(() => {
    if (!hasBirthEvent && hatchlings.length > 0) {
      reset(prev => ({ ...prev, hatchlings: [] }));
    }
  }, [hasBirthEvent, hatchlings.length, reset]);

  // Blocco modifica seasonYear forzando valore a currentYear se viene cambiato (anche se disabilitato)
  useEffect(() => {
    const sub = watch((value, { name }) => {
      if (name === 'seasonYear' && value.seasonYear !== currentYear) {
        setValue('seasonYear', currentYear, { shouldValidate: true, shouldDirty: true });
      }
    });
    return () => sub.unsubscribe();
  }, [watch, setValue]);

  // Carico i rettili quando apro il moda
  useEffect(() => {
    if (show) {
      setLoading(true);
      api.get(`/reptile/${user._id}/allreptile`)
        .then(res => setReptiles(res.data.dati))
        .catch(() => toast.error('Errore caricamento rettili'))
        .finally(() => setLoading(false));
    } else {
      reset();
    }
  }, [show, reset, user._id]);

  // Chiudo modale cliccando fuori
  const onOverlayClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      handleClose();
    }
  };
useEffect(() => {
  if (saveSuccess) {
    handleClose();
    reset();
    refresh();
    setSaveSuccess(false);  // pulisco il flag
  }
}, [saveSuccess, handleClose, reset, refresh]);
  const onSubmit = async data => {
    setSubmitting(true);
    // validazione sequenza
    const seq = validateDatesSequence(data.events);
    if (!seq.valid) {
      toast.error(seq.message);
      setSubmitting(false);
      return;
    }

    const pairingEvent = data.events.find(e => e.type === 'pairing');
    const pairingDateISO = pairingEvent?.date ? new Date(pairingEvent.date).toISOString() : null;

    const payload = {
      male: data.male,
      female: data.female,
      ...(pairingDateISO && { pairingDate: pairingDateISO }),
      ovulationDate: data.events.find(e => e.type === 'ovulation')?.date,
      clutchDate: data.events.find(e => e.type === 'clutch')?.date,
      incubationStart: data.events.find(e => e.type === 'incubationStart')?.date,
      incubationEnd: data.events.find(e => e.type === 'incubationEnd')?.date,
      incubationNotes: data.events.find(e => e.type === 'incubationStart')?.notes,
      notes: data.notes,
      seasonYear: Number(data.seasonYear),
      hatchlings: data.hatchlings
    };

    try {
      const res = await api.post('/breeding', payload);
      const id = res.breeding._id;

      // aggiungo eventi extra e cuccioli
      await Promise.all(
        data.events.filter(e => e.type !== 'pairing')
          .map(e => api.post(`/breeding/${id}/events`, e))
      );

      toast.success('Dati salvati con successo');
    handleClose();  // chiudi prima
    reset();        // poi resetti
    refresh();

    } catch {
      toast.error('Errore salvataggio');
    } finally {
      setSubmitting(false);
    }
          setSaveSuccess(true);

  };
  useEffect(() => {
  }, [errors, isValid]);


  if (!show) return null;

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
              <Dialog.Title className="text-xl font-bold text-gray-800">Nuova Riproduzione</Dialog.Title>
              
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-gray-500 hover:text-red-600 text-2xl"
              >
                ×
              </button>

              {loading && <p className="text-center mt-4">Caricamento rettili...</p>}
              {!loading && reptiles.length === 0 && <p className="text-red-600 mt-4">Nessun rettile disponibile</p>}
              {Object.keys(errors).length > 0 && !isValid && !submitting && (
                <div className="bg-red-100 border-l-4 border-red-600 text-red-900 p-4 rounded mb-6 text-center text-lg font-semibold shadow-md mt-4">
                  ⚠️ Alcuni campi sono invalidi. Controlla i messaggi di errore in rosso.
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4" noValidate>
                {saveSuccess && (
                  <div className="bg-green-100 border-l-4 border-green-600 text-green-900 p-4 rounded mb-6 text-center text-lg font-semibold shadow-md">
                    ✅ Dati salvati correttamente!
                  </div>
                )}

      {/* Selezione maschio/femmina */}
          <div className="bg-white text-black grid grid-cols-2 gap-4">

            {['male', 'female'].map(role => (
              <div key={role}>
                <label className="capitalize">{role}</label>
                <select
                  {...register(role)}
                  disabled={!seasonOpen}
                  className="bg-white text-black border p-2 rounded w-full"
                >
                  <option value="">{`Seleziona ${role}`}</option>
                  {reptiles
                    .filter(r => r.isBreeder === true)
                    .filter(r => (role === 'male' ? r.sex === 'M' : r.sex === 'F'))
                    .map(r => (
                      <option key={r._id} value={r._id}>
                        {r.morph} ({r.sex})
                      </option>
                    ))}
                </select>
                {errors[role] && <p className="text-red-600">{errors[role].message}</p>}
              </div>
            ))}

            <div className="col-span-2">
              <label>Anno stagione</label>
              <input
                type="number"
                {...register('seasonYear')}
                disabled={true}
                readOnly
                className="bg-gray-200 text-black border p-2 rounded w-full cursor-not-allowed"
              />
              {errors.seasonYear && <p className="text-red-600">{errors.seasonYear.message}</p>}
            </div>
          </div>

          {/* Eventi */}
          <div>
            <label className="font-medium">Eventi Riproduzione</label>
            {events.map((field, idx) => (
              <div key={field.id} className="bg-white text-black flex items-end gap-2 mb-2">
                <select
                  {...register(`events.${idx}.type`)}
                  disabled={!seasonOpen}
                  className="bg-white text-black border p-2 rounded"
                >
                  {eventTypes.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                </select>
                <input
                  type="date"
                  {...register(`events.${idx}.date`)}
                  disabled={!seasonOpen}
                  min={`${currentYear}-01-01`}
                  placeholder="yyyy-mm-dd"
                  className="bg-white text-black border p-2 rounded cursor-pointer"
                  onClick={e => e.target.showPicker?.()} // Forza apertura picker su click campo (solo browser che supportano)
                  onKeyDown={e => {
                    // evita errore Invalid Date se cancello data (setta a null)
                    if (e.key === 'Delete' || e.key === 'Backspace') {
                      setValue(`events.${idx}.date`, '', { shouldValidate: true });
                    }
                  }}
                />
                {seasonOpen && (
                  <button
                    type="button"
                    disabled={field.type === 'pairing'}
                    onClick={() => removeEvent(idx)}
                    className={`bg-white text-black text-red-600 text-xl ${field.type === 'pairing' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    ✕
                  </button>)}

                {/* Errori */}
                {errors.events?.[idx]?.date && <p className="text-red-600">{errors.events[idx].date.message}</p>}
              </div>
            ))}

            {seasonOpen && (
              <select
                onChange={e => {
                  if (!e.target.value) return;
                  addEvent({ type: e.target.value, date: '', notes: '' });
                  e.target.value = '';
                }}
                className="bg-white text-black mt-2 border p-2 rounded"
              >
                <option value="">+ Aggiungi evento</option>
                {eventTypes.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
              </select>
            )}
          </div>

          <div className="mt-4">
            <label>Note generali</label>
            <textarea
              {...register('notes')}
              disabled={!seasonOpen}
              className="bg-white text-black border p-2 rounded w-full"
              rows={3}
            />
            {errors.notes && <p className="text-red-600">{errors.notes.message}</p>}
          </div>

          {/* Cuccioli */}

          {hasBirthEvent && (
            <div>
              <label className="font-medium">Cuccioli</label>
              {hatchlings.map((f, i) => (
                <div key={f.id} className="bg-white text-black flex items-end gap-2 mb-2">
                  <input
                    placeholder="Morph"
                    {...register(`hatchlings.${i}.morph`)}
                    disabled={!seasonOpen}
                    className="bg-white text-black border p-2 rounded"
                  />
                  <input
                    type="number"
                    placeholder="Peso g"
                    {...register(`hatchlings.${i}.weight`)}
                    disabled={!seasonOpen}
                    className="bg-white text-black border p-2 rounded"
                  />
                  <select
                    {...register(`hatchlings.${i}.sex`)}
                    disabled={!seasonOpen}
                    className="bg-white text-black border p-2 rounded"
                  >
                    <option value="">Sesso</option>
                    {sexOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                  {seasonOpen && (
                    <button type="button" onClick={() => removeHatchling(i)} className="text-red-600 text-xl">✕</button>
                  )}

                  {/* Errori */}
                  {errors.hatchlings?.[i]?.morph && <p className="text-red-600">{errors.hatchlings[i].morph.message}</p>}
                </div>
              ))}

              {seasonOpen && (
                <button
                  type="button"
                  onClick={() => addHatchling({ morph: '', weight: '', sex: 'U' })}
                  className="text-blue-600 mt-2"
                >
                  + cucciolo
                </button>
              )}
            </div>
          )}

                <button
                  type="submit"
                  disabled={!seasonOpen || submitting}
                  className="py-3 px-6 rounded w-full font-semibold bg-green-600 hover:bg-green-700 text-white"
                >
                  {submitting ? 'Salvando...' : 'Salva'}
                </button>
              </form>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </div>
    </Dialog>
  </Transition>
);

}

export default BreedingModal;