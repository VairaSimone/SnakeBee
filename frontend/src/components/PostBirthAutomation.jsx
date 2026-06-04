import React, { useState } from 'react';
import { hatchBreeding } from '../services/api';

const PostBirthAutomation = ({ breedingId, onHatchSuccess }) => {
  const [numberOfBabies, setNumberOfBabies] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleHatching = async (e) => {
    e.preventDefault();
    setErrorMessage(""); // Resetta eventuali errori precedenti

    try {
      setIsLoading(true);
      await hatchBreeding(breedingId, { numberOfBabies, hatchDate: new Date() });
      
      // Chiama la funzione passata dal padre (che gestirà la chiusura del modale e il Toast di successo)
      if (onHatchSuccess) onHatchSuccess();
      
    } catch (error) {
      console.error(error);
      // Mostra l'errore nella UI anziché usare window.alert
      setErrorMessage(error.response?.data?.message || 'Errore durante la registrazione della nascita.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded-md mt-4">
      <h3 className="font-bold text-lg mb-2">Automazione Post-Nascita</h3>
      <p className="text-sm text-gray-600 mb-4">
        Le uova si sono schiuse? Inserisci il numero di piccoli. Verranno aggiunti automaticamente alla tua dashboard dei rettili.
      </p>
      
      <form onSubmit={handleHatching} className="flex flex-col gap-2">
        <div className="flex items-end gap-4">
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-1">Numero di nati:</label>
            <input 
              type="number" 
              min="1"
              className="border p-2 rounded"
              value={numberOfBabies} 
              onChange={(e) => setNumberOfBabies(Number(e.target.value))}
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={isLoading}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Generazione in corso...' : 'Registra Nuovi Esemplari'}
          </button>
        </div>
        
        {/* Messaggio di errore inline */}
        {errorMessage && (
          <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
        )}
      </form>
    </div>
  );
};

export default PostBirthAutomation;