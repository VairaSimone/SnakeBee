import User from '../models/User.js';
import Feeding from '../models/Feeding.js';
import Reptile from '../models/Reptile.js';

const recoverGoogleUsersHistory = async () => {
  const googleUsers = await User.find({ googleId: { $exists: true } });

  for (let user of googleUsers) {
    // 1. Troviamo date uniche dalle attività del database
    const feedings = await Feeding.find({ userId: user._id }).select('date');
    const reptiles = await Reptile.find({ userId: user._id }).select('createdAt');
    
    // Estraiamo le date (solo giorno/mese/anno per non duplicare troppo)
    const activityDates = [
      ...feedings.map(f => f.date.toISOString().split('T')[0]),
      ...reptiles.map(r => r.createdAt.toISOString().split('T')[0]),
      user.createdAt.toISOString().split('T')[0] // Data di registrazione
    ];

    // Rimuoviamo i duplicati
    const uniqueDates = [...new Set(activityDates)];

    // 2. Trasformiamo in oggetti loginHistory
    const recoveredHistory = uniqueDates.map(dateStr => ({
      ip: 'recovered',
      userAgent: 'legacy-recovery',
      date: new Date(dateStr)
    }));

    // 3. Uniamo alla history esistente e puliamo
    let fullHistory = [...(user.loginHistory || []), ...recoveredHistory];
    
    // Ordiniamo per data e teniamo solo gli ultimi 20/30 (come da tua logica)
    fullHistory.sort((a, b) => b.date - a.date);
    user.loginHistory = fullHistory.slice(0, 30);

    await user.save();
    console.log(`Recuperati ${uniqueDates.length} punti attività per ${user.email}`);
  }
};