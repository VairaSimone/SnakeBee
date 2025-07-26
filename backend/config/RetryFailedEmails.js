import cron from 'node-cron';
import FailedEmail from '../models/FailedEmail.js';
import { transporter } from '../config/mailer.config.js';


cron.schedule('*/15 * * * *', async () => {
  console.log('JOB - Retry invio email fallite');

  const failedEmails = await FailedEmail.find({ retries: { $lt: 3 } });

  for (const email of failedEmails) {
    try {
const mailOptions = {
  from: `"SnakeBee" <${process.env.EMAIL_USER}>`,
  to: email.to,
  subject: email.subject,
  text: email.text,
  html: email.html
};

await transporter.sendMail(mailOptions);

      await FailedEmail.findByIdAndDelete(email._id);
      console.log(`Email ritentata con successo a ${email.to}`);

    } catch (err) {
      // Incrementa contatore e salva errore
      email.retries += 1;
      email.error = err.message;
      await email.save();
      console.warn(`Retry fallito per ${email.to}, tentativi: ${email.retries}`);
    }
  }
});
