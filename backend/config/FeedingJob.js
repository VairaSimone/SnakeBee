import cron from 'node-cron';
import Feeding from '../models/Feeding.js';
import Notification from '../models/Notification.js';
import FailedEmail from '../models/FailedEmail.js';
import { transporter } from '../config/mailer.config.js';
import { getUserPlan } from '../utils/getUserPlans.js';
import i18next from 'i18next';

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

        const { plan } = getUserPlan(user);
        if (plan !== 'premium') {
          continue;
        }

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
          continue;
        }
        let mailOptions;

        let userLang = user.language || "it";
        try {

          // Create the notification (initial status "pending")
          const notification = new Notification({
            user: user._id,
            reptile: reptiles.map((r) => r.reptileId),
            type: 'feeding',
            message: i18next.t('feeding_notification_message', {
              lng: userLang,
              reptiles: reptileList
            }),
            date: todayStart,
            status: 'pending',
          });

          await notification.save();

          // Configure email sending
          mailOptions = {
            from: `"SnakeBee" <noreply@snakebee.it>`,
            to: user.email,
            subject: i18next.t('feeding_email_text', {
              lng: userLang,
              userName: user.name,
              reptiles: reptileList,
              frontendUrl: process.env.FRONTEND_URL
            }),
            text: i18next.t('feeding_email_html', {
              lng: userLang,
              userName: user.name,
              reptiles: reptiles.map(r => r.name),
              frontendUrl: process.env.FRONTEND_URL,
              logoUrl: process.env.LOGO_URL
            })
          };


          // Send the email
          emailsSent++;
          await transporter.sendMail(mailOptions);

          // Update the notification to "sent"
          notification.status = 'sent';
          await notification.save();

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

        console.log(`JOB COMPLETED: Emails sent: ${emailsSent}, failed: ${emailsFailed}`);
      }

    } catch (err) {
      console.error('Error inside Feeding Job:', err);
    }
  } catch (err) {
    console.warn('Feeding Job skipped: lock not acquired');
  }
});
