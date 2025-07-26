import React, { useState, useEffect, Fragment } from 'react';
import api from '../services/api';
import { Dialog, Transition } from '@headlessui/react';

const FeedingModal = ({ show, handleClose, reptileId, onFeedingAdded, onSuccess }) => {
  const [feedings, setFeedings] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [inventory, setInventory] = useState([]);
  const [customFoodType, setCustomFoodType] = useState('');

  const [formData, setFormData] = useState({
    date: '',
    foodType: '',
    quantity: '',
    nextFeedingDate: '',
    notes: '',
    daysUntilNextFeeding: '',
    wasEaten: true, // default: ha mangiato
    retryAfterDays: '',
  });
  const fetchInventory = async () => {
    try {
      const { data } = await api.get('/inventory');
      setInventory(data);
    } catch (err) {
      console.error('Errore caricamento inventario:', err);
    }
  };

  useEffect(() => {
    if (show && reptileId) fetchFeedings(page);

    if (show && reptileId) {
      fetchFeedings(page);
      fetchInventory();
    }

  }, [show, reptileId, page]);

  const fetchFeedings = async (page) => {
    try {
      const { data } = await api.get(`/feedings/${reptileId}?page=${page}`);
      setFeedings(data.dati);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error('Errore nel caricare i pasti:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'date' && new Date(value) > new Date()) return;
    if (name === 'notes' && value.length > 300) return;
    setFormData({ ...formData, [name]: value  });

  };

  const handleDelete = async (feedingId) => {
    try {
      await api.delete(`/feedings/${feedingId}`);
      setFeedings(feedings.filter((f) => f._id !== feedingId));
    } catch (err) {
      console.error('Errore durante l\'eliminazione:', err);
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  const selectedType = formData.foodType;
  const isCustom = selectedType === 'Altro';
  const quantity = parseInt(formData.quantity);

  let selectedInventoryItem = null;

  if (!isCustom) {
    selectedInventoryItem = inventory.find(item =>  item._id  === selectedType);

    if (!selectedInventoryItem) {
      alert('Tipo alimento non trovato in inventario.');
      return;
    }

    if (formData.wasEaten && quantity > selectedInventoryItem.quantity) {
      alert(`Errore: hai solo ${selectedInventoryItem.quantity} unità di ${selectedType} in magazzino.`);
      return;
    }
  }

  try {
    const payload = {
      ...formData,
        wasEaten: formData.wasEaten === 'false' ? false : !!formData.wasEaten,
foodType: isCustom ? customFoodType : selectedInventoryItem.foodType,
weightPerUnit: isCustom ? undefined : selectedInventoryItem.weightPerUnit,
      retryAfterDays: formData.wasEaten ? undefined : formData.retryAfterDays,
    };

    const { data } = await api.post(`/feedings/${reptileId}`, payload);
    setFeedings([...feedings, data]);

    // Scala l'inventario se è stato mangiato
    if (!isCustom && formData.wasEaten) {
      const newQuantity = selectedInventoryItem.quantity - quantity;

      await api.put(`/inventory/${selectedInventoryItem._id}`, {
        foodType: selectedInventoryItem.foodType,
        quantity: newQuantity,
        weightPerUnit: selectedInventoryItem.weightPerUnit,
      });

      fetchInventory();
    }

    // Reset form
    setFormData({
      date: '',
      foodType: '',
      quantity: '',
      nextFeedingDate: '',
      notes: '',
      daysUntilNextFeeding: '',
      wasEaten: true,
      retryAfterDays: '',
    });
    setCustomFoodType('');
    onSuccess?.();
    onFeedingAdded?.();
  } catch (err) {
    console.error("Errore nell'invio:", err);
    alert('Errore nell\'aggiungere il pasto.');
  }
};
  const inputClasses = "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#228B22] focus:border-[#228B22] bg-white text-gray-800 text-sm";

  return (
    <Transition show={show} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all relative">
                <Dialog.Title className="text-lg font-semibold text-gray-800">Gestione Pasti</Dialog.Title>
                <button onClick={handleClose} className="absolute top-4 right-4 text-gray-500 hover:text-red-600 text-xl">&times;</button>

                {/* FORM */}
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <input type="date" name="date" value={formData.date} onChange={handleChange} required className={inputClasses} />
                    <select
                      name="foodType"
                      value={formData.foodType}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData({ ...formData, foodType: value });
                        setCustomFoodType(''); // Reset campo custom se cambia
                      }}
                      required
                      className={`${inputClasses} max-h-40 overflow-y-auto`}
                    >
                      <option value="">-- Seleziona alimento --</option>
                      {(inventory || [])
                        .filter(item => item && item._id)
                        .map(item => (
                          <option key={item._id} value={item._id /* vedi punto 3 */}>
                            {item.foodType} ({item.quantity}× – {item.weightPerUnit}g)
                          </option>
                        ))
                      }  <option value="Altro">Non scegliere inventario</option>
                    </select>

                    {/* Campo libero solo se "Altro" selezionato */}
                    {formData.foodType === 'Altro' && (
                      <input
                        type="text"
                        name="customFoodType"
                        value={customFoodType}
                        onChange={(e) => setCustomFoodType(e.target.value)}
                        required
                        className={inputClasses}
                        placeholder="Scrivi tipo di alimento"
                      />
                    )}
                    <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} required className={inputClasses} placeholder="Quantità" />
                    {formData.wasEaten ? (
                      <input
                        type="number"
                        name="daysUntilNextFeeding"
                        value={formData.daysUntilNextFeeding}
                        onChange={handleChange}
                        required
                        className={inputClasses}
                        placeholder="Giorni al prossimo pasto"
                      />
                    ) : (
                      <input
                        type="number"
                        name="retryAfterDays"
                        value={formData.retryAfterDays}
                        onChange={handleChange}
                        required
                        className={inputClasses}
                        placeholder="Riprova tra (giorni)"
                      />
                    )}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">L'animale ha mangiato?</label>
                      <div className="flex items-center space-x-4">
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="wasEaten"
                            value={true}
                            checked={formData.wasEaten === true}
                            onChange={() => setFormData({ ...formData, wasEaten: true })}
                          />
                          <span>Sì</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="wasEaten"
                            value={false}
                            checked={formData.wasEaten === false}
                            onChange={() => setFormData({ ...formData, wasEaten: false })}
                          />
                          <span>No</span>
                        </label>
                      </div>
                    </div>
                    <textarea name="notes" rows={3} value={formData.notes} onChange={handleChange} maxLength={300} className={`${inputClasses} md:col-span-2`} placeholder="Note (max 300 caratteri)" />
                  </div>

                  <div className="mt-4 text-right">
                    <button type="submit" className="bg-[#228B22] text-white px-4 py-2 rounded hover:bg-green-700">Aggiungi Pasto</button>
                  </div>
                </form>

                {/* CRONOLOGIA */}
                <h3 className="text-xl font-semibold mt-10 mb-4 text-gray-800">Cronologia Pasti</h3>
                <div className="overflow-auto text-sm max-h-64 md:max-h-80 border rounded-md">

                  <table className="w-full border text-gray-800">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="p-2">Data</th>
                        <th className="p-2">Cibo</th>
                        <th className="p-2">Quantità</th>
                        <th className="p-2">Prossimo Pasto</th>
                        <th className="p-2">Note</th>
                        <th className="p-2">Esito</th> {/* ✅ Spostato qui */}
                        <th className="p-2">Azioni</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(feedings || [])
                        .filter(f => f && f._id)
                        .map(f => (<tr key={f._id} className="odd:bg-white even:bg-gray-50">
                          <td className="p-2 whitespace-nowrap">{new Date(f.date).toLocaleDateString()}</td>
                          <td className="p-2 whitespace-nowrap">{f.foodType}</td>
                          <td className="p-2">{f.quantity || '—'}</td>
                          <td className="p-2 whitespace-nowrap">{new Date(f.nextFeedingDate).toLocaleDateString()}</td>
                          <td className="p-2 max-w-xs truncate" title={f.notes}>{f.notes || '—'}</td>
                          <td className="p-2">
                            {f.wasEaten ? (
                              <span className="text-green-600 font-semibold">✅ Mang.</span>
                            ) : (
                              <span className="text-red-500 font-semibold">❌ Fallito</span>
                            )}
                          </td>
                          <td className="p-2">
                            <button onClick={() => handleDelete(f._id)} className="text-red-500 hover:text-red-700 font-semibold">Elimina</button>
                          </td>
                        </tr>
                        ))}
                    </tbody>
                  </table>


                </div>

                {/* PAGINAZIONE */}
                <div className="flex justify-center mt-6 space-x-2 flex-wrap">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={`px-3 py-1 rounded ${page === i + 1 ? 'bg-yellow-400 font-bold text-gray-800' : 'bg-gray-200 hover:bg-gray-300'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default FeedingModal;
