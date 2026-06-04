import React, { useState } from 'react';
import { 
    FaTimes, FaInfoCircle, FaFileExcel, FaUpload, 
    FaClipboardList, FaCheckCircle, FaExclamationTriangle, FaSpinner 
} from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const ImportInfoModal = ({ show, onClose, onImport }) => {
    const { t } = useTranslation();
    const [error, setError] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    if (!show) return null;

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setError(null);
        setIsUploading(true);
        
        try {
            await onImport(e);
            setError(null);
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || t('importAnimals.errors.default', 'Errore durante l\'importazione del file.');
            setError(errorMessage);
        } finally {
            setIsUploading(false);
            e.target.value = "";
        }
    };

    const handleModalClose = () => {
        setError(null);
        setIsUploading(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden relative border border-sand">
                
                {/* Header */}
                <div className="p-6 bg-forest text-white flex justify-between items-center">
                    <h2 className="text-xl font-bold flex items-center gap-2.5">
                        <FaFileExcel className="text-emerald-300" /> {t('importAnimals.title', 'Importazione Massiva Rettili')}
                    </h2>
                    <button 
                        onClick={handleModalClose} 
                        className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-all"
                        disabled={isUploading}
                    >
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Body (Scrollabile) */}
                <div className="p-6 overflow-y-auto text-charcoal space-y-6">
                    
                    {/* BANNER NOTIFICA ERRORE */}
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl animate-fade-in flex gap-3 items-start">
                            <FaExclamationTriangle className="text-red-500 shrink-0 mt-0.5" size={18} />
                            <div className="text-sm">
                                <h4 className="font-bold text-red-800 mb-0.5">{t('importAnimals.errors.title', 'Impossibile completare l\'importazione')}</h4>
                                <p className="text-red-700 font-medium leading-relaxed">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Info Alert */}
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-xl flex gap-3 items-start">
                        <FaInfoCircle className="text-blue-500 shrink-0 mt-0.5" size={18} />
                        <p className="text-sm text-blue-800 leading-relaxed">
                            {t('importAnimals.infoAlert', 'Prepara un file Excel (.xlsx) o CSV. La prima riga deve contenere le intestazioni delle colonne. Il sistema mappa i campi in modo intelligente, ma ti consigliamo di seguire lo schema sottostante.')}
                        </p>
                    </div>

                    {/* Card Download Template */}
                    <div className="bg-sand/40 border border-sand p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="space-y-0.5">
                            <h4 className="font-bold text-sm text-charcoal">{t('importAnimals.templateCard.title', 'Hai bisogno di una base di partenza?')}</h4>
                            <p className="text-xs text-charcoal/60">{t('importAnimals.templateCard.subtitle', 'Scarica il file pre-compilato con le intestazioni corrette e i dati di esempio.')}</p>
                        </div>
                        <a 
                            href="/template_importazione_rettili.xlsx" 
                            download="Template_Importazione_Rettili.xlsx"
                            className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-xs font-bold text-forest shadow-sm hover:shadow transition-all no-underline shrink-0"
                        >
                            <FaClipboardList className="text-emerald-600" /> {t('importAnimals.templateCard.button', 'Scarica Modello Excel')}
                        </a>
                    </div>

                    {/* Campi Principali */}
                    <div className="space-y-3">
                        <h3 className="font-bold text-md text-olive flex items-center gap-2">
                            <span className="bg-olive/10 text-olive text-xs h-5 w-5 rounded-full inline-flex items-center justify-center font-bold">1</span>
                            {t('importAnimals.sections.mainFields', 'Campi Principali')}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <div className="flex items-center gap-2">
                                <FaCheckCircle className="text-red-500 shrink-0" size={14} />
                                <span><strong className="font-mono bg-white px-1.5 py-0.5 rounded border border-gray-200">specie</strong> <span className="text-xs text-red-500 font-semibold">({t('importAnimals.fields.required', 'Obbligatorio')})</span></span>
                            </div>
                            <div className="flex items-center gap-2">
                                <FaCheckCircle className="text-red-500 shrink-0" size={14} />
                                <span><strong className="font-mono bg-white px-1.5 py-0.5 rounded border border-gray-200">sesso</strong> <span className="text-xs text-red-500 font-semibold">({t('importAnimals.fields.sexRequired', 'Obbligatorio: M, F, Unknown')})</span></span>
                            </div>
                            <div className="flex items-center gap-2">
                                <FaCheckCircle className="text-gray-400 shrink-0" size={14} />
                                <span><strong className="font-mono bg-white px-1.5 py-0.5 rounded border border-gray-200">nome</strong> <span className="text-xs text-charcoal/40">({t('importAnimals.fields.optional', 'Opzionale')})</span></span>
                            </div>
                            <div className="flex items-center gap-2">
                                <FaCheckCircle className="text-gray-400 shrink-0" size={14} />
                                <span><strong className="font-mono bg-white px-1.5 py-0.5 rounded border border-gray-200">morph</strong> <span className="text-xs text-charcoal/40">({t('importAnimals.fields.optional', 'Opzionale')})</span></span>
                            </div>
                            <div className="flex items-center gap-2">
                                <FaCheckCircle className="text-gray-400 shrink-0" size={14} />
                                <span><strong className="font-mono bg-white px-1.5 py-0.5 rounded border border-gray-200">nascita</strong> <span className="text-xs text-charcoal/40">({t('importAnimals.fields.dateFormat', 'Formato data: GG/MM/AAAA')})</span></span>
                            </div>
                            <div className="flex items-center gap-2">
                                <FaCheckCircle className="text-gray-400 shrink-0" size={14} />
                                <span><strong className="font-mono bg-white px-1.5 py-0.5 rounded border border-gray-200">{t('importAnimals.fields.foodType', 'tipo cibo')}</strong> / <strong className="font-mono bg-white px-1.5 py-0.5 rounded border border-gray-200">{t('importAnimals.fields.foodWeight', 'peso cibo')}</strong></span>
                            </div>
                        </div>
                    </div>

                    {/* Campi Specifici (Tabella) */}
                    <div className="space-y-3">
                        <h3 className="font-bold text-md text-olive flex items-center gap-2">
                            <span className="bg-olive/10 text-olive text-xs h-5 w-5 rounded-full inline-flex items-center justify-center font-bold">2</span>
                            {t('importAnimals.sections.advancedFields', 'Campi Avanzati e Annidati')}
                        </h3>
                        <p className="text-xs text-charcoal/60">{t('importAnimals.sections.advancedFieldsDesc', 'Per associare dati contabili, genealogici o sanitari usa queste esatte intestazioni:')}</p>
                        
                        <div className="overflow-hidden border border-gray-200 rounded-xl shadow-sm">
                            <table className="w-full text-xs text-left border-collapse">
                                <thead>
                                    <tr className="bg-sand text-charcoal font-bold border-b border-gray-200">
                                        <th className="p-3 w-5/12">{t('importAnimals.table.headerExcel', 'Intestazione Excel')}</th>
                                        <th className="p-3 w-7/12">{t('importAnimals.table.headerDb', 'Proprietà Database Assegnata')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    <tr className="hover:bg-gray-50 transition-colors">
                                        <td className="p-3 font-mono font-bold text-forest bg-gray-50/50">{t('importAnimals.table.headers.purchasePrice', 'prezzo acquisto')}</td>
                                        <td className="p-3 text-charcoal/80">{t('importAnimals.table.descriptions.purchasePrice', "Costo d'acquisto iniziale dell'animale")}</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50 transition-colors">
                                        <td className="p-3 font-mono font-bold text-forest bg-gray-50/50">{t('importAnimals.table.headers.price', 'prezzo')}</td>
                                        <td className="p-3 text-charcoal/80">{t('importAnimals.table.descriptions.price', 'Prezzo o valore stimato per la vendita')}</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50 transition-colors">
                                        <td className="p-3 font-mono font-bold text-forest bg-gray-50/50">{t('importAnimals.table.headers.parents', 'padre / madre')}</td>
                                        <td className="p-3 text-charcoal/80">{t('importAnimals.table.descriptions.parents', "Identificativo dei genitori per l'albero genealogico")}</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50 transition-colors">
                                        <td className="p-3 font-mono font-bold text-forest bg-gray-50/50">{t('importAnimals.table.headers.cites', 'numero cites')}</td>
                                        <td className="p-3 text-charcoal/80">{t('importAnimals.table.descriptions.cites', 'Codice del documento CITES o di protocollo')}</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50 transition-colors">
                                        <td className="p-3 font-mono font-bold text-forest bg-gray-50/50">{t('importAnimals.table.headers.microchip', 'microchip')}</td>
                                        <td className="p-3 text-charcoal/80">{t('importAnimals.table.descriptions.microchip', 'Codice identificativo del transponder/chip')}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-4 border-t border-sand bg-gray-50 flex justify-end items-center gap-3">
                    <button 
                        onClick={handleModalClose}
                        className="px-5 py-2.5 rounded-xl font-semibold text-sm bg-white border border-gray-300 hover:bg-gray-50 text-charcoal transition-all"
                        disabled={isUploading}
                    >
                        {t('importAnimals.buttons.cancel', 'Annulla')}
                    </button>
                    
                    <label className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold shadow-md transform transition-all select-none ${
                        isUploading 
                            ? 'bg-forest/50 text-white/70 cursor-not-allowed' 
                            : 'bg-forest text-white cursor-pointer hover:bg-olive hover:-translate-y-0.5'
                    }`}>
                        {isUploading ? (
                            <>
                                <FaSpinner className="animate-spin" /> {t('importAnimals.buttons.processing', 'Elaborazione file...')}
                            </>
                        ) : (
                            <>
                                <FaUpload /> {t('importAnimals.buttons.upload', 'Scegli File e Importa')}
                            </>
                        )}
                        <input 
                            type="file" 
                            className="hidden" 
                            accept=".csv, .xlsx, .xls"
                            onChange={handleFileChange} 
                            disabled={isUploading}
                        />
                    </label>
                </div>
            </div>
        </div>
    );
};

export default ImportInfoModal;