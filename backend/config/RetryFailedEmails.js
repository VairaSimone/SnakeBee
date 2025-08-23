import cron from 'node-cron';
import FailedEmail from '../models/FailedEmail.js';
import { transporter } from '../config/mailer.config.js';


cron.schedule('*/15 * * * *', async () => {
  console.log('JOB - Retry failed email sending');

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
      console.log(`Email successfully retried to ${email.to}`);

    } catch (err) {
      // Increment counter and save error
      email.retries += 1;
      email.error = err.message;
      await email.save();
      console.warn(`Retry failed for ${email.to}, attempts: ${email.retries}`);
    }
  }
});
