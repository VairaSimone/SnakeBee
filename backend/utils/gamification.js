// script-recupero-gamification.js
import mongoose from 'mongoose';
import 'dotenv/config'; // Carica le variabili da .env
import User from '../models/User.js';
import Feeding from '../models/Feeding.js';
import Reptile from '../models/Reptile.js';

const recoverGoogleUsersHistory = async () => {
  try {
    // 1. Connessione al DB (usa la tua stringa di connessione dal file .env)
    await mongoose.connect(process.env.MONGO_STRING);
    console.log("Connesso al database per il recupero...");

    const googleUsers = await User.find({ googleId: { $exists: true } });

    for (let user of googleUsers) {
      // 2. Troviamo date uniche dalle attività
      const feedings = await Feeding.find({ userId: user._id }).select('date');
      const reptiles = await Reptile.find({ userId: user._id }).select('createdAt');
      
      const activityDates = [
        ...feedings.map(f => f.date.toISOString().split('T')[0]),
        ...reptiles.map(r => r.createdAt.toISOString().split('T')[0]),
        user.createdAt.toISOString().split('T')[0]
      ];

      const uniqueDates = [...new Set(activityDates)];

      const recoveredHistory = uniqueDates.map(dateStr => ({
        ip: 'recovered',
        userAgent: 'legacy-recovery',
        date: new Date(dateStr)
      }));

      // 3. Unione e pulizia (manteniamo la logica dei 30 giorni)
      let fullHistory = [...(user.loginHistory || []), ...recoveredHistory];
      
      // Rimuovi duplicati basati sulla data (Y-M-D) per non sporcare la history
      const seen = new Set();
      fullHistory = fullHistory.filter(item => {
        const d = item.date.toISOString().split('T')[0];
        if (seen.has(d)) return false;
        seen.add(d);
        return true;
      });

      fullHistory.sort((a, b) => b.date - a.date);
      user.loginHistory = fullHistory.slice(0, 30);

      await user.save();
      console.log(`Recuperati ${uniqueDates.length} punti attività per ${user.email}`);
    }

    console.log("Operazione completata con successo.");
  } catch (error) {
    console.error("Errore durante il recupero:", error);
  } finally {
    await mongoose.disconnect();
  }
};

recoverGoogleUsersHistory();