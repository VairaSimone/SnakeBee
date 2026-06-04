import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../features/userSlice.jsx';
import api from '../services/api';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { FiLock, FiFileText, FiInfo } from 'react-icons/fi';

const ManualCitesPage = () => {
    const { t } = useTranslation();
    const user = useSelector(selectUser);

    // Stato iniziale con autocompilazione opzionale dei dati utente loggato
    const [formData, setFormData] = useState({
        signerDetails: {
            name: user?.name || '',
            surname: user?.surname || '',
            email: user?.email || '',
            phoneNumber: user?.phoneNumber || '',
            address: '',
            city: '',
            province: ''
        },
        receiverDetails: {
            name: '',
            surname: '',
            email: '',
            phone: '',
            address: '',
            city: '',
            province: ''
        },
        animalDetails: {
            species: '',
            morph: '',
            sex: 'M',
            birthDate: '',
            originCountry: '',
            microchip: '',
            protocolNumber: ''
        },
        extraDetails: {
            date: new Date().toISOString().split('T')[0]
        },
        options: {
            includeProfilePic: true
        }
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleNestedChange = (section, field, value) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await api.post('/reptile/download-cites-manual', formData, {
                responseType: 'blob',
            });

            // Creazione del link di download del file PDF restituito dal server
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${t('ManualCites.fileNamePrefix')}${formData.animalDetails.species || t('ManualCites.animalFallback')}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Errore nel download del CITES manuale:", err);
            setError(t('ManualCites.errorGenerate'));
        } finally {
            setLoading(false);
        }
    };

    const citesNote = t('ManualCites.note');

    return (
        <div className="min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                <Link to="/dashboard" className="text-emerald-600 dark:text-emerald-400 hover:underline mb-6 inline-block font-medium">
                    ← {t('ManualCites.backToDashboard')}
                </Link>

                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 sm:p-8">
                    <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-black">{t('ManualCites.title')}</h1>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">{t('ManualCites.subtitle')}</p>

                    {/* Nota visibile solo se è presente la traduzione (es. per l'Inglese) */}
                    {citesNote && (
                        <div className="mb-8 p-4 bg-amber-50 border-l-4 border-amber-500 text-black rounded-r-xl font-medium flex items-center gap-3">
                            <FiInfo className="text-black text-xl flex-shrink-0" />
                            <span>{citesNote}</span>
                        </div>
                    )}

                    {error && <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-xl font-medium">{error}</div>}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        
                        {/* SEZIONE 1: CEDENTE */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold border-b pb-2 border-slate-100 dark:border-slate-700 text-emerald-600">
                                {t('ManualCites.section1Title')}
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-black">{t('ManualCites.name')}</label>
                                    <input type="text" required value={formData.signerDetails.name} onChange={(e) => handleNestedChange('signerDetails', 'name', e.target.value)} className="w-full p-2.5 rounded-xl border text-black" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-black">{t('ManualCites.surname')}</label>
                                    <input type="text" required value={formData.signerDetails.surname} onChange={(e) => handleNestedChange('signerDetails', 'surname', e.target.value)} className="w-full p-2.5 rounded-xl border text-black" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-black">{t('ManualCites.email')}</label>
                                    <input type="email" required value={formData.signerDetails.email} onChange={(e) => handleNestedChange('signerDetails', 'email', e.target.value)} className="w-full p-2.5 rounded-xl border text-black" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-black">{t('ManualCites.phone')}</label>
                                    <input type="text" required value={formData.signerDetails.phoneNumber} onChange={(e) => handleNestedChange('signerDetails', 'phoneNumber', e.target.value)} className="w-full p-2.5 rounded-xl border text-black" />
                                </div>
                                <div className="sm:col-span-2 grid grid-cols-3 gap-2">
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium mb-1 text-black">{t('ManualCites.address')}</label>
                                        <input type="text" required placeholder={t('ManualCites.addressPlaceholder')} value={formData.signerDetails.address} onChange={(e) => handleNestedChange('signerDetails', 'address', e.target.value)} className="w-full p-2.5 rounded-xl border text-black" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-black">{t('ManualCites.city')}</label>
                                        <input type="text" required placeholder={t('ManualCites.cityPlaceholder')} value={formData.signerDetails.city} onChange={(e) => handleNestedChange('signerDetails', 'city', e.target.value)} className="w-full p-2.5 rounded-xl border text-black" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-black">{t('ManualCites.province')}</label>
                                        <input type="text" required placeholder={t('ManualCites.provincePlaceholder')} maxLength={2} value={formData.signerDetails.province} onChange={(e) => handleNestedChange('signerDetails', 'province', e.target.value)} className="w-full p-2.5 rounded-xl border text-black" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SEZIONE 2: CESSIONARIO */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold border-b pb-2 border-slate-100 dark:border-slate-700 text-emerald-600 dark:text-emerald-400">
                                {t('ManualCites.section2Title')}
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-black">{t('ManualCites.name')}</label>
                                    <input type="text" required value={formData.receiverDetails.name} onChange={(e) => handleNestedChange('receiverDetails', 'name', e.target.value)} className="w-full p-2.5 rounded-xl border" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-black">{t('ManualCites.surname')}</label>
                                    <input type="text" required value={formData.receiverDetails.surname} onChange={(e) => handleNestedChange('receiverDetails', 'surname', e.target.value)} className="w-full p-2.5 rounded-xl border" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-black">{t('ManualCites.email')}</label>
                                    <input type="email" value={formData.receiverDetails.email} onChange={(e) => handleNestedChange('receiverDetails', 'email', e.target.value)} className="w-full p-2.5 rounded-xl border" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-black">{t('ManualCites.phone')}</label>
                                    <input type="text" value={formData.receiverDetails.phone} onChange={(e) => handleNestedChange('receiverDetails', 'phone', e.target.value)} className="w-full p-2.5 rounded-xl border" />
                                </div>
                                <div className="sm:col-span-2 grid grid-cols-3 gap-2">
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium mb-1 text-black">{t('ManualCites.address')}</label>
                                        <input type="text" required value={formData.receiverDetails.address} onChange={(e) => handleNestedChange('receiverDetails', 'address', e.target.value)} className="w-full p-2.5 rounded-xl border" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-black">{t('ManualCites.city')}</label>
                                        <input type="text" required value={formData.receiverDetails.city} onChange={(e) => handleNestedChange('receiverDetails', 'city', e.target.value)} className="w-full p-2.5 rounded-xl border" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-black">{t('ManualCites.province')}</label>
                                        <input type="text" required maxLength={2} value={formData.receiverDetails.province} onChange={(e) => handleNestedChange('receiverDetails', 'province', e.target.value)} className="w-full p-2.5 rounded-xl border" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SEZIONE 3: ANIMALE */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold border-b pb-2 border-slate-100 dark:border-slate-700 text-emerald-600 dark:text-emerald-400">
                                {t('ManualCites.section3Title')}
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-black">{t('ManualCites.species')}</label>
                                    <input type="text" required placeholder={t('ManualCites.speciesPlaceholder')} value={formData.animalDetails.species} onChange={(e) => handleNestedChange('animalDetails', 'species', e.target.value)} className="w-full p-2.5 rounded-xl border" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-black">{t('ManualCites.morph')}</label>
                                    <input type="text" placeholder={t('ManualCites.morphPlaceholder')} value={formData.animalDetails.morph} onChange={(e) => handleNestedChange('animalDetails', 'morph', e.target.value)} className="w-full p-2.5 rounded-xl border" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-black">{t('ManualCites.sex')}</label>
                                    <select value={formData.animalDetails.sex} onChange={(e) => handleNestedChange('animalDetails', 'sex', e.target.value)} className="w-full p-2.5 rounded-xl border text-black dark:text-white">
                                        <option value="M">{t('ManualCites.sexM')}</option>
                                        <option value="F">{t('ManualCites.sexF')}</option>
                                        <option value="N/D">{t('ManualCites.sexND')}</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-black">{t('ManualCites.birthDate')}</label>
                                    <input type="date" value={formData.animalDetails.birthDate} onChange={(e) => handleNestedChange('animalDetails', 'birthDate', e.target.value)} className="w-full p-2.5 rounded-xl border text-black dark:text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-black">{t('ManualCites.originCountry')}</label>
                                    <input type="text" placeholder={t('ManualCites.originCountryPlaceholder')} value={formData.animalDetails.originCountry} onChange={(e) => handleNestedChange('animalDetails', 'originCountry', e.target.value)} className="w-full p-2.5 rounded-xl border" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-black">{t('ManualCites.microchip')}</label>
                                    <input type="text" value={formData.animalDetails.microchip} onChange={(e) => handleNestedChange('animalDetails', 'microchip', e.target.value)} className="w-full p-2.5 rounded-xl border" />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium mb-1 text-black">{t('ManualCites.protocolNumber')}</label>
                                    <input type="text" required placeholder={t('ManualCites.protocolNumberPlaceholder')} value={formData.animalDetails.protocolNumber} onChange={(e) => handleNestedChange('animalDetails', 'protocolNumber', e.target.value)} className="w-full p-2.5 rounded-xl border" />
                                </div>
                            </div>
                        </div>

                        {/* DETTAGLI EXTRA */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t pt-4 border-slate-100 dark:border-slate-700">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-black">{t('ManualCites.documentDate')}</label>
                                <input type="date" value={formData.extraDetails.date} onChange={(e) => handleNestedChange('extraDetails', 'date', e.target.value)} className="w-full p-2.5 rounded-xl border text-black dark:text-white" />
                            </div>
                            <div className="flex items-center h-full pt-6">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input type="checkbox" checked={formData.options.includeProfilePic} onChange={(e) => handleNestedChange('options', 'includeProfilePic', e.target.checked)} className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500" />
                                    <span className="text-sm font-medium">{t('ManualCites.includeProfilePic')}</span>
                                </label>
                            </div>
                        </div>

                        {/* TASTO INVIO */}
                        <button type="submit" disabled={loading} className="w-full bg-emerald-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-emerald-700 transition-colors shadow-md disabled:opacity-50">
                            {loading ? t('ManualCites.loadingPdf') : t('ManualCites.downloadBtn')}
                        </button>

                    </form>
                </div>
            </div>
        </div>
    );
};

export default ManualCitesPage;