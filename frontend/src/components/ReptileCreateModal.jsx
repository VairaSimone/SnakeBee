import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import api from '../services/api';
import { useSelector } from 'react-redux';
import { selectUser } from '../features/userSlice';
import { useEffect } from 'react';

const ReptileCreateModal = ({ show, handleClose, setReptiles, onSuccess }) => {
  const user = useSelector(selectUser);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [toastMsg, setToastMsg] = useState(null);
  const formDataToSend = new FormData();
  const [formData, setFormData] = useState({
    name: '', species: '', morph: '', image: null,
    birthDate: '', sex: '', isBreeder: false, notes: '', parents: { father: '', mother: '' },
    documents: {
      cites: { number: '', issueDate: '', issuer: '' },
      microchip: { code: '', implantDate: '' }
    }
  });

  const inputClasses = "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#228B22] focus:border-[#228B22] bg-white text-gray-800";
  const inputSmall = inputClasses + " text-sm";
  const labelClasses = "block font-medium text-sm mb-1 text-gray-800";
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  useEffect(() => {
    if (show) {
      setFormData({
        name: '', species: '', morph: '', image: null,
        birthDate: '', sex: '', isBreeder: false, notes: '', parents: { father: '', mother: '' },
      documents: {
        cites: { number: '', issueDate: '', issuer: '' },
        microchip: { code: '', implantDate: '' }
      }
      });
      setFormErrors({});
      setToastMsg(null);
    }
  }, [show]);


  const validateForm = () => {
    const errors = {};
    const today = new Date();
    const minDate = new Date();
    minDate.setFullYear(today.getFullYear() - 100); // massimo 100 anni fa

    if (!formData.species.trim()) errors.species = 'La specie è obbligatoria';
    if (!formData.sex) errors.sex = 'Il sesso è obbligatorio';
    if (formData.birthDate) {
      const birth = new Date(formData.birthDate);

      if (birth > today) {
        errors.birthDate = 'La data non può essere nel futuro';
      } else if (birth < minDate) {
        errors.birthDate = 'La data è troppo lontana nel passato (max 100 anni)';
      }
    }


    return errors;
  };
  const resetForm = () => {
    setFormData({
      name: '', species: '', morph: '', image: null,
      birthDate: '', sex: '', isBreeder: false, notes: '', parents: { father: '', mother: '' },
      documents: {
        cites: { number: '', issueDate: '', issuer: '' },
        microchip: { code: '', implantDate: '' }
      }
    });
    setFormErrors({});
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) return setFormErrors(errors);

    setLoading(true);
    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, val]) => {
      if (key === 'image' && val) {
        formDataToSend.append('image', val);}
      else if (['parents', 'documents'].includes(key)) {} 
      else {formDataToSend.append(key, val);}

    });
    formDataToSend.append('parents', JSON.stringify(formData.parents));
