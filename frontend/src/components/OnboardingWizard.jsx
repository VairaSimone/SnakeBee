import React, { useState } from 'react';
import api from '../services/api';
import { 
  FaCheck, FaArrowRight, FaArrowLeft, FaSnake, 
  FaBell, FaGlobe, FaInstagram, FaFacebook, FaMars, FaVenus, FaQuestion 
} from 'react-icons/fa';
import { useTranslation } from 'react-i18next'; // Se usi i18next, altrimenti usa testo statico

const OnboardingWizard = ({ user, onComplete }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Stato iniziale basato sui modelli Mongoose
  const [formData, setFormData] = useState({
    // Step 1: Profilo
    breedingName: user.name || '',
    language: user.language || 'it',
    instagram: user.socials?.instagram || '',
    
    // Step 2: Primo Rettile
    reptileName: '',
    reptileSpecies: '',
    reptileMorph: '',
    reptileSex: 'Unknown', // Enum: 'M', 'F', 'Unknown'
    reptileBirthDate: new Date().toISOString().split('T')[0],

    // Step 3: Alimentazione & Notifiche
    foodType: 'Topo', // Enum: 'Topo', 'Ratto', 'Coniglio', etc.
    feedingInterval: 7, // nextMealDay
    enableReminders: true
  });

  // Validazione semplice
  const validateStep = (currentStep) => {
    const newErrors = {};
    let isValid = true;

    if (currentStep === 1) {
      if (!formData.breedingName.trim()) {
        newErrors.breedingName = 'Il nome è obbligatorio';
        isValid = false;
      }
    }
    if (currentStep === 2) {
      if (!formData.reptileName.trim()) newErrors.reptileName = 'Nome richiesto';
      if (!formData.reptileSpecies.trim()) newErrors.reptileSpecies = 'Specie richiesta';
      if (Object.keys(newErrors).length > 0) isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleNext = async () => {
    if (validateStep(step)) {
      if (step < 3) {
        setStep(step + 1);
      } else {
        await finishOnboarding();
      }
    }
  };

  const finishOnboarding = async () => {
    setLoading(true);
    try {
      // 1. Aggiorna User (Nome, Lingua, Social, Email Prefs)
      await api.put(`/user/${user._id}`, {
        name: formData.breedingName,
        language: formData.language,
        socialsInstagram: formData.instagram, // Assicurati che il controller gestisca questo mapping
        receiveFeedingEmails: formData.enableReminders
      });

      // 2. Crea il Primo Rettile (Dati completi)
      if (formData.reptileName && formData.reptileSpecies) {
        const reptilePayload = {
          name: formData.reptileName,
          species: formData.reptileSpecies,
          morph: formData.reptileMorph || 'Classic',
          sex: formData.reptileSex,
          birthDate: formData.reptileBirthDate,
          foodType: formData.foodType,
          nextMealDay: Number(formData.feedingInterval),
          user: user._id,
          status: 'active'
        };
        
        // Usa FormData se il backend si aspetta multipart/form-data (come nel CreateModal)
        // Altrimenti JSON standard. Qui uso JSON per semplicità, adatta se serve FormData.
        await api.post('/reptile/', reptilePayload);
      }

      // 3. Completa Onboarding (Assicurati che questa rotta esista nel backend!)
      // Se non esiste, potresti usare un flag locale o aggiornare un campo custom nell'utente
      try {
        await api.put(`/user/complete-onboarding`, {});
      } catch (e) {
        console.warn("Rotta complete-onboarding non trovata, procedo comunque.");
      }
      
      onComplete();
    } catch (error) {
      console.error("Errore onboarding", error);
      setErrors({ submit: "Qualcosa è andato storto. Riprova." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header & Progress */}
        <div className="bg-gray-50 px-8 py-6 border-b border-gray-100">
            <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Step {step} di 3</span>
                <div className="flex gap-1">
                    {[1, 2, 3].map(i => (
                        <div key={i} className={`h-2 w-8 rounded-full transition-all duration-300 ${i <= step ? 'bg-emerald-500' : 'bg-gray-200'}`} />
                    ))}
                </div>
            </div>
            <h2 className="text-2xl font-extrabold text-gray-800">
                {step === 1 && "Benvenuto su SnakeBee"}
                {step === 2 && "Aggiungi il tuo primo animale 🐍"}
                {step === 3 && "Imposta l'alimentazione 🍽️"}
            </h2>
            <p className="text-gray-500 text-sm mt-1">
                {step === 1 && "Configuriamo il tuo profilo allevatore."}
                {step === 2 && "Inserisci i dettagli del tuo primo rettile."}
                {step === 3 && "Automatizziamo il calendario pasti."}
            </p>
        </div>

        {/* Body Scrollable */}
        <div className="p-8 overflow-y-auto custom-scrollbar">
          
          {/* STEP 1: Profilo */}
          {step === 1 && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Nome Allevamento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Allevamento / Utente</label>
                <input
                  type="text"
                  className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition ${errors.breedingName ? 'border-red-500' : 'border-gray-300'}`}
                  value={formData.breedingName}
                  onChange={(e) => setFormData({...formData, breedingName: e.target.value})}
                  placeholder="Es. Royal Pythons Italia"
                />
                {errors.breedingName && <p className="text-red-500 text-xs mt-1">{errors.breedingName}</p>}
              </div>

              {/* Lingua */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lingua Preferita</label>
                <div className="grid grid-cols-2 gap-4">
                    <button 
                        onClick={() => setFormData({...formData, language: 'it'})}
                        className={`p-3 rounded-xl border-2 flex items-center justify-center gap-2 transition ${formData.language === 'it' ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-bold' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                        🇮🇹 Italiano
                    </button>
                    <button 
                        onClick={() => setFormData({...formData, language: 'en'})}
                        className={`p-3 rounded-xl border-2 flex items-center justify-center gap-2 transition ${formData.language === 'en' ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-bold' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                        🇬🇧 English
                    </button>
                </div>
              </div>

              {/* Social (Opzionale) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Instagram (Opzionale)</label>
                <div className="relative">
                    <FaInstagram className="absolute left-3 top-3.5 text-gray-400" />
                    <input
                    type="text"
                    className="w-full pl-10 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={formData.instagram}
                    onChange={(e) => setFormData({...formData, instagram: e.target.value})}
                    placeholder="username_allevamento"
                    />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Primo Rettile */}
          {step === 2 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome</label>
                    <input
                      type="text"
                      className={`w-full p-3 border rounded-lg bg-gray-50 focus:bg-white transition ${errors.reptileName ? 'border-red-500' : 'border-gray-200'}`}
                      placeholder="Es. Kaa"
                      value={formData.reptileName}
                      onChange={(e) => setFormData({...formData, reptileName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Specie</label>
                    <input
                      type="text"
                      className={`w-full p-3 border rounded-lg bg-gray-50 focus:bg-white transition ${errors.reptileSpecies ? 'border-red-500' : 'border-gray-200'}`}
                      placeholder="Es. Python Regius"
                      value={formData.reptileSpecies}
                      onChange={(e) => setFormData({...formData, reptileSpecies: e.target.value})}
                    />
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Morph</label>
                    <input
                      type="text"
                      className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white"
                      placeholder="Es. Banana Pastel"
                      value={formData.reptileMorph}
                      onChange={(e) => setFormData({...formData, reptileMorph: e.target.value})}
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Data di Nascita</label>
                    <input
                      type="date"
                      className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white"
                      value={formData.reptileBirthDate}
                      onChange={(e) => setFormData({...formData, reptileBirthDate: e.target.value})}
                    />
                 </div>
              </div>

              {/* Selettore Sesso */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Sesso</label>
                <div className="flex gap-3">
                    {['M', 'F', 'Unknown'].map((sex) => (
                        <button
                            key={sex}
                            onClick={() => setFormData({...formData, reptileSex: sex})}
                            className={`flex-1 py-2 rounded-lg border-2 flex justify-center items-center gap-2 transition ${
                                formData.reptileSex === sex 
                                ? sex === 'M' ? 'border-blue-500 bg-blue-50 text-blue-600' 
                                  : sex === 'F' ? 'border-pink-500 bg-pink-50 text-pink-600'
                                  : 'border-purple-500 bg-purple-50 text-purple-600'
                                : 'border-gray-100 hover:border-gray-300'
                            }`}
                        >
                            {sex === 'M' && <FaMars />}
                            {sex === 'F' && <FaVenus />}
                            {sex === 'Unknown' && <FaQuestion />}
                        </button>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Alimentazione */}
          {step === 3 && (
            <div className="space-y-6 animate-fadeIn">
              
              <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full">
                        <FaBell className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-gray-800">Attiva Notifiche Email</h4>
                        <p className="text-sm text-gray-600 mt-1">
                            Ti invieremo una mail il giorno del pasto alle 09:00. Puoi disattivarlo in qualsiasi momento.
                        </p>
                    </div>
                    <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                        <input 
                            type="checkbox" 
                            name="toggle" 
                            id="toggle" 
                            checked={formData.enableReminders}
                            onChange={(e) => setFormData({...formData, enableReminders: e.target.checked})}
                            className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 right-6 checked:border-emerald-500"
                        />
                        <label htmlFor="toggle" className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${formData.enableReminders ? 'bg-emerald-500' : 'bg-gray-300'}`}></label>
                    </div>
                </div>
              </div>

              {formData.enableReminders && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Cosa mangia?</label>
                        <select 
                            className="w-full p-3 border border-gray-300 rounded-xl bg-white outline-none focus:ring-2 focus:ring-emerald-500"
                            value={formData.foodType}
                            onChange={(e) => setFormData({...formData, foodType: e.target.value})}
                        >
                            <option value="Topo">🐭 Topo</option>
                            <option value="Ratto">🐀 Ratto</option>
                            <option value="Coniglio">🐇 Coniglio</option>
                            <option value="Pulcino">🐥 Pulcino</option>
                            <option value="Altro">🍖 Altro</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Ogni quanti giorni?</label>
                        <div className="flex items-center">
                            <input 
                                type="number" 
                                min="1"
                                className="w-full p-3 border border-gray-300 rounded-l-xl outline-none focus:ring-2 focus:ring-emerald-500"
                                value={formData.feedingInterval}
                                onChange={(e) => setFormData({...formData, feedingInterval: e.target.value})}
                            />
                            <span className="bg-gray-100 border border-l-0 border-gray-300 p-3 rounded-r-xl text-gray-600 font-medium">Giorni</span>
                        </div>
                    </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-white border-t border-gray-100 flex justify-between items-center">
            <button 
                onClick={() => setStep(step - 1)} 
                disabled={step === 1 || loading}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'}`}
            >
                <FaArrowLeft /> Indietro
            </button>
            
            <button 
                onClick={handleNext}
                disabled={loading}
                className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 hover:shadow-xl transition-all flex items-center gap-3 transform active:scale-95"
            >
                {loading ? 'Configurazione...' : step === 3 ? 'Inizia l\'avventura!' : 'Continua'} 
                {!loading && <FaArrowRight />}
            </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;