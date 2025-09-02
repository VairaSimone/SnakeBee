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

// helper: calcola start/end della giornata in Europe/Rome e converte in UTC (per query su Mongo)
function getLocalDayRangeRome(date = new Date()) {
  const rome = DateTime.fromJSDate(date, { zone: 'Europe/Rome' });
  return {
    todayStart: rome.startOf('day').toJSDate(), // rimane in locale
    todayEnd: rome.endOf('day').toJSDate(),
    localStartISO: rome.startOf('day').toISO(),
    localEndISO: rome.endOf('day').toISO(),
  };
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
      const { todayStart, todayEnd, localStartISO, localEndISO } = getLocalDayRangeRome(new Date());
      // Aggregation: prendi il feeding più vicino (ascending) per reptile e filtra quelli che cadono nella giornata
      const aggregatedFeedings = await Feeding.aggregate([
        { $match: { nextFeedingDate: { $gte: todayStart, $lte: todayEnd } } },
        { $sort: { nextFeedingDate: 1 } },
        { $group: { _id: '$reptile', feeding: { $first: '$$ROOT' } } },
      ]);

      const feedingIds = aggregatedFeedings.map((f) => f.feeding._id);

      const feedings = await Feeding.find({ _id: { $in: feedingIds } }).populate({
        path: 'reptile',
        populate: {
          path: 'user',
          select: 'email name receiveFeedingEmails language subscription', // prendi language e plan se ci sono
        },
      });

      // Raggruppa per user e salva oggetti reptile completi (non solo stringhe)
      const notificationsByUser = {};
      for (const feeding of feedings) {
        const reptile = feeding.reptile;
        const user = reptile ? reptile.user : null;
        if (!user || !user.email) continue;
        if (user.receiveFeedingEmails === false) continue;
        if (!notificationsByUser[user._id]) {
          notificationsByUser[user._id] = {
            user,
            reptiles: [], // array di oggetti { reptileId, name, morph, sex }
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

      // Per ogni user costruisci la mail (compila Handlebars per la versione HTML)
      for (const userId of Object.keys(notificationsByUser)) {
        const { user, reptiles } = notificationsByUser[userId];
        const { plan } = getUserPlan(user);
        if (plan === 'NEOPHYTE') {
          console.log(`Skipping user ${user.email} because plan = NEOPHYTE`);
          continue;
        }
        if (!reptiles.length) continue;

        const reptileListText = reptiles.map((r) => r.displayName).join(', ');
        // Qui puoi loggare i feedings futuri (non oggi)

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

        // Carica stringa HTML tradotta (contiene Handlebars {{#each reptiles}}...)
        const htmlTemplateString = i18next.t('feeding_email_html', {
          lng: user.language || 'it',
        });

        // Compila con Handlebars (ora il loop {{#each}} verrà processato)
        const htmlTemplate = Handlebars.compile(htmlTemplateString);
        const html = htmlTemplate({
          userName: user.name || '',
          reptiles: reptilesForTemplate,
          frontendUrl: process.env.FRONTEND_URL || '',
          logoUrl: process.env.LOGO_URL || '',
        });

        // Plain text via i18next interpolation (sicuro)
        const text = i18next.t('feeding_email_text', {
          lng: user.language || 'it',
          userName: user.name || '',
          reptiles: reptileListText,
          frontendUrl: process.env.FRONTEND_URL || '',
        });

        // Subject
        const subject = i18next.t('feeding_email_subject', { lng: user.language || 'it' });

        // Salvataggio notifica DB (pending)
        const notification = new Notification({
          user: user._id,
          reptile: reptiles.map((r) => r.reptileId),
          type: 'feeding',
          message: i18next.t('feeding_notification_message', {
            lng: user.language || 'it',
            reptiles: reptileListText,
          }),
          date: todayStart,
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

        // Invia e aggiorna stato
        try {
          await transporter.sendMail(mailOptions);
          notification.status = 'sent';
          await notification.save();
          console.log(`Email inviata a ${user.email} (rettili: ${reptileListText})`);
        } catch (err) {
          console.error(`Errore nell'invio email a ${user.email}:`, err?.message || err);
          await new FailedEmail({
            to: user.email,
            subject,
            text,
            html,
            error: err?.message || String(err),
          }).save();
          // lascia la notifica in pending oppure falla fallita a seconda della policy
          notification.status = 'failed';
          await notification.save();
        }
      }

      console.log('JOB - Feeding Job (end)');
    } catch (err) {
      console.error('Error inside Feeding Job:', err);
    }
  },
  {
    scheduled: true,
    timezone: 'Europe/Rome', // assicurati che il job parta a mezzanotte Rome
  }
);
