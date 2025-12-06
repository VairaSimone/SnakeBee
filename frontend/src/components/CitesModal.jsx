import React, { useState } from 'react';
import { 
    X, 
    User, 
    UserCheck, 
    FileText, 
    Calendar, 
    MapPin, 
    Globe, 
    Download,
    AlertCircle 
} from 'lucide-react'; 
import api from '../services/api';

const CitesModal = ({ reptile, user, onClose }) => {
    const [loading, setLoading] = useState(false);
    
    // Stato del form pre-compilato con i dati DB
    const [formData, setFormData] = useState({
        signerDetails: {
            name: '', 
            surname: '',
            address: '',
            city: '',
            province: '',
            phoneNumber: user?.phoneNumber || '',
            email: user?.email || '',
            cap: '' // Aggiunto per coerenza se servisse, altrimenti ignoralo
        },
        receiverDetails: {
            name: '',
            surname:  '',
            address: '',
            city: '',   
            province: '',
            phone:'',
            email:  '',
            cap: '',
        },
        extraDetails: {
            place: user?.billingDetails?.address?.city || 'Roma',
            date: new Date().toISOString().split('T')[0],
            originCountry: 'IT'
        },
        options: {
            includeProfilePic: false
        }
    });

    const handleChange = (section, field, value) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const handleDownload = async () => {
        setLoading(true);
        try {
            const response = await api.post(`/reptile/download-cites/${reptile._id}`, formData, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `CITES_${reptile.name}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            
            onClose();
        } catch (error) {
            console.error("Errore download:", error);
            alert("Errore durante la generazione del PDF");
        } finally {
            setLoading(false);
        }
    };

    // Stile comune per gli input
    const inputClasses = "w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400";
    const labelClasses = "block text-xs font-medium text-gray-500 mb-1 ml-1";

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-600" />
                            Genera Documento CITES
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">Compila i dettagli necessari per il certificato di cessione.</p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body Scrollable */}
                <div className="p-6 overflow-y-auto custom-scrollbar space-y-8">

                    {/* Sezione Cedente */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 text-gray-800 border-b pb-2 border-gray-100">
                            <div className="p-1.5 bg-blue-50 rounded-md text-blue-600">
                                <User className="w-4 h-4" />
                            </div>
                            <h3 className="font-semibold text-sm uppercase tracking-wide">Dati Cedente (Tu)</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className={labelClasses}>Nome</label>
                                <input 
                                    type="text" placeholder="Il tuo nome" className={inputClasses}
                                    value={formData.signerDetails.name}
                                    onChange={(e) => handleChange('signerDetails', 'name', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className={labelClasses}>Cognome</label>
                                <input 
                                    type="text" placeholder="Il tuo cognome" className={inputClasses}
                                    value={formData.signerDetails.surname}
                                    onChange={(e) => handleChange('signerDetails', 'surname', e.target.value)}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className={labelClasses}>Indirizzo</label>
                                <input 
                                    type="text" placeholder="Via, Numero Civico" className={inputClasses}
                                    value={formData.signerDetails.address}
                                    onChange={(e) => handleChange('signerDetails', 'address', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className={labelClasses}>Città</label>
                                <input 
                                    type="text" placeholder="Comune" className={inputClasses}
                                    value={formData.signerDetails.city}
                                    onChange={(e) => handleChange('signerDetails', 'city', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className={labelClasses}>Provincia</label>
                                <input 
                                    type="text" placeholder="Es. RM" className={inputClasses}
                                    value={formData.signerDetails.province}
                                    maxLength={2}
                                    onChange={(e) => handleChange('signerDetails', 'province', e.target.value)}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Sezione Ricevente */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 text-gray-800 border-b pb-2 border-gray-100">
                            <div className="p-1.5 bg-green-50 rounded-md text-green-600">
                                <UserCheck className="w-4 h-4" />
                            </div>
                            <h3 className="font-semibold text-sm uppercase tracking-wide">Dati Ricevente</h3>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3 flex gap-3 items-start">
                            <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                            <p className="text-xs text-yellow-700 leading-relaxed">
                                Compila con cura i dati della persona che riceverà l'animale. Questi dati appariranno sul documento ufficiale.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className={labelClasses}>Nome</label>
                                <input 
                                    type="text" placeholder="Nome ricevente" className={inputClasses}
                                    value={formData.receiverDetails.name}
                                    onChange={(e) => handleChange('receiverDetails', 'name', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className={labelClasses}>Cognome</label>
                                <input 
                                    type="text" placeholder="Cognome ricevente" className={inputClasses}
                                    value={formData.receiverDetails.surname}
                                    onChange={(e) => handleChange('receiverDetails', 'surname', e.target.value)}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className={labelClasses}>Indirizzo Completo</label>
                                <input 
                                    type="text" placeholder="Via, Civico" className={inputClasses}
                                    value={formData.receiverDetails.address}
                                    onChange={(e) => handleChange('receiverDetails', 'address', e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4 md:col-span-2">
                                <div>
                                    <label className={labelClasses}>Città</label>
                                    <input 
                                        type="text" placeholder="Comune" className={inputClasses}
                                        value={formData.receiverDetails.city}
                                        onChange={(e) => handleChange('receiverDetails', 'city', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className={labelClasses}>Provincia</label>
                                    <input 
                                        type="text" placeholder="Es. MI" className={inputClasses}
                                        value={formData.receiverDetails.province}
                                        maxLength={2}
                                        onChange={(e) => handleChange('receiverDetails', 'province', e.target.value)}
                                    />
                                </div>
                            </div>
                             <div className="grid grid-cols-2 gap-4 md:col-span-2">
                                <div>
                                    <label className={labelClasses}>CAP</label>
                                    <input 
                                        type="text" placeholder="00100" className={inputClasses}
                                        value={formData.receiverDetails.cap}
                                        onChange={(e) => handleChange('receiverDetails', 'cap', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className={labelClasses}>Telefono</label>
                                    <input 
                                        type="text" placeholder="+39..." className={inputClasses}
                                        value={formData.receiverDetails.phone}
                                        onChange={(e) => handleChange('receiverDetails', 'phone', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <label className={labelClasses}>Email</label>
                                <input 
                                    type="email" placeholder="email@esempio.com" className={inputClasses}
                                    value={formData.receiverDetails.email}
                                    onChange={(e) => handleChange('receiverDetails', 'email', e.target.value)}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Dettagli Documento */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 text-gray-800 border-b pb-2 border-gray-100">
                            <div className="p-1.5 bg-purple-50 rounded-md text-purple-600">
                                <FileText className="w-4 h-4" />
                            </div>
                            <h3 className="font-semibold text-sm uppercase tracking-wide">Dettagli Finali</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className={labelClasses}>
                                    <MapPin className="w-3 h-3 inline mr-1"/> Luogo Firma
                                </label>
                                <input 
                                    type="text" className={inputClasses}
                                    value={formData.extraDetails.place}
                                    onChange={(e) => handleChange('extraDetails', 'place', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className={labelClasses}>
                                    <Calendar className="w-3 h-3 inline mr-1"/> Data
                                </label>
                                <input 
                                    type="date" className={inputClasses}
                                    value={formData.extraDetails.date}
                                    onChange={(e) => handleChange('extraDetails', 'date', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className={labelClasses}>
                                    <Globe className="w-3 h-3 inline mr-1"/> Paese Origine
                                </label>
                                <input 
                                    type="text" className={inputClasses}
                                    value={formData.extraDetails.originCountry}
                                    onChange={(e) => handleChange('extraDetails', 'originCountry', e.target.value)}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Opzioni */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center gap-3 hover:bg-gray-100 transition-colors cursor-pointer" 
                         onClick={() => handleChange('options', 'includeProfilePic', !formData.options.includeProfilePic)}>
                        <input 
                            type="checkbox" 
                            id="profilePic"
                            checked={formData.options.includeProfilePic}
                            onChange={(e) => handleChange('options', 'includeProfilePic', e.target.checked)}
                            className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                        />
                        <label htmlFor="profilePic" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
                            Includi la mia foto profilo nel documento
                        </label>
                    </div>

                </div>

                {/* Footer Actions */}
                <div className="px-6 py-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 sticky bottom-0">
                    <button 
                        onClick={onClose}
                        className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-4 focus:outline-none focus:ring-gray-100 transition-all"
                    >
                        Annulla
                    </button>
                    <button 
                        onClick={handleDownload}
                        disabled={loading}
                        className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-500/50 shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:shadow-none flex items-center gap-2 transition-all"
                    >
                        {loading ? (
                            <>Generazione in corso...</>
                        ) : (
                            <>
                                <Download className="w-4 h-4" />
                                Scarica PDF
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CitesModal;