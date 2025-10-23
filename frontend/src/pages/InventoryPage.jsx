import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useSelector } from 'react-redux';
import { selectUser } from '../features/userSlice';
import { useTranslation } from "react-i18next";
import { 
  FaPlus, FaPencilAlt, FaTrash, FaBoxOpen, FaLightbulb, 
  FaUtensils, FaChartLine, FaShoppingCart, FaTimes // Aggiunta FaTimes per il pulsante chiudi modale
} from 'react-icons/fa';
import FeedingSuggestions from '../components/FeedingSuggestions';

const translateFoodType = (foodType, t) => {
  return t(`inventoryPage.${foodType}`, { defaultValue: foodType });
};

const InventoryPage = () => {
  const { t } = useTranslation();
  
  const [inventory, setInventory] = useState([]);
  const [formData, setFormData] = useState({ foodType: '', quantity: '', weightPerUnit: '', weightUnit: 'g' });
  const [editingId, setEditingId] = useState(null);
  const user = useSelector(selectUser);
  const [deleteId, setDeleteId] = useState(null); 
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [forecast, setForecast] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [analyticsError, setAnalyticsError] = useState('');
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(true);

  const resetForm = () => {
    setFormData({ foodType: '', quantity: '', weightPerUnit: '', weightUnit: 'g' });
    setEditingId(null);
  };

  const fetchInventory = async () => {
    try {
      const { data } = await api.get('/inventory', { headers: { 'Cache-Control': 'no-cache' } });
      setInventory(data);
    } catch (err) {
      setErrorMessage(err.response?.status === 403 ? t('inventoryPage.accessDenied') : t('inventoryPage.fetchFailed'));
      setInventory([]);
    }
  };

  const fetchAnalytics = async () => {
    setIsAnalyticsLoading(true);
    setAnalyticsError('');
    try {
      const [forecastRes, recRes] = await Promise.all([
        api.get('/inventory/forecast'),
        api.get('/inventory/recommendations')
      ]);
      setForecast(forecastRes.data);
      setRecommendations(recRes.data);
    } catch (err) {
      setAnalyticsError(t('inventoryPage.analyticsFailed'));
    }
    setIsAnalyticsLoading(false);
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await fetchInventory();
      setIsLoading(false);
    };
    
    loadData();
    fetchAnalytics();
  }, []);

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
      fetchInventory(); 
      fetchAnalytics();
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/inventory/${deleteId}`);
      fetchInventory();
      fetchAnalytics();
    } catch (err) {
      setErrorMessage(t('inventoryPage.deleteFailed'));
    } finally {
      setIsDeleteModalOpen(false);
      setDeleteId(null);
    }
  };

  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setDeleteId(null);
  };

  const formatWeight = (grams) => {
    if (!grams || isNaN(grams)) return '—';
    return grams >= 1000 ? `${(grams / 1000).toFixed(2)} kg` : `${grams} g`;
  };

  // Classi Tailwind riutilizzabili per uno stile coerente (le ho raggruppate)
  const inputClass = "w-full px-3 py-2 bg-slate-50 border text-black border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition duration-200 ease-in-out";
  const buttonPrimaryClass = "w-full flex items-center justify-center gap-2 bg-emerald-600 text-white font-semibold py-2 px-4 rounded-md shadow-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-300 transform hover:scale-105";
  const buttonSecondaryClass = "w-full bg-slate-500 text-white font-semibold py-2 px-4 rounded-md shadow-lg hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 transition-all duration-300 transform hover:scale-105";
  const cardClass = "bg-white p-6 rounded-xl shadow-lg border border-slate-200 transition-shadow duration-300 hover:shadow-xl"; // Card con bordo e hover effect
  const cardTitleClass = "text-2xl font-extrabold text-slate-800 mb-5 flex items-center gap-3 border-b pb-3 border-slate-200"; // Titolo più grande e separatore
  const widgetLoadingPlaceholder = (
    <div className="flex justify-center items-center h-24">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex flex-col items-center text-xl font-semibold text-slate-600">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-emerald-500 mb-4"></div>
          {t('general.loading')}...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-10"> {/* Aumento lo spazio tra le sezioni */}
        <header className="text-center lg:text-left">
          <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {t('inventoryPage.title')}
          </h1>
          <p className="mt-3 text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0">
            {t('inventoryPage.subtitle')}
          </p>
        </header>

        {/* --- FORM CARD --- */}
        <div className={cardClass}>
          <h2 className={cardTitleClass}>
            <FaUtensils className="text-emerald-500 text-3xl" /> {/* Icona più grande */}
            {editingId ? t('inventoryPage.editItem') : t('inventoryPage.addItem')}
          </h2>

          {errorMessage && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 border border-red-200 rounded-lg text-sm font-medium flex items-center gap-3">
              <FaTimes className="text-red-500 text-lg" /> {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6"> {/* Aumento il gap */}
            {/* Food Type */}
            <div className="flex flex-col lg:col-span-1">
              <label htmlFor="foodType" className="mb-2 text-sm font-medium text-slate-700">{t('inventoryPage.foodType')}</label>
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
              <label htmlFor="quantity" className="mb-2 text-sm font-medium text-slate-700">{t('inventoryPage.quantity')}</label>
              <input id="quantity" type="number" name="quantity" min="1" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} required placeholder={t('inventoryPage.quantityPlaceholder')} className={inputClass} />
            </div>
            {/* Weight */}
            <div className="flex flex-col sm:col-span-2 lg:col-span-1">
              <label htmlFor="weightPerUnit" className="mb-2 text-sm font-medium text-slate-700">{t('inventoryPage.weightPerUnit')}</label>
              <div className="flex shadow-sm rounded-md border border-slate-300 focus-within:border-emerald-600 focus-within:ring-1 focus-within:ring-emerald-600 transition">
                <input id="weightPerUnit" type="number" name="weightPerUnit" min="0" step="0.01" value={formData.weightPerUnit} onChange={(e) => setFormData({ ...formData, weightPerUnit: e.target.value })} placeholder={t('inventoryPage.weightPlaceholder')} className={`${inputClass} !border-none !ring-0 !shadow-none rounded-r-none`} />
                <select value={formData.weightUnit} onChange={(e) => setFormData({ ...formData, weightUnit: e.target.value })} className="px-3 border-l border-slate-300 rounded-r-md bg-slate-100 text-slate-700 text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition">
                  <option value="g">g</option>
                  <option value="kg">kg</option>
                </select>
              </div>
            </div>
            {/* Submit Button */}
            <div className="flex items-end sm:col-span-2 lg:col-span-2 space-x-4 mt-2 lg:mt-0"> {/* Aumento lo spazio tra i bottoni */}
              <button type="submit" className={buttonPrimaryClass}>
                {editingId ? <FaPencilAlt /> : <FaPlus />}
                {editingId ? t('inventoryPage.update') : t('inventoryPage.add')}
              </button>
              {editingId && (
                <button type="button" onClick={resetForm} className={buttonSecondaryClass}>
                  {t('inventoryPage.cancel')}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* --- INVENTORY LIST CARD --- */}
        <div className={cardClass}>
          <h2 className={cardTitleClass}>
            <FaBoxOpen className="text-emerald-500 text-3xl" />
            {t('inventoryPage.currentInventory')}
          </h2>
<div className="overflow-x-auto overflow-y-auto max-h-[400px] scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 rounded-md">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 text-left text-slate-700 uppercase tracking-wider text-xs">
                <tr>
                  <th className="p-4 font-bold rounded-tl-lg">{t('inventoryPage.type')}</th>
                  <th className="p-4 font-bold text-right">{t('inventoryPage.quantity')}</th>
                  <th className="p-4 font-bold text-right">{t('inventoryPage.weightPerUnit')}</th>
                  <th className="p-4 font-bold text-right">{t('inventoryPage.totalWeight')}</th>
                  <th className="p-4 font-bold text-center rounded-tr-lg">{t('inventoryPage.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {inventory.length > 0 ? (
                  inventory.sort((a, b) => (b.weightPerUnit || 0) - (a.weightPerUnit || 0)).map(item => (
                    <tr key={item._id} className="hover:bg-slate-50 transition-colors duration-150 ease-in-out">
                      <td className="p-4 whitespace-nowrap text-slate-800 font-medium">{translateFoodType(item.foodType, t)}</td>
                      <td className="p-4 text-right font-mono text-slate-700">{item.quantity}</td>
                      <td className="p-4 text-right font-mono text-slate-700">{formatWeight(item.weightPerUnit)}</td>
                      <td className="p-4 text-right font-mono text-slate-900 font-extrabold">{formatWeight(item.weightPerUnit * item.quantity)}</td> {/* Reso più audace */}
                      <td className="p-4 text-center">
                        <div className="flex justify-center items-center space-x-3">
                          <button onClick={() => handleEdit(item)} className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-all duration-200 ease-in-out" aria-label={`${t('inventoryPage.edit')} ${item.foodType}`}>
                            <FaPencilAlt className="text-lg" />
                          </button>
                          <button onClick={() => handleDelete(item._id)} className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-all duration-200 ease-in-out" aria-label={`${t('inventoryPage.delete')} ${item.foodType}`}>
                            <FaTrash className="text-lg" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center p-6 text-slate-500 italic">{t('inventoryPage.noItems')}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- WIDGET ANALITICI (in una griglia) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* --- CARD PREVISIONI SCORTE --- */}
          <div className={cardClass}>
            <h2 className={cardTitleClass}>
              <FaChartLine className="text-emerald-500 text-3xl" />
              {t('inventoryPage.forecastTitle')}
            </h2>
            {isAnalyticsLoading ? (
              widgetLoadingPlaceholder
            ) : analyticsError ? (
              <p className="text-red-500 p-4 border border-red-200 bg-red-50 rounded-md flex items-center gap-2">
                <FaTimes className="text-red-400" /> {analyticsError}
              </p>
            ) : forecast.length > 0 ? (
              <div className="overflow-y-auto max-h-[300px] scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 rounded-md">

  <ul className="divide-y divide-slate-100 border-t border-b border-slate-200">
                {forecast.sort((a, b) => {
                  if (a.daysLeft === Infinity) return 1;
                  if (b.daysLeft === Infinity) return -1;
                  return a.daysLeft - b.daysLeft;
                }).map(item => (
                  <li key={item._id} className="py-4 px-3 flex justify-between items-center bg-white hover:bg-emerald-50 transition-colors duration-150 ease-in-out">
                    <div>
                      <p className="font-semibold text-slate-800 text-lg">{translateFoodType(item.foodType, t)} <span className="text-slate-500 text-base">({item.weightPerUnit}g)</span></p>
                      <p className="text-sm text-slate-500 mt-1">{t('inventoryPage.dailyRate', { rate: item.dailyRate })}</p>
                    </div>
                    <div className="text-right">
                      {item.daysLeft === Infinity ? (
                        <span className="font-bold text-2xl text-green-600" title={t('inventoryPage.noConsumption')}>∞</span>
                      ) : (
                        <>
                          <p className={`font-bold text-2xl ${item.daysLeft < 7 ? 'text-red-600 animate-pulse' : item.daysLeft < 14 ? 'text-orange-500' : 'text-slate-800'}`}>
                            {t('inventoryPage.daysLeft', { count: item.daysLeft })}
                          </p>
                          <p className="text-xs text-slate-500">{t('inventoryPage.depletionDate', { date: new Date(item.depletionDate).toLocaleDateString() })}</p>
                        </>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
              </div>
            ) : (
              <p className="text-slate-500 p-4 text-center">{t('inventoryPage.noForecastData')}</p>
            )}
          </div>

          {/* --- CARD CONSIGLI ACQUISTO --- */}
          <div className={cardClass}>
            <h2 className={cardTitleClass}>
              <FaShoppingCart className="text-emerald-500 text-3xl" />
              {t('inventoryPage.recommendationsTitle')}
            </h2>
            {isAnalyticsLoading ? (
              widgetLoadingPlaceholder
            ) : analyticsError ? (
              <p className="text-red-500 p-4 border border-red-200 bg-red-50 rounded-md flex items-center gap-2">
                <FaTimes className="text-red-400" /> {analyticsError}
              </p>
            ) : recommendations.length > 0 ? (
              <ul className="divide-y divide-slate-100 border-t border-b border-slate-200 rounded-md">
                {recommendations.map(item => (
                  <li key={`${item.foodType}-${item.weightPerUnit}`} className="py-4 px-3 bg-white hover:bg-emerald-50 transition-colors duration-150 ease-in-out">
                    <p className="font-semibold text-slate-800 text-lg">{translateFoodType(item.foodType, t)} <span className="text-slate-500 text-base">({item.weightPerUnit}g)</span></p>
                    <p className="text-sm text-slate-600 mt-1">
                      <span className="font-bold text-emerald-700">{t('inventoryPage.recommendationDetails', { toBuy: item.toBuy, needed: item.neededForOneMonth, inStock: item.qtyInStock })}</span>
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500 p-4 text-center">{t('inventoryPage.noRecommendations')}</p>
            )}
          </div>

        </div>

        {/* --- FEEDING SUGGESTIONS CARD --- */}
        <FeedingSuggestions />

      </div>

      {/* --- MODALE DELETE --- */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl p-8 w-11/12 max-w-lg shadow-2xl border border-slate-200 transform scale-95 animate-scale-in">
            <h3 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-3">
              <FaTrash className="text-red-500" /> {t('inventoryPage.deleteConfirmTitle')}
            </h3>
            <p className="text-slate-600 mb-8 leading-relaxed">{t('inventoryPage.deleteConfirmText')}</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={cancelDelete}
                className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-all duration-200 ease-in-out font-medium"
              >
                {t('inventoryPage.cancel')}
              </button>
              <button
                onClick={confirmDelete}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 ease-in-out font-medium shadow-md"
              >
                {t('inventoryPage.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;