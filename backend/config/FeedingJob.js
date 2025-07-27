import cron from 'node-cron';
import Feeding from '../models/Feeding.js';
import Notification from '../models/Notification.js';
import Redis from 'ioredis';
import Redlock from 'redlock';
import FailedEmail from '../models/FailedEmail.js';
import { transporter } from '../config/mailer.config.js';

/*
const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

const redlock = new Redlock([redis], {
  retryCount: 3,
  retryDelay: 200, // ms
});
*/
// Function to normalize the date to midnight
const normalizeDate = (date) => {
  const normalizedDate = new Date(date);
  normalizedDate.setUTCHours(0, 0, 0, 0); // Set the hours to midnight in UTC 
  return normalizedDate;
};

const getReptileDisplayName = (reptile) => {
  if (reptile.name && reptile.name.trim()) return reptile.name;
  const sexTranslated = reptile.sex === 'male' ? 'Maschio' : 'Femmina';
  return `${reptile.morph} - ${sexTranslated}`;
};

cron.schedule('0 0 * * *', async () => {
  try {
   // const lock = await redlock.acquire(['locks:feedingJob'], 5 * 60 * 1000); // 5 min TTL
    console.log('JOB - Feeding Job');

    try {

      // Get the start and end of today in UTC
      const todayStart = normalizeDate(new Date());
      const todayEnd = new Date(todayStart);
      todayEnd.setUTCHours(23, 59, 59, 999);   // Set the hours to midnight in UTC 

      const aggregatedFeedings = await Feeding.aggregate([
        { $sort: { nextFeedingDate: -1 } },
        {
          $group: {
            _id: "$reptile",
            feeding: { $first: "$$ROOT" }
          }
        },
        {
          $match: {
            "feeding.nextFeedingDate": {
              $gte: todayStart,
              $lte: todayEnd
            }
          }
        }
      ]);
            const feedingIds = aggregatedFeedings.map(f => f.feeding._id);

      // Find all the feedings that need to be fed today
      const feedings = await Feeding.find({ _id: { $in: feedingIds } }).populate({
        path: 'reptile',
        populate: {
          path: 'user',
          select: 'email name receiveFeedingEmails'
        }
      });
      
      // Group feedings by user
      const notificationsByUser = {};

      for (const feeding of feedings) {
        const reptile = feeding.reptile;
        const user = reptile ? reptile.user : null;
        if (!user || !user.email) continue;
        if (user.receiveFeedingEmails === false) {
          console.log(`Utente ${user.email} ha disattivato le notifiche alimentazione.`);
          continue;
        }
        if (!reptile || !user) {
          console.warn(`Missing reptile or user for feeding with ID ${feeding._id}`);
          continue;
        }

        const userId = user._id;

        if (!notificationsByUser[userId]) {
          notificationsByUser[userId] = {
            user,
reptilesMap: new Map(),
          };
        }
notificationsByUser[userId].reptilesMap.set(
  reptile._id.toString(),
  getReptileDisplayName(reptile)
);
      }

      // Create a notification for each user and send summary emails
for (const userId in notificationsByUser) {
  const user = notificationsByUser[userId].user;
  const reptiles = Array.from(notificationsByUser[userId].reptilesMap.entries()).map(
    ([reptileId, name]) => ({
      name,
      reptileId
    })
  );
          let emailsSent = 0;
        let emailsFailed = 0;

        const reptileList = reptiles.map((r) => r.name).join(', ');

        if (!user.email) {
          console.error(`Errore: L'utente con ID ${user._id} non ha un'email.`);
          continue;
        }
        let mailOptions;
        try {
          // Verifica se esiste già una notifica identica per oggi
          const existingNotification = await Notification.findOne({
            reptile: { $all: reptiles.map((r) => r.reptileId) },
            user: userId,
            type: 'feeding',
            date: {
              $gte: new Date().setHours(0, 0, 0, 0),
              $lt: new Date().setHours(23, 59, 59, 999),
            },
          });

          // Crea la notifica (status iniziale "pending")
          const notification = new Notification({
            user: user._id,
            reptile: reptiles.map((r) => r.reptileId),
            type: 'feeding',
            message: `I tuoi rettili ${reptileList} devono essere alimentati oggi.`,
            date: todayStart,
            status: 'pending',
          });

          await notification.save();

          // Configura invio email
          // Prepara il payload
          mailOptions = {
            from: `"SnakeBee" <noreply@snakebee.it>`,
            to: user.email,
            subject: 'Notifica di alimentazione rettili',
            text: `Ciao ${user.name},

Oggi è il giorno della pappa per i tuoi rettili: ${reptileList}.

Ricordati di alimentarli e aggiornare lo stato dalla tua dashboard!

Vai su: ${process.env.FRONTEND_URL}/dashboard

Ricevi questa email perché hai attivato le notifiche alimentazione su SnakeBee.
Puoi disattivarle dalle impostazioni del tuo account.`,
            html: `
<div style="
  font-family: 'Poppins', sans-serif;
  max-width: 600px;
  margin: 30px auto;
  padding: 30px;
  background-color: #FAF3E0; /* clay */
  border-radius: 12px;
  color: #2B2B2B; /* charcoal */
">
  <div style="text-align: center; margin-bottom: 20px;">
    <img src="${process.env.LOGO_URL}" alt="SnakeBee Logo" style="max-width: 180px;" />
  </div>

  <h2 style="color: #228B22; text-align: center;">È ora di nutrire i tuoi rettili! 🐍🍽️</h2>

  <p style="font-size: 16px; line-height: 1.6;">
    Ciao <strong>${user.name}</strong>,
  </p>

  <p style="font-size: 16px; line-height: 1.6;">
    Oggi è il giorno della pappa per i seguenti rettili:
  </p>

  <ul style="
    background-color: #EDE7D6; /* sand */
    padding: 15px;
    border-radius: 8px;
    margin: 20px 0;
    font-size: 16px;
  ">
    ${reptiles.map(r => `<li style="margin-bottom: 6px;">🐢 ${r.name}</li>`).join('')}
  </ul>

  <p style="font-size: 16px; line-height: 1.6;">
    Ricordati di aggiornare lo stato di alimentazione una volta completato!
  </p>

  <div style="text-align: center; margin: 30px 0;">
    <a href="${process.env.FRONTEND_URL}/dashboard"
      style="
        background-color: #228B22; /* forest */
        color: #FFD700; /* honey */
        padding: 14px 30px;
        border-radius: 25px;
        text-decoration: none;
        font-weight: 600;
        font-size: 16px;
        display: inline-block;
        box-shadow: 0 4px 8px rgba(34, 139, 34, 0.3);
        transition: background-color 0.3s ease;
      "
    >
      Vai alla Dashboard
    </a>
  </div>

  <p style="font-size: 13px; text-align: center; color: #777;">
    Ricevi questa email perché hai attivato le notifiche alimentazione su SnakeBee.<br>
    Puoi disattivarle in qualsiasi momento dalle impostazioni del tuo account.
  </p>
</div>  `
          };


          // Invia l’email
          emailsSent++;
          await transporter.sendMail(mailOptions);

          // Aggiorna la notifica a "sent"
          notification.status = 'sent';
          await notification.save();
          console.log(`Email inviata a ${user.email}`);

        } catch (err) {
          emailsFailed++;
          console.error(`Errore nell'invio email a ${user.email}:`, err);

          await new FailedEmail({
            to: user.email,
            subject: mailOptions.subject,
            text: mailOptions.text,
            html: mailOptions.html,
            error: err.message
          }).save();

        }


        console.log(`JOB COMPLETATO: Email inviate: ${emailsSent}, fallite: ${emailsFailed}`);

      }

    } catch (err) {
      console.error('Error inside Feeding Job:', err);
    } finally {
      await lock.release();
    }
  } catch (err) {
    console.warn('Feeding Job skipped: lock not acquired');
  }
});
