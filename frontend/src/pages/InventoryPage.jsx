import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useSelector } from 'react-redux';
import { selectUser } from '../features/userSlice';
import { useTranslation } from "react-i18next";
// Importa le icone che useremo
import { FaPlus, FaPencilAlt, FaTrash, FaBoxOpen, FaLightbulb, FaUtensils } from 'react-icons/fa';

// Funzione helper per la traduzione (invariata)
const translateFoodType = (foodType, t) => {
  return t(`inventoryPage.${foodType}`, { defaultValue: foodType });
};

const InventoryPage = () => {
  const { t } = useTranslation();
  
  // STATI DEL COMPONENTE
  const [inventory, setInventory] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionMessage, setSuggestionMessage] = useState('');
  const [formData, setFormData] = useState({ foodType: '', quantity: '', weightPerUnit: '', weightUnit: 'g' });
  const [editingId, setEditingId] = useState(null);
  const user = useSelector(selectUser);
  
  // STATI PER LA UI
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true); // Stato per il caricamento iniziale

  // Funzione per resettare il form
  const resetForm = () => {
    setFormData({ foodType: '', quantity: '', weightPerUnit: '', weightUnit: 'g' });
    setEditingId(null);
  };

  // FETCH DEI DATI
  const fetchInventory = async () => {
    try {
      const { data } = await api.get('/inventory', { headers: { 'Cache-Control': 'no-cache' } });
      setInventory(data);
    } catch (err) {
      setErrorMessage(err.response?.status === 403 ? t('inventoryPage.accessDenied') : t('inventoryPage.fetchFailed'));
      setInventory([]);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const { data } = await api.get('/inventory/feeding-suggestions', { headers: { 'Cache-Control': 'no-cache' } });
      setSuggestions(data.suggestions || []);
      setSuggestionMessage(data.message || '');
    } catch (err) {
      console.error('Error fetching feeding suggestions:', err);
      setSuggestionMessage(t('inventoryPage.suggestionsError'));
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchInventory(), fetchSuggestions()]);
      setIsLoading(false);
    };
    loadData();
  }, []);

  // GESTIONE DELLE AZIONI
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!user || !user._id) return;

    const weightInGrams = formData.weightUnit === 'kg' ? formData.weightPerUnit * 1000 : formData.weightPerUnit;
    const payload = { ...formData, weightPerUnit: weightInGrams };

    try {
      if (editingId) {
        await api.put(`/inventory/${editingId}`, payload);
      } else {
        await api.post('/inventory', payload);
      }
      resetForm();
      fetchInventory(); // Ricarica l'inventario dopo l'operazione
    } catch (err) {
      setErrorMessage(err.response?.status === 403 ? t('inventoryPage.submitDenied') : t('inventoryPage.submitFailed', { message: err.message }));
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    const isKg = item.weightPerUnit >= 1000;
    setFormData({
      foodType: item.foodType,
      quantity: item.quantity,
      weightPerUnit: isKg ? (item.weightPerUnit / 1000) : item.weightPerUnit,
      weightUnit: isKg ? 'kg' : 'g',
    });
    // Scrolla il form in cima alla vista per l'utente
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    // Aggiungi una conferma prima di eliminare
    if (window.confirm(t('inventoryPage.deleteConfirm'))) {
      try {
        await api.delete(`/inventory/${id}`);
        fetchInventory();
      } catch (err) {
        setErrorMessage(t('inventoryPage.deleteFailed'));
      }
    }
  };

  // FUNZIONI HELPER PER LA RENDERIZZAZIONE
  const formatWeight = (grams) => {
    if (!grams || isNaN(grams)) return '—';
    return grams >= 1000 ? `${(grams / 1000).toFixed(2)} kg` : `${grams} g`;
  };

  // Classi Tailwind riutilizzabili per uno stile coerente
  const inputClass = "w-full px-3 py-2 bg-slate-50 border text-black border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition";
  const cardClass = "bg-white p-6 rounded-lg shadow-md";
  const cardTitleClass = "text-xl font-bold text-slate-700 mb-4 flex items-center gap-3";

  // Se i dati non sono ancora stati caricati, mostra un loader
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-100">
        <div className="text-xl font-semibold text-slate-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header>
          <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">
            {t('inventoryPage.title')}
          </h1>
          <p className="mt-2 text-slate-500">{t('inventoryPage.subtitle')}</p>
        </header>

        {/* --- FORM CARD --- */}
        <div className={cardClass}>
           <h2 className={cardTitleClass}>
            <FaUtensils className="text-emerald-500" />
            {editingId ? t('inventoryPage.editItem') : t('inventoryPage.addItem')}
          </h2>

          {errorMessage && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-200 rounded-md text-sm">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Food Type */}
            <div className="flex flex-col lg:col-span-1">
              <label htmlFor="foodType" className="mb-1 text-sm font-medium text-slate-700 text-black">{t('inventoryPage.foodType')}</label>
              <select id="foodType" name="foodType" value={formData.foodType} onChange={(e) => setFormData({ ...formData, foodType: e.target.value })} required className={inputClass}>
                <option value="">{t('inventoryPage.selectType')}</option>
                <option value="Topo">{t('inventoryPage.Topo')}</option>
                <option value="Ratto">{t('inventoryPage.Ratto')}</option>
                <option value="Coniglio">{t('inventoryPage.Coniglio')}</option>
                <option value="Pulcino">{t('inventoryPage.Pulcino')}</option>
                <option value="Altro">{t('inventoryPage.Altro')}</option>
              </select>
            </div>
            {/* Quantity */}
            <div className="flex flex-col lg:col-span-1">
              <label htmlFor="quantity" className="mb-1 text-sm font-medium text-slate-700 text-black">{t('inventoryPage.quantity')}</label>
              <input id="quantity" type="number" name="quantity" min="1" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} required placeholder={t('inventoryPage.quantityPlaceholder')} className={inputClass} />
            </div>
            {/* Weight */}
            <div className="flex flex-col sm:col-span-2 lg:col-span-1">
              <label htmlFor="weightPerUnit" className="mb-1 text-sm font-medium text-slate-700 text-black">{t('inventoryPage.weightPerUnit')}</label>
              <div className="flex">
                <input id="weightPerUnit" type="number" name="weightPerUnit" min="0" step="0.01" value={formData.weightPerUnit} onChange={(e) => setFormData({ ...formData, weightPerUnit: e.target.value })} placeholder={t('inventoryPage.weightPlaceholder')} className={`${inputClass} rounded-r-none`} />
                <select value={formData.weightUnit} onChange={(e) => setFormData({ ...formData, weightUnit: e.target.value })} className="px-2 border-t border-b border-r border-slate-300 rounded-r-md bg-slate-50 text-black text-sm text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                  <option value="g">g</option>
                  <option value="kg">kg</option>
                </select>
              </div>
            </div>
            {/* Submit Button */}
            <div className="flex items-end sm:col-span-2 lg:col-span-2 space-x-2">
              <button type="submit" className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white font-semibold py-2 px-4 rounded-md shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-300">
                {editingId ? <FaPencilAlt /> : <FaPlus />}
                {editingId ? t('inventoryPage.update') : t('inventoryPage.add')}
              </button>
              {editingId && (
                <button type="button" onClick={resetForm} className="w-full bg-slate-500 text-white font-semibold py-2 px-4 rounded-md shadow-sm hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 transition-all duration-300">
                  {t('inventoryPage.cancel')}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* --- INVENTORY LIST CARD --- */}
        <div className={cardClass}>
          <h2 className={cardTitleClass}>
            <FaBoxOpen className="text-emerald-500" />
            {t('inventoryPage.currentInventory')}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="p-3 font-semibold">{t('inventoryPage.type')}</th>
                  <th className="p-3 font-semibold text-right">{t('inventoryPage.quantity')}</th>
                  <th className="p-3 font-semibold text-right">{t('inventoryPage.weightPerUnit')}</th>
                  <th className="p-3 font-semibold text-right">{t('inventoryPage.totalWeight')}</th>
                  <th className="p-3 font-semibold text-center">{t('inventoryPage.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {inventory.length > 0 ? (
                  inventory.sort((a, b) => (b.weightPerUnit || 0) - (a.weightPerUnit || 0)).map(item => (
                    <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 whitespace-nowrap text-slate-700 font-medium">{translateFoodType(item.foodType, t)}</td>
                      <td className="p-3 text-right font-mono text-slate-600">{item.quantity}</td>
                      <td className="p-3 text-right font-mono text-slate-600">{formatWeight(item.weightPerUnit)}</td>
                      <td className="p-3 text-right font-mono text-slate-600 font-bold">{formatWeight(item.weightPerUnit * item.quantity)}</td>
                      <td className="p-3 text-center">
                        <div className="flex justify-center items-center space-x-3">
                          <button onClick={() => handleEdit(item)} className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-full transition" aria-label={`${t('inventoryPage.edit')} ${item.foodType}`}>
                            <FaPencilAlt />
                          </button>
                          <button onClick={() => handleDelete(item._id)} className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-full transition" aria-label={`${t('inventoryPage.delete')} ${item.foodType}`}>
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center p-6 text-slate-500">{t('inventoryPage.noItems')}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- FEEDING SUGGESTIONS CARD --- */}
        <div className={`${cardClass} bg-emerald-50 border border-emerald-200`}>
          <h2 className={`${cardTitleClass} text-emerald-800`}>
            <FaLightbulb className="text-emerald-500" />
            {t('inventoryPage.todaySuggestions')}
          </h2>

          {suggestionMessage && !suggestions.length && <p className="text-slate-700">{suggestionMessage}</p>}

          {suggestions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm bg-white rounded-md shadow-sm">
                <thead className="bg-emerald-100 text-left text-emerald-800">
                  <tr>
                    <th className="p-3 font-semibold">{t('inventoryPage.type')}</th>
                    <th className="p-3 font-semibold text-right">{t('inventoryPage.weightPerUnit')}</th>
                    <th className="p-3 font-semibold text-right">{t('inventoryPage.toDefrost')}</th>
                    <th className="p-3 font-semibold text-right">{t('inventoryPage.available')}</th>
                    <th className="p-3 font-semibold text-right">{t('inventoryPage.warning')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-100">
                  {suggestions.map((s, idx) => (
                    <tr key={idx} className="hover:bg-emerald-50/50 transition-colors">
                      <td className="p-3 font-medium text-slate-700">{translateFoodType(s.foodType, t)}</td>
                      <td className="p-3 text-right font-mono text-slate-600">{formatWeight(s.weightPerUnit)}</td>
                      <td className="p-3 text-right font-mono text-slate-600">{s.quantity}</td>
                      <td className="p-3 text-right font-mono text-slate-600">{s.available}</td>
                      <td className="p-3 text-right font-semibold text-orange-600">
                        {s.warning ? t(`inventoryPage.${s.warning}`, { defaultValue: s.warning }) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            !suggestionMessage && <p className="text-slate-500">{t('inventoryPage.noSuggestions')}</p>
          )}
        </div>

      </div>
    </div>
  );
};

export default InventoryPage;