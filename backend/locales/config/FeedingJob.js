// feedingJob.js
import cron from 'node-cron';
import Handlebars from 'handlebars';
import Feeding from '../models/Feeding.js';
import Notification from '../models/Notification.js';
import FailedEmail from '../models/FailedEmail.js';
import { transporter } from '../config/mailer.config.js';
import { getUserPlan } from '../utils/getUserPlans.js';
import i18next from 'i18next';
import { DateTime } from 'luxon';
import bot from "../telegramBot.js";

// === MO DIFICA ===
// Questa funzione ora restituisce solo la stringa 'YYYY-MM-DD' per Roma
function getRomeTodayString() {
  return DateTime.now().setZone('Europe/Rome').toISODate(); // Es: '2025-10-26'
}

const getReptileDisplayName = (reptile, userLang = 'it') => {
  if (!reptile) return 'Unnamed';
  if (reptile.name && reptile.name.trim()) return reptile.name;
  const sexTranslated =
    reptile.sex === 'M'
      ? i18next.t('male', { lng: userLang })
      : reptile.sex === 'F'
        ? i18next.t('female', { lng: userLang })
        : i18next.t('unknown', { lng: userLang });
  return `${reptile.morph || 'Unknown morph'} - ${sexTranslated}`;
};

cron.schedule(
  '0 9 * * *',
  async () => {
    console.log('JOB - Feeding Job (start)');

    try {
      // === MODIFICA ===
      // 1. Ottieni la stringa di data di oggi per Roma
      const romeTodayString = getRomeTodayString(); // Es: '2025-10-26'
      // 2. Ottieni l'inizio del giorno (come Oggetto Date) solo per il campo 'date' della notifica
      const todayStartForNotification = DateTime.now().setZone('Europe/Rome').startOf('day').toJSDate();

      // === MODIFICA ===
      // 3. La query ora cerca la corrispondenza ESATTA della stringa
      const aggregatedFeedings = await Feeding.aggregate([
        { $match: { nextFeedingDate: romeTodayString } }, // <-- CORREZIONE CHIAVE
        { $sort: { date: -1 } }, // Ordina per data del pasto (opzionale, ma ha senso)
        { $group: { _id: '$reptile', feeding: { $first: '$$ROOT' } } },
      ]);

      const feedingIds = aggregatedFeedings.map((f) => f.feeding._id);

      const feedings = await Feeding.find({ _id: { $in: feedingIds } }).populate({
        path: 'reptile',
        select: 'name species morph sex status user',
        populate: {
          path: 'user',
          select: 'email name receiveFeedingEmails language subscription telegramId', // prendi language e plan se ci sono
        },
      });

      const notificationsByUser = {};
      for (const feeding of feedings) {
        const reptile = feeding.reptile;
        if (!reptile || reptile.status !== 'active') {
          continue; // Salta questo feeding se il rettile non è attivo o non esiste
        }
        const user = reptile ? reptile.user : null;
        if (!user || !user.email) continue;
        if (user.receiveFeedingEmails === false) continue;
        if (!notificationsByUser[user._id]) {
          notificationsByUser[user._id] = {
            user,
            reptiles: [],
          };
        }
        notificationsByUser[user._id].reptiles.push({
          reptileId: reptile._id.toString(),
          name: reptile.name || '',
          morph: reptile.morph || '',
          sex: reptile.sex || '',
          displayName: getReptileDisplayName(reptile, user.language || 'it'),
        });
      }

      for (const userId of Object.keys(notificationsByUser)) {
        const { user, reptiles } = notificationsByUser[userId];
        const { plan } = getUserPlan(user);
        if (plan === 'NEOPHYTE') {
          console.log(`Skipping user ${user.email} because plan = NEOPHYTE`);
          continue;
        }
        if (!reptiles.length) continue;

        const reptileListText = reptiles.map((r) => r.displayName).join(', ');

        const reptilesForTemplate = reptiles.map((r) => ({
          name: r.name || '',
          morph: r.morph || '',
          sex:
            r.sex === 'M'
              ? i18next.t('male', { lng: user.language || 'it' })
              : r.sex === 'F'
                ? i18next.t('female', { lng: user.language || 'it' })
                : i18next.t('unknown', { lng: user.language || 'it' }),
        }));
        const reptilesForTelegram = reptiles.map((r) => {
          const sexTranslated =
            r.sex === 'M'
              ? i18next.t('male', { lng: user.language || 'it' })
              : r.sex === 'F'
                ? i18next.t('female', { lng: user.language || 'it' })
                : i18next.t('unknown', { lng: user.language || 'it' });

          return `${r.name || 'Senza nome'} - ${r.morph || 'Morph sconosciuta'} - ${sexTranslated}`;
        }).join('\n');

        const htmlTemplateString = i18next.t('feeding_email_html', {
          lng: user.language || 'it',
        });

        const htmlTemplate = Handlebars.compile(htmlTemplateString);
        const html = htmlTemplate({
          userName: user.name || '',
          reptiles: reptilesForTemplate,
          frontendUrl: process.env.FRONTEND_URL || '',
          logoUrl: process.env.LOGO_URL || '',
        });

        const text = i18next.t('feeding_email_text', {
          lng: user.language || 'it',
          userName: user.name || '',
          reptiles: reptileListText,
          frontendUrl: process.env.FRONTEND_URL || '',
        });

        const subject = i18next.t('feeding_email_subject', { lng: user.language || 'it' });

        const notification = new Notification({
          user: user._id,
          reptile: reptiles.map((r) => r.reptileId),
          type: 'feeding',
          message: i18next.t('feeding_notification_message', {
            lng: user.language || 'it',
            reptiles: reptileListText,
          }),
          // === MODIFICA ===
          // Usa l'oggetto Date (oggi a Roma) che abbiamo salvato
          date: todayStartForNotification,
          status: 'pending',
        });
        await notification.save();

        const mailOptions = {
          from: `"SnakeBee" <noreply@snakebee.it>`,
          to: user.email,
          subject,
          text,
          html,
        };

        try {
          await transporter.sendMail(mailOptions);
          notification.status = 'sent';
          await notification.save();
          console.log(`Email inviata a ${user.email} (rettili: ${reptileListText})`);

          if (user.telegramId) {
            try {
              const telegramMessage = `👋 Ciao ${user.name || ''}!\nOggi è il giorno del pasto per:\n\n${reptilesForTelegram}\n\nNon dimenticarti di loro! 🐍`;
              await bot.sendMessage(user.telegramId, telegramMessage, { parse_mode: "Markdown" });
              console.log(`Notifica Telegram inviata a ${user.telegramId}`);
            } catch (telegramErr) {
              console.error(`Errore nell'invio notifica Telegram a ${user.telegramId}:`, telegramErr.message);
            }
          }

        } catch (err) {
          console.error(`Errore nell'invio email a ${user.email}:`, err?.message || err);
          await new FailedEmail({
            to: user.email,
            subject,
            text,
            html,
            error: err?.message || String(err),
          }).save();
          notification.status = 'failed';
          await notification.save();
        }
      }

      console.log('JOB - Feeding Job (end)');
    } catch (err) {
      console.error('Error inside Feeding Job:', err);
    }
  },  {
    scheduled: true,
    timezone: 'Europe/Rome', 
  }
);
