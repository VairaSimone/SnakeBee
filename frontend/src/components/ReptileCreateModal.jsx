import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, Transition, Switch } from '@headlessui/react';
import { Fragment } from 'react';
import api from '../services/api';
import { useSelector } from 'react-redux';
import { selectUser } from '../features/userSlice';
import { PhotoIcon, IdentificationIcon, UsersIcon, DocumentTextIcon, XMarkIcon, ExclamationCircleIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const getPlanLimits = (user) => {
  const plan = user?.subscription?.plan || 'NEOPHYTE';
  const status = user?.subscription?.status;
  const isActive = status === 'active' || status === 'pending_cancellation';

  if (!isActive) return { plan: 'NEOPHYTE', publicReptiles: 1 };
  
  switch(plan) {
    case 'APPRENTICE': return { plan, publicReptiles: 3 };
    case 'PRACTITIONER': return { plan, publicReptiles: 10 };
    case 'BREEDER': return { plan, publicReptiles: Infinity }; // Infinito per 'null'
    default: return { plan: 'NEOPHYTE', publicReptiles: 1 };
  }
};

const ReptileCreateModal = ({ show, handleClose, setReptiles, onSuccess }) => {
  const user = useSelector(selectUser);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const [formErrors, setFormErrors] = useState({});
  const [toastMsg, setToastMsg] = useState(null);
  const userLimits = getPlanLimits(user);
  const [imagePreviews, setImagePreviews] = useState([]);

  const initialFormData = {
    name: '',
    species: '',
    morph: '',
    image: [],
    birthDate: '',
    sex: 'M',
    isBreeder: false,
    isPublic: false,
    notes: '',
    previousOwner: '', 
    parents: { father: '', mother: '' },
    documents: {
      cites: { number: '', issueDate: '', issuer: '', load: '', unload: '' },
      microchip: { code: '', implantDate: '' },
    },
      foodType: '',     
  weightPerUnit: '',    
  nextMealDay: '', 
  };

  const [formData, setFormData] = useState(initialFormData);
  const inputClasses = "w-full px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition";

  const inputSmall = inputClasses + " text-sm";

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setFormErrors({});
    setImagePreviews([]);
    setToastMsg(null);
  }, []);


  useEffect(() => {
    if (show) {
      resetForm();
    }
  }, [show, resetForm]);


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };
  const handleNestedChange = (e, section, subsection, field) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...prev[section][subsection],
          [field]: value
        }
      }
    }));
  }

  const handleParentChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      parents: {
        ...prev.parents,
        [name]: value
      }
    }));
  }
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: [file] });
      const preview = URL.createObjectURL(file);
      setImagePreviews([preview]);
    }
  };
  const removeImage = (index) => {
    const newPreviews = [...imagePreviews];
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);
    setImagePreviews(newPreviews);
    const newImages = [...formData.image];
    newImages.splice(index, 1);
    setFormData({ ...formData, image: newImages });
  }

