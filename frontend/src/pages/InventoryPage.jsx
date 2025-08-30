import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useSelector } from 'react-redux';
import { selectUser } from '../features/userSlice';
import { useTranslation } from "react-i18next";

const InventoryPage = () => {
  const { t } = useTranslation();

  const [inventory, setInventory] = useState([]);
  const [formData, setFormData] = useState({ foodType: '', quantity: '', weightPerUnit: '', weightUnit: 'g', });
  const [editingId, setEditingId] = useState(null);
  const user = useSelector(selectUser);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchInventory = async () => {
    try {
      const { data } = await api.get('/inventory', {
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      setInventory(data);
    } catch (err) {
      if (err.response && err.response.status === 403) {
        setErrorMessage(t('inventoryPage.accessDenied'));
        setInventory([]);
      } else {
        setErrorMessage(t('inventoryPage.fetchFailed'));
      }
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!user || !user._id) {
      return;
    }
  const weightInGrams =
    formData.weightUnit === 'kg'
      ? formData.weightPerUnit * 1000
      : formData.weightPerUnit;

  const payload = {
    ...formData,
    weightPerUnit: weightInGrams,
  };

    try {
      if (editingId) {
        await api.put(`/inventory/${editingId}`, payload);
      } else {
        await api.post('/inventory', payload);
      }
      setFormData({ foodType: '', quantity: '', weightPerUnit: '',  weightUnit: 'g' });
      setEditingId(null);
      fetchInventory();
    } catch (err) {
      if (err.response && err.response.status === 403) {
        setErrorMessage(t('inventoryPage.submitDenied'));
      } else {
        setErrorMessage(t('inventoryPage.submitFailed', { message: err.message }));
      }
    }
  };

const handleEdit = (item) => {
  setEditingId(item._id);
  const unit = item.weightPerUnit >= 1000 ? 'kg' : 'g';
  setFormData({
    foodType: item.foodType,
    quantity: item.quantity,
    weightPerUnit: unit === 'kg'
      ? (item.weightPerUnit / 1000).toFixed(2)
      : item.weightPerUnit,
    weightUnit: unit,
  });
};
  const handleDelete = async (id) => {
    try {
      await api.delete(`/inventory/${id}`);
      fetchInventory();
    } catch (err) {
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
        {t('inventoryPage.title')}
      </h1>

      {/* FORM */}
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="flex flex-col">
          <label htmlFor="foodType" className="mb-1 text-gray-700 font-semibold">{t('inventoryPage.foodType')}</label>
          <select
            id="foodType"
            name="foodType"
            value={formData.foodType}
            onChange={(e) => setFormData({ ...formData, foodType: e.target.value })}
            required
            className={`${inputClass} focus:border-green-500 focus:ring-2 focus:ring-green-300 bg-white text-black`}
          >
            <option value="">{t('inventoryPage.type')}</option>
            <option value="Topo">{t('inventoryPage.Topo')}</option>
            <option value="Ratto">{t('inventoryPage.Ratto')}</option>
            <option value="Coniglio">{t('inventoryPage.Coniglio')}</option>
            <option value="Pulcino">{t('inventoryPage.Pulcino')}</option>
            <option value="Altro">{t('inventoryPage.Altro')}</option>
          </select>
        </div>
        <div className="flex flex-col ">
          <label htmlFor="quantity" className="mb-1 text-gray-700 font-semibold bg-white text-black">{t('inventoryPage.quantity')}</label>
          <input
            id="quantity"
            type="number"
            name="quantity"
            min="1"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            required
            placeholder={t('inventoryPage.quantityPlaceholder')}
            className={`${inputClass} focus:border-green-500 focus:ring-2 focus:ring-green-300 bg-white text-black`}
          />
        </div>
<div className="flex flex-col">
  <label htmlFor="weightPerUnit" className="mb-1 text-gray-700 font-semibold">
    {t('inventoryPage.weightPerUnit')}
  </label>
  <div className="flex">
    <input
      id="weightPerUnit"
      type="number"
      name="weightPerUnit"
      min="0"
      value={formData.weightPerUnit}
      onChange={(e) => setFormData({ ...formData, weightPerUnit: e.target.value })}
      placeholder={t('inventoryPage.weightPlaceholder')}
      className={`${inputClass} focus:border-green-500 focus:ring-2 focus:ring-green-300 bg-white text-black`}
    />
    <select
      value={formData.weightUnit}
      onChange={(e) => setFormData({ ...formData, weightUnit: e.target.value })}
      className="ml-2 border border-gray-300 rounded-md px-2 text-sm bg-white text-black appearance-none"
    >
      <option value="g">g</option>
      <option value="kg">kg</option>
    </select>
  </div>
</div>
        <div className="flex items-end">
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-md transition-shadow shadow-md hover:shadow-lg w-full"
          >
            {editingId ? t('inventoryPage.update') : t('inventoryPage.add')}
          </button>
        </div>
      </form>

      {/* INVENTORY LIST */}
      <div className="overflow-x-auto rounded-lg shadow-sm border border-gray-200 max-h-[400px] overflow-y-auto">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-green-100 text-green-800 font-semibold tx-black">
            <tr>
              <th className="p-3 text-left">{t('inventoryPage.type')}</th>
              <th className="p-3 text-right">{t('inventoryPage.totalWeight')}</th>
              <th className="p-3 text-right">{t('inventoryPage.weightPerUnit')}</th>
              <th className="p-3 text-right">{t('inventoryPage.totalWeight')}</th>
              <th className="p-3 text-center">{t('inventoryPage.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {[...inventory]
              .sort((a, b) => (b.weightPerUnit || 0) - (a.weightPerUnit || 0))
              .map(item => (
                <tr
                  key={item._id}
                  className="odd:bg-white even:bg-green-50 hover:bg-green-100 transition-colors cursor-pointer text-black"
                >
                  <td className="p-3 tx-black">{item.foodType}</td>
                  <td className="p-3 text-right font-mono text-black">{item.quantity}</td>
                  <td className="p-3 text-right font-mono text-black">{item.weightPerUnit ? formatWeight(item.weightPerUnit) : '—'}</td>
                  <td className="p-3 text-right font-mono text-black">
                    {item.weightPerUnit ? formatWeight(item.weightPerUnit * item.quantity) : '—'}              </td>
                  <td className="p-3 text-center space-x-4">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-green-700 hover:text-green-900 font-semibold"
                      aria-label={`${t('inventoryPage.edit')} ${item.foodType}`}
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="text-red-600 hover:text-red-800 font-semibold"
                      aria-label={`${t('inventoryPage.delete')} ${item.foodType}`}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            {inventory.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center p-6 text-gray-500">
                  {t('inventoryPage.noItems')}
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
