import cron from 'node-cron';
import User from '../models/User.js';
import { sendOnboardingEmail } from './mailer.config.js'; // Importa la nuova funzione
import { DateTime } from 'luxon';

// Configurazione giorni e chiavi corrispondenti nel JSON
const EMAIL_STEPS = [
{ day: 0, key: 'day0' },  // Benvenuto
    { day: 1, key: 'day1' },  // Tutorial Alimentazione/Dispensa
    { day: 3, key: 'day3' },  // Peso e Grafici
    { day: 5, key: 'day5' },  // QR Code (Nuovo)
    { day: 7, key: 'day7' },  // Feedback
    { day: 14, key: 'day14' }, // Calendario (Nuovo)
    { day: 30, key: 'day30' }  // Blog/Community (Nuovo)
];

cron.schedule('0 10 * * *', async () => { // Ogni giorno alle 10:00 Europe/Rome
    console.log('JOB - Onboarding Email Job (start)');
    try {
        // Seleziona solo utenti verificati e non bannati
        const users = await User.find({ 
            isVerified: true, 
            isBanned: false 
        });

        // Data di oggi "start of day" fuso orario Roma
        const today = DateTime.now().setZone('Europe/Rome').startOf('day');

        for (const user of users) {
            // Assicurati che user.onboarding esista (per vecchi utenti)
            if (!user.onboarding) {
                user.onboarding = { emailsSent: [], hasSeenTutorial: false };
            }
            // Assicurati che emailsSent sia un array
            if (!Array.isArray(user.onboarding.emailsSent)) {
                user.onboarding.emailsSent = [];
            }

            const createdAt = DateTime.fromJSDate(user.createdAt).setZone('Europe/Rome').startOf('day');
            const diffDays = Math.floor(today.diff(createdAt, 'days').days);

            // Trova lo step corrispondente a "oggi"
            const stepToSend = EMAIL_STEPS.find(step => step.day === diffDays);

            // Se c'è uno step per oggi E l'email non è già stata inviata
            if (stepToSend && !user.onboarding.emailsSent.includes(stepToSend.day)) {
                
                // Chiama la funzione centralizzata del mailer
                const sent = await sendOnboardingEmail(
                    user.email, 
                    user.language, 
                    stepToSend.key, // Passa la chiave 'day0', 'day1', etc.
                    user.name
                );

                if (sent) {
                    user.onboarding.emailsSent.push(stepToSend.day);
                    await user.save();
                    console.log(`Onboarding email [${stepToSend.key}] sent to ${user.email}`);
                }
            }
        }
    } catch (err) {
        console.error('Error onboarding job:', err);
    }
    console.log('JOB - Onboarding Email Job (end)');
}, {
    timezone: "Europe/Rome" // Importante specificare la timezone nel cron
});