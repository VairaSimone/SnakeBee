// src/pages/InventoryPage.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useSelector } from 'react-redux';
import { selectUser } from '../features/userSlice';

const InventoryPage = () => {
  const [inventory, setInventory] = useState([]);
  const [formData, setFormData] = useState({ foodType: '', quantity: '', weightPerUnit: '' });
  const [editingId, setEditingId] = useState(null);
const user = useSelector(selectUser);

const fetchInventory = async () => {
  try {
    const { data } = await api.get('/inventory', {
      headers: {
        'Cache-Control': 'no-cache',
      },
    });
    setInventory(data);
  } catch (err) {
    console.error('Errore caricamento inventario:', err);
  }
};

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

      if (!user || !user._id) {
    console.error('Utente non autenticato');
    return;
  }
  
    try {
      if (editingId) {
        await api.put(`/inventory/${editingId}`, { ...formData });
      } else {
        await api.post('/inventory',{ ...formData});
      }
      setFormData({ foodType: '', quantity: '', weightPerUnit: '' });
      setEditingId(null);
      fetchInventory();
    } catch (err) {
      console.error('Errore invio:', err);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setFormData({
      foodType: item.foodType,
      quantity: item.quantity,
      weightPerUnit: item.weightPerUnit || '',
    });
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/inventory/${id}`);
      fetchInventory();
    } catch (err) {
      console.error('Errore eliminazione:', err);
    }
  };

  const inputClass = "border border-gray-300 rounded-md px-3 py-2 w-full text-sm";
const formatWeight = (grams) => {
  if (!grams || isNaN(grams)) return '—';
  return grams >= 1000
    ? `${(grams / 1000).toFixed(2)} kg`
    : `${grams} g`;
};

return (
  <div className="max-w-4xl mx-auto mt-20 px-6 py-8 bg-white rounded-lg shadow-lg">
    <h1 className="text-3xl font-extrabold mb-8 text-green-700 border-b-4 border-green-400 pb-2">
      Inventario Cibo
    </h1>

    {/* FORM */}
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
      <div className="flex flex-col">
        <label htmlFor="foodType" className="mb-1 text-gray-700 font-semibold">Tipo Cibo</label>
        <select
          id="foodType"
          name="foodType"
          value={formData.foodType}
          onChange={(e) => setFormData({ ...formData, foodType: e.target.value })}
          required
          className={`${inputClass} focus:border-green-500 focus:ring-2 focus:ring-green-300 bg-white text-black`}
        >
          <option value="">Seleziona tipo</option>
          <option value="Topo">Topo</option>
          <option value="Ratto">Ratto</option>
          <option value="Coniglio">Coniglio</option>
          <option value="Pulcino">Pulcino</option>
          <option value="Altro">Altro</option>
        </select>
      </div>
      <div className="flex flex-col ">
        <label htmlFor="quantity" className="mb-1 text-gray-700 font-semibold bg-white text-black">Quantità</label>
        <input
          id="quantity"
          type="number"
          name="quantity"
          min="1"
          value={formData.quantity}
          onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
          required
          placeholder="Inserisci quantità"
          className={`${inputClass} focus:border-green-500 focus:ring-2 focus:ring-green-300 bg-white text-black`}
        />
      </div>
      <div className="flex flex-col">
        <label htmlFor="weightPerUnit" className="mb-1 text-gray-700 font-semibold">Peso per unità (g)</label>
        <input
          id="weightPerUnit"
          type="number"
          name="weightPerUnit"
          min="0"
          value={formData.weightPerUnit}
          onChange={(e) => setFormData({ ...formData, weightPerUnit: e.target.value })}
          placeholder="es. 50"
          className={`${inputClass} focus:border-green-500 focus:ring-2 focus:ring-green-300 bg-white text-black`}
        />
      </div>
      <div className="flex items-end">
        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-md transition-shadow shadow-md hover:shadow-lg w-full"
        >
          {editingId ? 'Aggiorna' : 'Aggiungi'}
        </button>
      </div>
    </form>

    {/* LISTA INVENTARIO */}
    <div className="overflow-x-auto rounded-lg shadow-sm border border-gray-200 max-h-[400px] overflow-y-auto">
      <table className="w-full text-sm border-collapse">
        <thead className="bg-green-100 text-green-800 font-semibold tx-black">
          <tr>
            <th className="p-3 text-left">Tipo</th>
            <th className="p-3 text-right">Quantità</th>
            <th className="p-3 text-right">Peso/unità</th>
            <th className="p-3 text-right">Peso totale</th>
            <th className="p-3 text-center">Azioni</th>
          </tr>
        </thead>
        <tbody>
          {inventory.map(item => (
            <tr
              key={item._id}
              className="odd:bg-white even:bg-green-50 hover:bg-green-100 transition-colors cursor-pointer text-black"
            >
              <td className="p-3 tx-black">{item.foodType}</td>
              <td className="p-3 text-right font-mono text-black">{item.quantity}</td>
              <td className="p-3 text-right font-mono text-black">{item.weightPerUnit ? `${item.weightPerUnit} g` : '—'}</td>
              <td className="p-3 text-right font-mono text-black">
 {item.weightPerUnit ? formatWeight(item.weightPerUnit * item.quantity) : '—'}              </td>
              <td className="p-3 text-center space-x-4">
                <button
                  onClick={() => handleEdit(item)}
                  className="text-green-700 hover:text-green-900 font-semibold"
                  aria-label={`Modifica ${item.foodType}`}
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(item._id)}
                  className="text-red-600 hover:text-red-800 font-semibold"
                  aria-label={`Elimina ${item.foodType}`}
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
          {inventory.length === 0 && (
            <tr>
              <td colSpan="5" className="text-center p-6 text-gray-500">
                Nessun elemento in inventario
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);
};

export default InventoryPage;