formDataToSend.append('documents', JSON.stringify(formData.documents));
    formDataToSend.append('user', user._id);

    try {
      const { data } = await api.post('/reptile/', formDataToSend, { headers: { 'Content-Type': 'multipart/form-data' } });
      setToastMsg({ type: 'success', text: 'Rettile creato con successo!' });
      setReptiles((prev) => [...prev, data]);
      if (onSuccess) onSuccess(data);
      handleClose();
      resetForm();
    } catch (err) {
      const msg = err.response?.data?.message || 'Errore durante la creazione del rettile';
      setToastMsg({ type: 'danger', text: msg });
    } finally {
      setLoading(false);
    }
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
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                <Dialog.Title className="text-lg font-semibold text-gray-800">Crea un nuovo rettile</Dialog.Title>
                <button
                  onClick={() => {
                    handleClose();
                    resetForm();
                  }}
                  className="absolute top-4 right-4 text-gray-500 hover:text-red-600 text-xl"
                >
                  &times;
                </button>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClasses}>Nome</label>
                      <input type="text" name="name" value={formData.name} onChange={handleChange} className={inputClasses} />
                      {formErrors.name && <p className="text-red-600 text-sm">{formErrors.name}</p>}
                    </div>
                    <div>
                      <label className={labelClasses}>Specie *</label>
                      <input type="text" name="species" value={formData.species} onChange={handleChange} className={inputClasses} required />
                      {formErrors.species && <p className="text-red-600 text-sm">{formErrors.species}</p>}
                    </div>
                    <div>
                      <label className={labelClasses}>Morph *</label>
                      <input type="text" name="morph" value={formData.morph} onChange={handleChange} className={inputClasses} required />
                    </div>
                    <div>
                      <label className={labelClasses}>Data di nascita *</label>
                      <input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} className={`${inputClasses} text-sm`} max={new Date().toISOString().split('T')[0]}
                        min={new Date(new Date().setFullYear(new Date().getFullYear() - 100)).toISOString().split('T')[0]} />
                    </div>
                    <div>
                      <label className={labelClasses}>Sesso *</label>
                      {formErrors.sex && <p className="text-red-600 text-sm">{formErrors.sex}</p>}

                      <select
                        name="sex"
                        value={formData.sex}
                        onChange={handleChange}
                        className={`${inputClasses} max-h-[48px] text-sm`}
                      >
                        <option value="">Seleziona</option>
                        <option value="M">Maschio</option>
                        <option value="F">Femmina</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2 mt-6">
                      <input
                        type="checkbox"
                        name="isBreeder"
                        checked={formData.isBreeder}
                        onChange={(e) => setFormData({ ...formData, isBreeder: e.target.checked })}
                        className="w-4 h-4 accent-[#228B22] rounded focus:ring-[#228B22]"
                      />
                      <label className="text-sm text-gray-800">È un riproduttore</label>
                    </div>
                  </div>

                  <div>
                    <label className={labelClasses}>Note</label>
                    <textarea name="notes" rows={2} value={formData.notes} onChange={handleChange} className={inputClasses} />
                  </div>

                  <div>
                    <label className={labelClasses}>Immagine</label>
                    <input type="file" onChange={handleFileChange} className="w-full text-sm text-gray-700 bg-white border border-gray-300 rounded file:bg-[#228B22] file:text-white file:rounded file:px-4 file:py-1" />
                  </div>

                  <hr className="my-4" />
                  <h3 className="text-md font-semibold text-gray-700">Genitori</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClasses}>Dati Padre</label>
                      <input type="text" name="father" value={formData.parents.father} onChange={(e) => setFormData({
                        ...formData,
                        parents: { ...formData.parents, father: e.target.value }
                      })} className={inputClasses} />
                    </div>
                    <div>
                      <label className={labelClasses}>Dati Madre</label>
                      <input type="text" name="mother" value={formData.parents.mother} onChange={(e) => setFormData({
                        ...formData,
                        parents: { ...formData.parents, mother: e.target.value }
                      })} className={inputClasses} />
                    </div>
                  </div>

                  <hr className="my-4" />
                  <h3 className="text-md font-semibold text-gray-700">Documenti</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClasses}>Codice CITES</label>
                      <input type="text" name="citesNumber" value={formData.documents.cites.number} onChange={(e) => setFormData({
                        ...formData,
                        documents: {
                          ...formData.documents,
                          cites: { ...formData.documents.cites, number: e.target.value }
                        }
                      })} className={inputClasses} />
                    </div>
                    <div>
                      <label className={labelClasses}>Data rilascio CITES</label>
                      <input type="date" name="citesDate" value={formData.documents.cites.issueDate} onChange={(e) => setFormData({
                        ...formData,
                        documents: {
                          ...formData.documents,
                          cites: { ...formData.documents.cites, issueDate: e.target.value }
                        }
                      })} className={inputClasses} />
                    </div>
                    <div>
                      <label className={labelClasses}>Ente rilasciante</label>
                      <input type="text" name="issuer" value={formData.documents.cites.issuer} onChange={(e) => setFormData({
                        ...formData,
                        documents: {
                          ...formData.documents,
                          cites: { ...formData.documents.cites, issuer: e.target.value }
                        }
                      })} className={inputClasses} />
                    </div>
                    <div>
                      <label className={labelClasses}>Codice Microchip</label>
                      <input type="text" name="microchipCode" value={formData.documents.microchip.code} onChange={(e) => setFormData({
                        ...formData,
                        documents: {
                          ...formData.documents,
                          microchip: { ...formData.documents.microchip, code: e.target.value }
                        }
                      })} className={inputClasses} />
                    </div>
                    <div>
                      <label className={labelClasses}>Data impianto Microchip</label>
                      <input type="date" name="implantDate" value={formData.documents.microchip.implantDate} onChange={(e) => setFormData({
                        ...formData,
                        documents: {
                          ...formData.documents,
                          microchip: { ...formData.documents.microchip, implantDate: e.target.value }
                        }
                      })} className={inputClasses} />
                    </div>
                  </div>

                  <hr className="my-4" />


                  <div className="mt-6 text-right">
                    <button type="submit" className="bg-[#228B22] text-white px-4 py-2 rounded hover:bg-green-700" disabled={loading}>
                      {loading ? 'Caricamento...' : 'Salva Rettile'}
                    </button>
                  </div>
                </form>

                {toastMsg && (
                  <p className={`mt-4 text-center text-sm ${toastMsg.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{toastMsg.text}</p>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ReptileCreateModal;
