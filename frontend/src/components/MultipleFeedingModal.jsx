import React, { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition, RadioGroup } from '@headlessui/react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import api from '../services/api';
import { useTranslation } from "react-i18next";
import {
  XMarkIcon,
  PlusCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';

// Schema di validazione (identico a FeedingModal)
const validationSchema = (t) => Yup.object().shape({
  date: Yup.date()
    .max(new Date(), t("feedingModal.errors.date.future"))
    .required(t("feedingModal.errors.date.required"))
    .typeError(t("feedingModal.errors.date.invalid")),
  foodType: Yup.string().required(t("feedingModal.errors.foodType.required")),
  customFoodType: Yup.string().when("foodType", {
    is: "Altro",
    then: (schema) => schema.required(t("feedingModal.errors.customFoodType.required")),
    otherwise: (schema) => schema.notRequired(),
  }),
  customWeight: Yup.number()
    .transform((value, originalValue) => originalValue === "" ? null : value)
    .when("foodType", {
      is: "Altro",
      then: (schema) => schema
        .positive(t("feedingModal.errors.customWeight.positive"))
        .required(t("feedingModal.errors.customWeight.required"))
        .typeError(t("feedingModal.errors.customWeight.number")),
      otherwise: (schema) => schema.notRequired(),
    }),
  quantity: Yup.number()
    .positive(t("feedingModal.errors.quantity.positive"))
    .integer(t("feedingModal.errors.quantity.integer"))
    .required(t("feedingModal.errors.quantity.required"))
    .typeError(t("feedingModal.errors.quantity.number")),
  wasEaten: Yup.boolean().required(),
  retryAfterDays: Yup.number()
    .transform((value, originalValue) => originalValue === "" ? null : value)
    .positive(t("feedingModal.errors.retry.positive"))
    .integer(t("feedingModal.errors.retry.integer"))
    .required(t("feedingModal.errors.retry.required"))
    .typeError(t("feedingModal.errors.retry.number")),
  notes: Yup.string().max(300, t("feedingModal.errors.notes.max")),
});

// Helper traduzione (identico)
const translateFoodType = (foodType, t) => {
  return t(`inventoryPage.${foodType}`, { defaultValue: foodType });
};

const MultipleFeedingModal = ({ show, handleClose, reptileIds, onSuccess }) => {
  const { t } = useTranslation();

  const [inventory, setInventory] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  const { register, handleSubmit, watch, reset, control, setValue, formState: { errors } } = useForm({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      foodType: '',
      customFoodType: '',
      customWeight: '',
      customWeightUnit: 'g',
      quantity: 1,
      wasEaten: true,
      retryAfterDays: '',
      notes: '',
    },
    resolver: yupResolver(validationSchema(t)),
  });

  const foodTypeValue = watch('foodType');
  const wasEatenValue = watch('wasEaten');

  // Funzione per caricare SOLO l'inventario
  const fetchInventory = async () => {
    try {
      const inventoryRes = await api.get('/inventory');
      const sortedInventory = [...inventoryRes.data].sort(
        (a, b) => b.weightPerUnit - a.weightPerUnit
      );
      setInventory(sortedInventory);
    } catch (err) {
      setInventory([]);
    }
  };

  useEffect(() => {
    if (show) {
      fetchInventory(); // Carica l'inventario all'apertura
    } else {
      reset(); // Resetta il form alla chiusura
      setServerError(null);
    }
  }, [show]); // Dipendenza solo da 'show'

  const onSubmit = async (formData) => {
    setIsSubmitting(true);
    const isCustom = formData.foodType === 'Altro';
    const item = isCustom ? null : inventory.find(i => i._id === formData.foodType);
    const weight = isCustom ? formData.customWeight : item?.weightPerUnit;
    const unit = isCustom ? formData.customWeightUnit : 'g';
    const weightInGrams = unit === 'kg' ? weight * 1000 : weight;

    // Prepara il payload per l'endpoint multiplo
    const payload = {
      reptileIds: Array.from(reptileIds), // Converte il Set in Array
      date: formData.date,
      foodType: isCustom ? ` ${formData.customFoodType}` : item?.foodType,
      quantity: formData.quantity,
      wasEaten: formData.wasEaten,
      retryAfterDays: formData.retryAfterDays,
      weightPerUnit: weightInGrams,
      notes: formData.notes || undefined,
    };

    try {
      setServerError(null);
      // Chiama il NUOVO endpoint
      await api.post(`/feedings/multiple/feedings`, payload);
      onSuccess?.(); // Chiama il callback di successo (che chiude e aggiorna)
    } catch (err) {
      const message = err?.response?.data?.message || t('feedingModal.errors.generic');
      setServerError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Classi CSS (copiate da FeedingModal)
  const inputClasses = "w-full px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition disabled:bg-gray-100";
  const labelClasses = "block text-sm font-medium text-gray-600 mb-1";
  const sectionTitleClasses = "text-lg font-semibold text-gray-800 flex items-center gap-2";
  const sectionClasses = "bg-white p-6 rounded-lg shadow-sm border border-gray-200";
  const errorTextClasses = "flex items-center gap-1 mt-1 text-sm text-red-600";

  return (
    <Transition show={show} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child as={Fragment} {...{ enter: "ease-out duration-300", enterFrom: "opacity-0", enterTo: "opacity-100", leave: "ease-in duration-200", leaveFrom: "opacity-100", leaveTo: "opacity-0" }}>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child as={Fragment} {...{ enter: "ease-out duration-300", enterFrom: "opacity-0 scale-95", enterTo: "opacity-100 scale-100", leave: "ease-in duration-200", leaveFrom: "opacity-100 scale-100", leaveTo: "opacity-0 scale-95" }}>
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-slate-50 p-6 shadow-xl transition-all"> {/* Ridotto max-w- a 2xl */}

                <div className="flex items-start justify-between">
                  <Dialog.Title className="text-xl font-bold text-gray-900">
                    {/* NUOVO: Titolo per modale multiplo */}
                    {t('multipleFeedingModal.title', { count: reptileIds.size })}
                  </Dialog.Title>
                  <button onClick={handleClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition">
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                <div className="mt-6 space-y-6">
                  {/* Sezione UNICA: Aggiungi Pasto */}
                  <div className={sectionClasses}>
                    <h3 className={sectionTitleClasses}>
                      <PlusCircleIcon className="w-6 h-6 text-emerald-600" />
                      {t('multipleFeedingModal.actions.add')}
                    </h3>
                    <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
                      {/* Form (identico a FeedingModal) */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                        <div>
                          <label htmlFor="date" className={labelClasses}>{t('feedingModal.fields.date')}</label>
                          <input id="date" type="date" {...register('date')} className={`${inputClasses} ${errors.date && 'border-red-500'}`} disabled={isSubmitting} />
                          {errors.date && <p className={errorTextClasses}><ExclamationCircleIcon className='w-4 h-4' />{errors.date.message}</p>}
                        </div>
                        <div className="lg:col-span-2">
                          <label htmlFor="foodType" className={labelClasses}>{t('feedingModal.fields.foodType')}</label>
                          <select id="foodType" {...register('foodType')} className={`${inputClasses} ${errors.foodType && 'border-red-500'}`} disabled={isSubmitting}>
                            <option value="">{t('feedingModal.placeholders.chooseFromInventory')}</option>
                            {inventory.map(item => (<option key={item._id} value={item._id}>{translateFoodType(item.foodType, t)} ({item.quantity} {t("feedingModal.pz")} {item.weightPerUnit}g)</option>))}
                            <option value="Altro">{t('feedingModal.placeholders.other')}</option>
                          </select>
                          {errors.foodType && <p className={errorTextClasses}><ExclamationCircleIcon className='w-4 h-4' />{errors.foodType.message}</p>}
                        </div>
                        {foodTypeValue === 'Altro' && (
                          <>
                            <div>
                              <label htmlFor="customFoodType" className={labelClasses}>{t('feedingModal.fields.customFoodType')}</label>
                              <input id="customFoodType" type="text" {...register('customFoodType')} placeholder="Es. Topi" className={`${inputClasses} ${errors.customFoodType && 'border-red-500'}`} disabled={isSubmitting} />
                              {errors.customFoodType && <p className={errorTextClasses}><ExclamationCircleIcon className='w-4 h-4' />{errors.customFoodType.message}</p>}
                            </div>
                            <div>
                              <label htmlFor="customWeight" className={labelClasses}>{t('feedingModal.fields.customWeight')}</label>
                              <div className="flex space-x-2">
                                <input
                                  id="customWeight"
                                  type="number"
                                  step="0.1"
                                  {...register('customWeight')}
                                  placeholder="Es. 15"
                                  className={`${inputClasses} ${errors.customWeight && 'border-red-500'}`}
                                  disabled={isSubmitting}
                                />
                                <select
                                  {...register('customWeightUnit')}
                                  className={`${inputClasses} w-24`}
                                  disabled={isSubmitting}
                                >
                                  <option value="g">g</option>
                                  <option value="kg">kg</option>
                                </select>
                              </div>
                              {errors.customWeight && <p className={errorTextClasses}><ExclamationCircleIcon className='w-4 h-4' />{errors.customWeight.message}</p>}
                            </div>
                          </>
                        )}
                        <div>
                          <label htmlFor="quantity" className={labelClasses}>{t('feedingModal.fields.quantity')}</label>
                          <input id="quantity" type="number" {...register('quantity')} className={`${inputClasses} ${errors.quantity && 'border-red-500'}`} disabled={isSubmitting} />
                          {errors.quantity && <p className={errorTextClasses}><ExclamationCircleIcon className='w-4 h-4' />{errors.quantity.message}</p>}
                        </div>
                        <div className="lg:col-span-3">
                          <Controller
                            name="wasEaten"
                            control={control}
                            render={({ field: { onChange, value } }) => (
                              <RadioGroup value={value} onChange={onChange} disabled={isSubmitting}>
                                <RadioGroup.Label className={labelClasses}>{t('feedingModal.fields.result')}</RadioGroup.Label>
                                <div className="grid grid-cols-2 gap-3 mt-2">
                                  <RadioGroup.Option value={true}>
                                    {({ checked }) => (
                                      <div className={`${checked ? 'bg-emerald-600 text-white' : 'bg-white'} relative cursor-pointer rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition`}>
                                        <div className="flex items-center justify-center gap-2 py-2 px-4">
                                          <CheckCircleIcon className={`h-5 w-5 ${checked ? 'text-white' : 'text-green-600'}`} />
                                          <RadioGroup.Label as="span" className="text-sm font-medium">
                                            {t('feedingModal.result.eaten')}
                                          </RadioGroup.Label>
                                        </div>
                                      </div>
                                    )}
                                  </RadioGroup.Option>
                                  <RadioGroup.Option value={false}>
                                    {({ checked }) => (
                                      <div className={`${checked ? 'bg-red-600 text-white' : 'bg-white'} relative cursor-pointer rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition`}>
                                        <div className="flex items-center justify-center gap-2 py-2 px-4">
                                          <XCircleIcon className={`h-5 w-5 ${checked ? 'text-white' : 'text-red-600'}`} />
                                          <RadioGroup.Label as="span" className="text-sm font-medium">
                                            {t('feedingModal.result.refused')}
                                          </RadioGroup.Label>
                                        </div>
                                      </div>
                                    )}
                                  </RadioGroup.Option>
                                </div>
                              </RadioGroup>
                            )}
                          />
                        </div>
                        <div>
                          <label htmlFor="retryAfterDays" className={labelClasses}>
                            {t("feedingModal.fields.retryAfterDays")}
                          </label>
                          <div className="flex gap-2">
                            <input
                              id="retryAfterDays"
                              type="number"
                              {...register('retryAfterDays')}
                              list="retryDaysOptions"
                              className={`text-black mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${errors.retryAfterDays ? "border-red-500" : ""}`}
                            />
                            <datalist id="retryDaysOptions">
                              <option value="7" />
                              <option value="14" />
                            </datalist>
                          </div>
                          {errors.retryAfterDays && (
                            <p className="mt-1 text-sm text-red-600">{errors.retryAfterDays.message}</p>
                          )}
                        </div>
                        <div className="lg:col-span-3">
                          <label htmlFor="notes" className={labelClasses}>Note</label>
                          <textarea id="notes" {...register('notes')} rows={2} placeholder={t('feedingModal.placeholders.notesExample')} className={inputClasses} disabled={isSubmitting} />
                        </div>
                      </div>
                      
                      {serverError && (
                        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                          <ExclamationCircleIcon className="w-4 h-4" />
                          {serverError}
                        </p>
                      )}

                      {/* Pulsante Submit */}
                      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="relative inline-flex items-center justify-center w-full sm:w-auto px-6 py-2.5 text-sm font-medium rounded-md shadow-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 active:scale-95 disabled:bg-emerald-300 disabled:cursor-not-allowed transition-all duration-200"
                        >
                          {isSubmitting ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                              </svg>
                              {t('feedingModal.actions.saving')}
                            </>
                          ) : (
                            // NUOVO: Testo pulsante
                            t('multipleFeedingModal.actions.addSubmit')
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default MultipleFeedingModal;