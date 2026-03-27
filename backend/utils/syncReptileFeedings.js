// utils/syncReptileFeedings.js
import Feeding from '../models/Feeding.js';
import Reptile from '../models/Reptile.js';

export const syncReptileFeedingDates = async (reptileId) => {
    try {
        // Cerca il pasto più recente basato sulla data effettiva del pasto
        const latestFeeding = await Feeding.findOne({ reptile: reptileId })
            .sort({ date: -1 }); // Ordine decrescente per data

        if (latestFeeding) {
            // Aggiorna il rettile con le date dell'ultimo pasto
            await Reptile.findByIdAndUpdate(reptileId, {
                lastFeedingDate: latestFeeding.date,
                nextFeedingDate: latestFeeding.nextFeedingDate || null
            });
        } else {
            // Se non ci sono più pasti (es. utente ha cancellato l'unico pasto)
            await Reptile.findByIdAndUpdate(reptileId, {
                lastFeedingDate: null,
                nextFeedingDate: null
            });
        }
    } catch (error) {
        console.error(`Errore durante la sincronizzazione dei pasti per il rettile ${reptileId}:`, error);
    }
};