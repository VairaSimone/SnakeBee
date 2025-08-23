import CustomEvent from "../models/CustomEvent.js";
import cron from "node-cron";
import { sendEventReminderEmail } from "./mailer.config.js";

const sendDailyReminders = async () => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date(todayStart);
    todayEnd.setHours(23, 59, 59, 999);

    const events = await CustomEvent.find({
      sendReminder: true,
      date: { $gte: todayStart, $lte: todayEnd },
    }).populate("user", "email name language");

    for (const ev of events) {
      if (!ev.user?.email) continue;

      await sendEventReminderEmail(
        ev.user.email,
        ev.user.language,
        ev.title,
        ev.description,
        ev.date
      );
    }

  } catch (err) {
    console.error("[Reminders] Error sending reminder:", err);
  }
};

cron.schedule("0 6 * * *", () => {
  console.log("[Reminders] Starting daily job..");
  sendDailyReminders();
});