const foodTypeOptions = [
  { value: 'Topo', label: t('ReptileCreateModal.fields.foodTypeOptions.mouse') },
  { value: 'Ratto', label: t('ReptileCreateModal.fields.foodTypeOptions.rat') },
  { value: 'Coniglio', label: t('ReptileCreateModal.fields.foodTypeOptions.rabbit') },
  { value: 'Pulcino', label: t('ReptileCreateModal.fields.foodTypeOptions.chick') },
  { value: 'Altro', label: t('ReptileCreateModal.fields.foodTypeOptions.other') },
];


  const validateForm = () => {
    const errors = {};
    const today = new Date();
    const minDate = new Date();
    minDate.setFullYear(today.getFullYear() - 100);

    // --- MAIN FIELDS ---
    if (!formData.species.trim()) errors.species = t('ReptileCreateModal.validation.speciesRequired');
    if (!formData.morph.trim()) errors.morph = t('ReptileCreateModal.validation.morphRequired');

    if (!formData.sex) errors.sex = t('ReptileCreateModal.validation.sexRequired');

    if (!formData.birthDate) {
      errors.birthDate = t('ReptileCreateModal.validation.birthRequired');
    } else {
      const birth = new Date(formData.birthDate);
      if (birth > today) errors.birthDate = t('ReptileCreateModal.validation.birthFuture');
      else if (birth < minDate) errors.birthDate = t('ReptileCreateModal.validation.birthTooOld');
    }
if (formData.weightPerUnit && formData.weightPerUnit <= 0) errors.weightPerUnit = t('ReptileCreateModal.validation.weightPositive');
if (formData.nextMealDay && formData.nextMealDay <= 0) errors.nextMealDay = t('ReptileCreateModal.validation.nextMealPositive');
    // Optional: notes max length
    if (formData.notes.length > 500) errors.notes = t('ReptileCreateModal.validation.notesTooLong');
if (formData.previousOwner && formData.previousOwner.length > 100) errors.previousOwner = t('ReptileCreateModal.validation.previousOwnerTooLong');
    // --- PARENTS ---
    const namePattern = /^[a-zA-Zàèéìòù' -]+$/;
    if (formData.parents.father && !namePattern.test(formData.parents.father)) {
      errors.father = t('ReptileCreateModal.validation.fatherInvalid');
    }
    if (formData.parents.mother && !namePattern.test(formData.parents.mother)) {
      errors.mother = t('ReptileCreateModal.validation.motherInvalid');
    }

    // --- IMAGES ---
    if (formData.image.length === 0) {
    } else {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      formData.image.forEach((file, idx) => {
        const allowedExt = ['.jpg', '.jpeg', '.png', '.webp'];
        const hasValidType = !file.type || allowedTypes.includes(file.type)
          || allowedExt.some(ext => file.name.toLowerCase().endsWith(ext));

        if (!hasValidType) {
          errors[`image_${idx}`] = t('ReptileCreateModal.validation.imageType');
        }
        if (file.size > 15  * 1024 * 1024) { 
          errors[`image_${idx}`] = t('ReptileCreateModal.validation.imageSize');
        }
      });
    }

    // --- DOCUMENTS ---
    const { cites, microchip } = formData.documents;

    // CITES
    if (cites.number && cites.number.length > 50) errors.citesNumber = t('ReptileCreateModal.validation.citesNumberTooLong');
    if (cites.issueDate) {
      const issueDate = new Date(cites.issueDate);
      if (issueDate > today) errors.citesIssueDate = t('ReptileCreateModal.validation.citesIssueFuture');
    }
    if (cites.issuer && cites.issuer.length > 100) errors.citesIssuer = t('ReptileCreateModal.validation.citesIssuerTooLong');
if (cites.load && cites.load.length > 50) errors.citesLoad = t('ReptileCreateModal.validation.citesLoadTooLong');
    if (cites.unload && cites.unload.length > 50) errors.citesUnload = t('ReptileCreateModal.validation.citesUnloadTooLong');
    // MICROCHIP
    if (microchip.code && microchip.code.length > 50) errors.microchipCode = t('ReptileCreateModal.validation.microchipCodeTooLong');
    if (microchip.implantDate) {
      const implantDate = new Date(microchip.implantDate);
      if (implantDate > today) errors.microchipDate = t('ReptileCreateModal.validation.microchipDateFuture');
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});

    setLoading(true);
    const formDataToSend = new FormData();

    Object.entries(formData).forEach(([key, val]) => {
      if (key === 'image') {
        val.forEach(file => formDataToSend.append('image', file));
      } else if (key === 'parents' || key === 'documents') {
        formDataToSend.append(key, JSON.stringify(val));
      } else if (key === 'weightPerUnit' || key === 'nextMealDay') {
    formDataToSend.append(key, Number(val)); // cast qui
  } else {
    formDataToSend.append(key, val);
  }
    });

    formDataToSend.append('user', user._id);

    try {
      const { data } = await api.post('/reptile/', formDataToSend, { headers: { 'Content-Type': 'multipart/form-data' } });
      setToastMsg({ type: 'success', text: t('ReptileCreateModal.messages.success') });
      setReptiles((prev) => [...prev, data]);
      if (onSuccess) onSuccess(data);
      handleClose();
    } catch (err) {
      let msg = t('ReptileCreateModal.messages.error');
      if (err.response) {
        if (err.response.data?.message) {
          msg = err.response.data.message;
        } else if (typeof err.response.data === 'string') {
          msg = err.response.data;
        }
      } else if (err.message) {
        msg = err.message;
      }
      setToastMsg({ type: 'danger', text: msg });
    } finally {
      setLoading(false);
    }
  };
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
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-slate-50 p-6 shadow-xl transition-all">

                <div className="flex items-start justify-between">
                  <Dialog.Title className="text-xl font-bold text-gray-900">
                    {t('ReptileCreateModal.modal.title')}
                  </Dialog.Title>
                  <button onClick={handleClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition">
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="mt-6 space-y-6">

                  {/* SEZIONE DATI PRINCIPALI */}
                  <div className={sectionClasses}>
                    <h3 className={sectionTitleClasses}>
                      <IdentificationIcon className="w-6 h-6 text-emerald-600" />
                      {t('ReptileCreateModal.sections.mainData')}
                    </h3>
                    {/* Riga 1: Nome, Specie, Morph */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-6 gap-y-4 mt-4">
                      <div>
                        <label htmlFor="name" className={labelClasses}>{t('ReptileCreateModal.fields.name')}</label>
                        <input id="name" type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Es. Spike" className={`${inputClasses} ${formErrors.name ? 'border-red-500' : ''}`} />
                        {formErrors.name && <p className={errorTextClasses}><ExclamationCircleIcon className='w-4 h-4' />{formErrors.name}</p>}
                      </div>
                      <div>
                        <label htmlFor="species" className={labelClasses}>{t('ReptileCreateModal.fields.species')}<span className="text-red-500">*</span></label>
                        <input id="species" type="text" name="species" value={formData.species} onChange={handleChange} className={`${inputClasses} ${formErrors.species ? 'border-red-500' : ''}`} placeholder={t('ReptileCreateModal.fields.speciesPlaceholder')} />
                        {formErrors.species && <p className={errorTextClasses}><ExclamationCircleIcon className='w-4 h-4' />{formErrors.species}</p>}
                      </div>
                      <div>
                        <label htmlFor="morph" className={labelClasses}>{t('ReptileCreateModal.fields.morph')}<span className="text-red-500">*</span></label>
                        <input id="morph" type="text" name="morph" value={formData.morph} onChange={handleChange} className={`${inputClasses} ${formErrors.morph ? 'border-red-500' : ''}`} placeholder={t('ReptileCreateModal.fields.morphPlaceholder')} />
                        {formErrors.morph && <p className={errorTextClasses}><ExclamationCircleIcon className='w-4 h-4' />{formErrors.morph}</p>}
                      </div>
                    </div>
                     {/* Riga 2: Data Nascita, Sesso, Allevatore */}
                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-6 gap-y-4 mt-4">
                       <div>
                        <label htmlFor="birthDate" className={labelClasses}>{t('ReptileCreateModal.fields.birthDate')}<span className="text-red-500">*</span></label>
                        <input id="birthDate" type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} className={`${inputClasses} ${formErrors.birthDate ? 'border-red-500' : ''}`} />
                        {formErrors.birthDate && <p className={errorTextClasses}><ExclamationCircleIcon className='w-4 h-4' />{formErrors.birthDate}</p>}
                      </div>
                      <div>
                        <label htmlFor="sex" className={labelClasses}>{t('ReptileCreateModal.fields.sex')} <span className="text-red-500">*</span></label>
                        <select id="sex" name="sex" value={formData.sex} onChange={handleChange} className={`${inputClasses} ${formErrors.sex ? 'border-red-500' : ''}`}>
                          <option value="Unknown">{t('ReptileCreateModal.fields.sexNotSpecified')}</option>
                          <option value="F">{t('ReptileCreateModal.fields.sexFemale')}</option>
                          <option value="M">{t('ReptileCreateModal.fields.sexMale')}</option>
                        </select>
                        {formErrors.sex && <p className={errorTextClasses}><ExclamationCircleIcon className='w-4 h-4' />{formErrors.sex}</p>}
                      </div>
                       <div>
                         <label htmlFor="previousOwner" className={labelClasses}>{t('ReptileCreateModal.fields.previousOwner')}</label>
                         <input
                           id="previousOwner"
                           type="text"
                           name="previousOwner"
                           value={formData.previousOwner}
                           onChange={handleChange}
                           placeholder="Es. Mario Rossi"
                           className={`${inputClasses} ${formErrors.previousOwner ? 'border-red-500' : ''}`}
                         />
                         {formErrors.previousOwner && <p className={errorTextClasses}><ExclamationCircleIcon className='w-4 h-4' />{formErrors.previousOwner}</p>}
                       </div>
                    </div>
                     {/* Riga 3: Checkbox Riproduttore */}
              
              {/* Riga 3: Sostituita con Toggles */}
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">

                        {/* Toggle Riproduttore */}
                        <Switch.Group as="div" className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 h-full">
                          <span className="flex-grow flex flex-col pr-2">
                            <Switch.Label as="span" className="text-sm font-medium text-gray-900" passive>
                              {t('ReptileCreateModal.fields.isBreeder')}
                            </Switch.Label>
                            <Switch.Description as="span" className="text-xs text-gray-500">
                              {t('ReptileCreateModal.fields.isBreederDesc', 'Seleziona se questo animale fa parte del tuo programma di riproduzione.')}
                            </Switch.Description>
                          </span>
                          <Switch
                            checked={formData.isBreeder}
                            onChange={(value) => setFormData(prev => ({ ...prev, isBreeder: value }))}
                            className={`${
                              formData.isBreeder ? 'bg-emerald-600' : 'bg-gray-200'
                            } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2`}
                          >
                            <span
                              aria-hidden="true"
                              className={`${
                                formData.isBreeder ? 'translate-x-5' : 'translate-x-0'
                              } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                            />
                          </Switch>
                        </Switch.Group>

                        {/* Toggle Pubblico Shop */}
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 h-full">
                          <Switch.Group as="div" className="flex items-center justify-between">
                            <span className="flex-grow flex flex-col pr-2">
                              <Switch.Label as="span" className={`text-sm font-medium ${userLimits.publicReptiles === 0 ? 'text-gray-400' : 'text-gray-900'}`} passive>
                                {t('ReptileCreateModal.fields.isPublic', 'Pubblica nello Shop')}
                                {formData.isPublic 
                                  ? <EyeIcon className="inline w-4 h-4 ml-1.5 text-blue-600"/> 
                                  : <EyeSlashIcon className="inline w-4 h-4 ml-1.5 text-gray-500"/>}
                              </Switch.Label>
                              <Switch.Description as="span" className={`text-xs ${userLimits.publicReptiles === 0 ? 'text-gray-400' : 'text-gray-500'}`}>
                                {t('ReptileCreateModal.fields.isPublicDesc', 'Rendi questo animale visibile a tutti nello shop pubblico.')}
                              </Switch.Description>
                            </span>
                            <Switch
                              checked={formData.isPublic}
                              onChange={(value) => setFormData(prev => ({ ...prev, isPublic: value }))}
                              disabled={userLimits.publicReptiles === 0}
                              className={`${
                                formData.isPublic ? 'bg-blue-600' : 'bg-gray-200'
                              } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              <span
                                aria-hidden="true"
                                className={`${
                                  formData.isPublic ? 'translate-x-5' : 'translate-x-0'
                                } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                              />
                            </Switch>
                          </Switch.Group>
                          
                          {/* Messaggi di avviso/info integrati */}
                          { userLimits.publicReptiles === 0 && (
                            <p className="mt-2 text-xs text-red-600 border-t border-gray-200 pt-2">
                              {t('ReptileCreateModal.publicDisabled', 'Per pubblicare rettili nello shop, è necessario un piano ')}
                              <Link to="/pricing" className="underline font-semibold">{t('ReptileCreateModal.subscription', 'abbonamento')}</Link>.
                            </p>
                          )}
                          { userLimits.publicReptiles > 0 && userLimits.publicReptiles !== Infinity && (
                            <p className="mt-2 text-xs text-blue-600 border-t border-gray-200 pt-2">
                              {t('ReptileCreateModal.publicLimit', 'Puoi pubblicare fino a {{count}} rettili con il tuo piano {{plan}}.', { count: userLimits.publicReptiles, plan: userLimits.plan })}
                            </p>
                          )}
                        </div>
                      </div>
                  </div>


                  {/* SEZIONE ALIMENTAZIONE */}
                   <div className={sectionClasses}>
                    <h3 className={sectionTitleClasses}>
                       🍽️ {t('reptileEditModal.reptile.feeding')} {/* Assumendo che la traduzione esista già */}
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-6 gap-y-4 mt-4">
                        <div>
                          <label htmlFor="foodType" className={labelClasses}>{t('ReptileCreateModal.fields.foodType')}</label>
                          <select
                            id="foodType"
                            name="foodType"
                            value={formData.foodType}
                            onChange={handleChange}
                            className={`${inputClasses} ${formErrors.foodType ? 'border-red-500' : ''}`}
                          >
                            <option value="">{t('ReptileCreateModal.fields.selectOption')}</option>
                            {foodTypeOptions.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                          {formErrors.foodType && <p className={errorTextClasses}><ExclamationCircleIcon className='w-4 h-4' />{formErrors.foodType}</p>}
                        </div>

                        <div>
                          <label htmlFor="weightPerUnit" className={labelClasses}>{t('ReptileCreateModal.fields.weightPerUnit')}</label>
                          <input
                            id="weightPerUnit"
                            type="number"
                            name="weightPerUnit"
                            value={formData.weightPerUnit}
                            onChange={handleChange}
                            className={`${inputClasses} ${formErrors.weightPerUnit ? 'border-red-500' : ''}`}
                            placeholder="Es. 50 g"
                          />
                          {formErrors.weightPerUnit && <p className={errorTextClasses}><ExclamationCircleIcon className='w-4 h-4' />{formErrors.weightPerUnit}</p>}
                        </div>

                        <div>
                          <label htmlFor="nextMealDay" className={labelClasses}>{t('ReptileCreateModal.fields.nextMealDay')}</label>
                          <input
                            id="nextMealDay"
                            type="number"
                            name="nextMealDay"
                            value={formData.nextMealDay}
                            onChange={handleChange}
                            className={`${inputClasses} ${formErrors.nextMealDay ? 'border-red-500' : ''}`}
                            placeholder="Es. 3"
                          />
                          {formErrors.nextMealDay && <p className={errorTextClasses}><ExclamationCircleIcon className='w-4 h-4' />{formErrors.nextMealDay}</p>}
                        </div>
                    </div>
                  </div>

                  {/* SEZIONE IMMAGINI */}
                  <div className={sectionClasses}>
                    <h3 className={sectionTitleClasses}>
                      <PhotoIcon className="w-6 h-6 text-emerald-600" />
                      {t('ReptileCreateModal.sections.images')}
                    </h3>
                    <div className="mt-4">
                      <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                        <div className="text-center">
                          <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />
                          <div className="mt-4 flex text-sm leading-6 text-gray-600">
                            <label htmlFor="file-upload" className="relative cursor-pointer rounded-md bg-white font-semibold text-emerald-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-emerald-600 focus-within:ring-offset-2 hover:text-emerald-500">
                              <span>{t('ReptileCreateModal.fields.fileUpload')}</span>
                              <input id="file-upload" name="image" type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
                            </label>
                            <p className="pl-1">{t('ReptileCreateModal.fields.fileOrDrag')}</p>
                          </div>
                          <p className="text-xs leading-5 text-gray-500">{t('ReptileCreateModal.fields.fileFormats')}</p>
                        </div>
                      </div>
                    </div>
                    {imagePreviews.length > 0 && (
                      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {imagePreviews.map((previewUrl, index) => (
                          <div key={index} className="relative group">
                            <img src={previewUrl} alt={`Anteprima ${index + 1}`} className="h-28 w-28 rounded-md object-cover" />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <XMarkIcon className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                 {/* SEZIONE PARENTI */}
                  <div className={sectionClasses}>
                    <h3 className={sectionTitleClasses}>
                      <UsersIcon className="w-6 h-6 text-emerald-600" />
                      {t('ReptileCreateModal.sections.parents')}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                      <div>
                        <label htmlFor="father" className={labelClasses}>{t('ReptileCreateModal.fields.father')}</label>
                        <input
                          id="father"
                          type="text"
                          name="father"
                          value={formData.parents.father}
                          onChange={handleParentChange}
                          className={`${inputClasses} ${formErrors.father ? 'border-red-500' : ''}`}
                          placeholder={t('ReptileCreateModal.fields.fatherPlaceholder')}
                        />
                        {formErrors.father && <p className={errorTextClasses}><ExclamationCircleIcon className='w-4 h-4' />{formErrors.father}</p>}
                      </div>
                      <div>
                        <label htmlFor="mother" className={labelClasses}>{t('ReptileCreateModal.fields.mother')}</label>
                        <input
                          id="mother"
                          type="text"
                          name="mother"
                          value={formData.parents.mother}
                          onChange={handleParentChange}
                          className={`${inputClasses} ${formErrors.mother ? 'border-red-500' : ''}`}
                          placeholder={t('ReptileCreateModal.fields.motherPlaceholder')}
                        />
                        {formErrors.mother && <p className={errorTextClasses}><ExclamationCircleIcon className='w-4 h-4' />{formErrors.mother}</p>}
                      </div>
                    </div>
                  </div>

                  {/* SEZIONE DOCUMENTI */}
                  <div className={sectionClasses}>
                    <h3 className={sectionTitleClasses}>
                      <DocumentTextIcon className="w-6 h-6 text-emerald-600" />
                      {t('ReptileCreateModal.sections.documents')}
                    </h3>
                     {/* Riga 1 Docs: CITES Info */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-6 gap-y-4 mt-4">
                      <div>
                        <label className={labelClasses}>{t('ReptileCreateModal.fields.citesNumber')}</label>
                        <input
                          type="text"
                          onChange={(e) => handleNestedChange(e, 'documents', 'cites', 'number')}
                          value={formData.documents.cites.number}
                          className={`${inputClasses} ${formErrors.citesNumber ? 'border-red-500' : ''}`}
                        />
                        {formErrors.citesNumber && <p className={errorTextClasses}><ExclamationCircleIcon className='w-4 h-4' />{formErrors.citesNumber}</p>}
                      </div>
                      <div>
                        <label className={labelClasses}>{t('ReptileCreateModal.fields.citesIssueDate')}</label>
                        <input
                          type="date"
                          onChange={(e) => handleNestedChange(e, 'documents', 'cites', 'issueDate')}
                          value={formData.documents.cites.issueDate}
                          className={`${inputClasses} ${formErrors.citesIssueDate ? 'border-red-500' : ''}`}
                        />
                        {formErrors.citesIssueDate && <p className={errorTextClasses}><ExclamationCircleIcon className='w-4 h-4' />{formErrors.citesIssueDate}</p>}
                      </div>
                      <div>
                        <label className={labelClasses}>{t('ReptileCreateModal.fields.citesIssuer')}</label>
                        <input
                          type="text"
                          onChange={(e) => handleNestedChange(e, 'documents', 'cites', 'issuer')}
                          value={formData.documents.cites.issuer}
                          className={`${inputClasses} ${formErrors.citesIssuer ? 'border-red-500' : ''}`}
                        />
                        {formErrors.citesIssuer && <p className={errorTextClasses}><ExclamationCircleIcon className='w-4 h-4' />{formErrors.citesIssuer}</p>}
                      </div>
                     </div>
                      {/* Riga 2 Docs: CITES Load/Unload */}
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mt-4">
                      <div>
                        <label className={labelClasses}>{t('ReptileCreateModal.fields.citesLoad')}</label>
                        <input
                          type="text"
                          onChange={(e) => handleNestedChange(e, 'documents', 'cites', 'load')}
                          value={formData.documents.cites.load}
                          className={`${inputClasses} ${formErrors.citesLoad ? 'border-red-500' : ''}`}
                        />
                        {formErrors.citesLoad && <p className={errorTextClasses}><ExclamationCircleIcon className='w-4 h-4' />{formErrors.citesLoad}</p>}
                      </div>
                      <div>
                        <label className={labelClasses}>{t('ReptileCreateModal.fields.citesUnload')}</label>
                        <input
                          type="text"
                          onChange={(e) => handleNestedChange(e, 'documents', 'cites', 'unload')}
                          value={formData.documents.cites.unload}
                          className={`${inputClasses} ${formErrors.citesUnload ? 'border-red-500' : ''}`}
                        />
                        {formErrors.citesUnload && <p className={errorTextClasses}><ExclamationCircleIcon className='w-4 h-4' />{formErrors.citesUnload}</p>}
                      </div>
                    </div>
                     {/* Riga 3 Docs: Microchip */}
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mt-4 pt-4 border-t border-gray-200">
                      <div>
                        <label className={labelClasses}>{t('ReptileCreateModal.fields.microchipCode')}</label>
                        <input
                          type="text"
                          onChange={(e) => handleNestedChange(e, 'documents', 'microchip', 'code')}
                          value={formData.documents.microchip.code}
                          className={`${inputClasses} ${formErrors.microchipCode ? 'border-red-500' : ''}`}
                        />
                        {formErrors.microchipCode && <p className={errorTextClasses}><ExclamationCircleIcon className='w-4 h-4' />{formErrors.microchipCode}</p>}
                      </div>
                      <div>
                        <label className={labelClasses}>{t('ReptileCreateModal.fields.microchipDate')}</label>
                        <input
                          type="date"
                          onChange={(e) => handleNestedChange(e, 'documents', 'microchip', 'implantDate')}
                          value={formData.documents.microchip.implantDate}
                          className={`${inputClasses} ${formErrors.microchipDate ? 'border-red-500' : ''}`}
                        />
                        {formErrors.microchipDate && <p className={errorTextClasses}><ExclamationCircleIcon className='w-4 h-4' />{formErrors.microchipDate}</p>}
                      </div>
                    </div>
                  </div>

                   {/* SEZIONE NOTE (Spostata qui per raggruppare i campi di testo principali) */}
                   <div className={sectionClasses}>
                      <h3 className={sectionTitleClasses}>
                         📝 {t('ReptileCreateModal.fields.notes')} {/* Icona e titolo per la sezione note */}
                      </h3>
                      <div className="mt-4">
                       {/*<label htmlFor="notes" className={labelClasses}>{t('ReptileCreateModal.fields.notes')}</label> */} {/* Label ridondante se c'è il titolo */}
                        <textarea
                          id="notes"
                          name="notes"
                          rows={4} // Aumentato un po'
                          value={formData.notes}
                          onChange={handleChange}
                          placeholder={t('ReptileCreateModal.fields.notesPlaceholder')}
                          className={`${inputClasses} ${formErrors.notes ? 'border-red-500' : ''}`}
                        />
                        {formErrors.notes && <p className={errorTextClasses}><ExclamationCircleIcon className='w-4 h-4' />{formErrors.notes}</p>}
                      </div>
                   </div>


                  {/* BOTTONI AZIONE */}
                  <div className="mt-8 pt-5 border-t border-gray-200 flex justify-end gap-4">
                    <button type="button" onClick={handleClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500 transition">
                      {t('ReptileCreateModal.modal.cancel')}
                    </button>
                    <button type="submit" className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-emerald-600 border border-transparent rounded-md hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-500 disabled:bg-emerald-300 transition" disabled={loading}>
                      {loading ? t('ReptileCreateModal.modal.saving') : t('ReptileCreateModal.modal.save')}
                    </button>
                  </div>
                </form>

                 {/* Toast Message */}
                 {toastMsg && (
                    <div
                      className={`fixed bottom-5 right-5 z-[100] px-4 py-3 rounded-md text-sm font-medium shadow-lg ${toastMsg.type === 'danger'
                          ? 'bg-red-100 text-red-700 border border-red-300'
                          : 'bg-green-100 text-green-700 border border-green-300'
                        }`}
                    >
                      {toastMsg.text}
                    </div>
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
