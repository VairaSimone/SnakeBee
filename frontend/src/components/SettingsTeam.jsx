import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaTrash, FaUserPlus, FaUserShield, FaExclamationTriangle } from 'react-icons/fa';
import { getDelegates, addDelegate, removeDelegate } from '../services/api';

const SettingsTeam = () => {
    const { t } = useTranslation();
    const [delegates, setDelegates] = useState([]);
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('editor');
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Nuovo stato per gestire il modale di conferma
    const [delegateToRemove, setDelegateToRemove] = useState(null);
    const [isRemoving, setIsRemoving] = useState(false);

    // Carica i collaboratori all'avvio
    useEffect(() => {
        fetchDelegates();
    }, []);

    const fetchDelegates = async () => {
        try {
            const res = await getDelegates();
            setDelegates(res.data);
        } catch (err) {
            console.error(t('SettingsTeam.fetchError'), err);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        try {
            await addDelegate(email, role);
            setSuccess(t('SettingsTeam.addSuccess'));
            setEmail(''); // Svuota il campo
            fetchDelegates(); // Ricarica la lista
        } catch (err) {
            setError(err.response?.data?.message || t('SettingsTeam.addError'));
        } finally {
            setIsLoading(false);
        }
    };

    // Apre il modale impostando l'ID del delegato da rimuovere
    const openRemoveModal = (delegateId) => {
        setDelegateToRemove(delegateId);
    };

    // Esegue effettivamente la rimozione
    const confirmRemove = async () => {
        if (!delegateToRemove) return;
        
        setIsRemoving(true);
        setError('');
        setSuccess('');
        
        try {
            await removeDelegate(delegateToRemove);
            setSuccess(t('SettingsTeam.removeSuccess'));
            setDelegates(delegates.filter(d => d.user._id !== delegateToRemove));
        } catch (err) {
            setError(err.response?.data?.message || t('SettingsTeam.removeError'));
        } finally {
            setIsRemoving(false);
            setDelegateToRemove(null); // Chiude il modale
        }
    };

    return (
        <div className="p-4 md:p-8 relative">
            {/* MODALE DI CONFERMA */}
            {delegateToRemove && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-scale-up">
                        <div className="flex items-center gap-4 mb-4 text-red-600">
                            <div className="p-3 bg-red-100 rounded-full">
                                <FaExclamationTriangle className="text-xl" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">{t('SettingsTeam.modalTitle')}</h3>
                        </div>
                        <p className="text-gray-600 mb-6">
                            {t('SettingsTeam.modalBody')}
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDelegateToRemove(null)}
                                disabled={isRemoving}
                                className="px-4 py-2 font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                            >
                                {t('SettingsTeam.cancel')}
                            </button>
                            <button
                                onClick={confirmRemove}
                                disabled={isRemoving}
                                className="px-4 py-2 font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition flex items-center gap-2"
                            >
                                {isRemoving ? <span className="loader w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : t('SettingsTeam.remove')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-3xl mx-auto space-y-6 animate-fade-in-up">                
                {/* Header Pagina */}
                <div>
                    <h1 className="text-3xl font-bold text-[#2B2B2B] flex items-center gap-3">
                        <FaUserShield className="text-[#228B22]" /> 
                        {t('SettingsTeam.pageTitle')}
                    </h1>
                    <p className="text-gray-600 mt-2">
                        {t('SettingsTeam.pageDesc')}
                    </p>
                </div>

                {/* Notifiche */}
                {error && (
                    <div className="bg-red-100 text-red-700 p-3 rounded-md animate-shake">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="bg-green-100 text-green-800 p-3 rounded-md">
                        {success}
                    </div>
                )}

                {/* Form Aggiunta Collaboratore */}
                <div className="bg-white rounded-2xl shadow-md p-6">
                    <h2 className="text-xl font-semibold text-[#2B2B2B] mb-4">{t('SettingsTeam.formTitle')}</h2>
                    <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <input
                                type="email"
                                placeholder={t('SettingsTeam.emailPlaceholder')}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#228B22]"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading || !email}
                            className={`px-6 py-2 rounded-md text-white font-medium transition flex items-center justify-center gap-2 ${
                                isLoading || !email ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#228B22] hover:bg-green-700'
                            }`}
                        >
                            {isLoading ? <span className="loader text-sm"></span> : <FaUserPlus />}
                            {t('SettingsTeam.invite')}
                        </button>
                    </form>
                    <p className="text-xs text-gray-500 mt-2">
                        {t('SettingsTeam.userMustBeRegistered')}
                    </p>
                </div>

                {/* Lista Collaboratori */}
                <div className="bg-white rounded-2xl shadow-md p-6">
                    <h2 className="text-xl font-semibold text-[#2B2B2B] mb-4">{t('SettingsTeam.teamMembers')}</h2>
                    
                    {delegates.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">{t('SettingsTeam.noCollaborators')}</p>
                    ) : (
                        <ul className="divide-y divide-gray-100">
                            {delegates.map((delegate) => (
                                <li key={delegate._id} className="py-4 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="font-medium text-gray-800">
                                            {delegate.user?.firstName} {delegate.user?.lastName}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            {delegate.user?.email}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => openRemoveModal(delegate.user._id)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-full transition"
                                        title={t('SettingsTeam.removeCollaborator')}
                                    >
                                        <FaTrash />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

            </div>
        </div>
    );
};

export default SettingsTeam;