import nodemailer from 'nodemailer';
import i18next from 'i18next';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  }, tls: {
    rejectUnauthorized: true,
  }
});

//Registration email
const sendVerificationEmail = async (to, lng, code) => {
const t = i18next.getFixedT(lng || 'it'); 
  const verificationLink = `${process.env.FRONTEND_URL}/verify-email?email=${encodeURIComponent(to)}`;

  const mailOptions = {
    from: `"SnakeBee" <noreply@snakebee.it>`,
    to,
    subject: t('emails.verification.subject', 'Conferma il tuo indirizzo email per SnakeBee'),
    text: t('emails.verification.text', 'Benvenuto in SnakeBee!\n\nUtilizza questo codice per verificare la tua email: {{code}}\nOppure clicca qui: {{link}}', { code, link: verificationLink }),
    html: `
      <div style="max-width:600px;margin:20px auto;padding:30px;background-color:#FAF3E0;border-radius:12px;font-family:'Poppins', sans-serif;color:#2B2B2B;">
        <div style="text-align:center;margin-bottom:30px;">
          <img src="${process.env.LOGO_URL}" alt="SnakeBee Logo" style="max-width:180px;height:auto;">
        </div>
        <h1 style="color:#228B22;text-align:center;margin-bottom:25px;font-weight:700;">
          ${t('emails.verification.welcome', 'Benvenuto in SnakeBee! 🎉')}
        </h1>
        <p style="font-size:16px;line-height:1.5;margin-bottom:20px;">
          ${t('emails.verification.instructions', 'Ciao! Per completare la tua registrazione, conferma il tuo indirizzo email utilizzando il codice qui sotto:')}
        </p>
        <div style="background-color:#EDE7D6;padding:20px;border-radius:8px;text-align:center;font-size:28px;letter-spacing:3px;font-weight:600;color:#556B2F;margin-bottom:30px;user-select:all;">
          ${code}
        </div>
        <div style="text-align:center;margin-bottom:25px;">
          <a href="${verificationLink}" style="background-color:#228B22;color:#FFD700;padding:14px 35px;border-radius:25px;text-decoration:none;font-weight:700;font-size:18px;display:inline-block;box-shadow:0 4px 8px rgba(34,139,34,0.3);transition:background-color 0.3s ease;">
            ${t('emails.verification.verifyNow', 'Verifica Ora')}
          </a>
        </div>
        <p style="font-size:14px;color:#555;text-align:center;word-break:break-word;">
          ${t('emails.verification.orCopyLink', 'Oppure copia e incolla questo link nel tuo browser:')}<br>
          <a href="${verificationLink}" style="color:#228B22;text-decoration:underline;">${verificationLink}</a>
        </p>
        <p style="font-size:12px;color:#777;text-align:center;margin-top:40px;">
          ${t('emails.verification.ignore', 'Se non hai richiesto questa registrazione, ignora pure questa email.')}
        </p>
      </div>
    `
  };


  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending verification email to:" + error, to);
  }
};

//Password reset email
const sendPasswordResetEmail = async (to, lng, code) => {
const t = i18next.getFixedT(lng || 'it'); 
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?email=${encodeURIComponent(to)}`;

  const mailOptions = {
    from: `"SnakeBee" <noreply@snakebee.it>`,
    to,
    subject: t('emails.passwordReset.subject', 'Reset della Password - SnakeBee'),
    text: t('emails.passwordReset.text', 'Hai richiesto il reset della password. Codice: {{code}}\nLink diretto: {{link}}', { code, link: resetLink }),
    html: `
      <div style="max-width:600px;margin:20px auto;padding:30px;background-color:#FAF3E0;border-radius:12px;font-family:'Poppins', sans-serif;color:#2B2B2B;">
        <div style="text-align:center;margin-bottom:30px;">
          <img src="${process.env.LOGO_URL}" alt="SnakeBee Logo" style="max-width:180px;height:auto;">
        </div>
        <h1 style="color:#CC3300;text-align:center;margin-bottom:25px;font-weight:700;">
          ${t('emails.passwordReset.title', 'Reset della Password 🔐')}
        </h1>
        <p style="font-size:16px;line-height:1.5;margin-bottom:20px;">
          ${t('emails.passwordReset.instructions', 'Ciao! Hai richiesto di resettare la tua password. Usa il codice qui sotto o clicca il pulsante per procedere:')}
        </p>
        <div style="background-color:#EDE7D6;padding:20px;border-radius:8px;text-align:center;font-size:28px;letter-spacing:3px;font-weight:600;color:#CC3300;margin-bottom:30px;user-select:all;">
          ${code}
        </div>
        <div style="text-align:center;margin-bottom:25px;">
          <a href="${resetLink}" style="background-color:#CC3300;color:#FFD700;padding:14px 35px;border-radius:25px;text-decoration:none;font-weight:700;font-size:18px;display:inline-block;box-shadow:0 4px 8px rgba(204,51,0,0.3);transition:background-color 0.3s ease;">
            ${t('emails.passwordReset.resetNow', 'Resetta Password Ora')}
          </a>
        </div>
        <p style="font-size:14px;color:#555;text-align:center;word-break:break-word;">
          ${t('emails.passwordReset.linkValidity', 'Questo link è valido per 1 ora.')}<br>
          <a href="${resetLink}" style="color:#CC3300;text-decoration:underline;">${resetLink}</a>
        </p>
        <p style="font-size:12px;color:#777;text-align:center;margin-top:40px;">
          ${t('emails.passwordReset.ignore', 'Se non hai richiesto questa operazione, ignora pure questa email.')}
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending password reset email to", to);
    throw error;
  }
};

const sendStripeNotificationEmail = async (to, lng, subject, bodyHtml, bodyText = '') => {
const t = i18next.getFixedT(lng || 'it'); 
  const mailOptions = {
    from: `"SnakeBee" <noreply@snakebee.it>`,
    to,
    subject,
    text: bodyText,
    html: `
      <div style="font-family: 'Poppins', sans-serif; padding: 20px; max-width: 600px; margin: auto; background: #fdfcf8; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${process.env.LOGO_URL}" alt="SnakeBee Logo" style="max-width: 160px;" />
        </div>
        ${bodyHtml}
        <p style="font-size: 12px; color: #777; margin-top: 40px; text-align: center;">
          ${t('emails.automaticNotificationNote')}
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error('Error sending Stripe email:', err);
  }
};

const sendEventReminderEmail = async (to, lng, title, description, date) => {
const t = i18next.getFixedT(lng || 'it'); 

  const formattedDate = new Date(date).toLocaleString(lng, {
    dateStyle: "full",
    timeStyle: "short"
  });

  const subject = t('emails.eventReminder.subject', { title });

  const bodyText = `${t('emails.eventReminder.todayYouHave')}: ${title}\n${t('emails.eventReminder.date')}: ${formattedDate}\n\n${description || ""}`;

  const bodyHtml = `
    <h2 style="color:#228B22;">${t('emails.eventReminder.header')}</h2>
    <p><strong>${title}</strong></p>
    <p>${description || ""}</p>
    <p><b>${t('emails.eventReminder.date')}:</b> ${formattedDate}</p>
  `;

  const mailOptions = {
    from: `"SnakeBee" <noreply@snakebee.it>`,
    to,
    subject,
    text: bodyText,
    html: `
      <div style="font-family: 'Poppins', sans-serif; padding: 20px; max-width: 600px; margin: auto; background: #fdfcf8; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${process.env.LOGO_URL}" alt="SnakeBee Logo" style="max-width: 160px;" />
        </div>
        ${bodyHtml}
        <p style="font-size: 12px; color: #777; margin-top: 40px; text-align: center;">
          ${t('emails.automaticNotificationNote')}
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error("Error sending event reminder email:", err);
  }
};

const buildHtmlTemplate = (dynamicHtml, lng) => {
const t = i18next.getFixedT(lng || 'it'); 

  return `
    <div style="max-width:600px;margin:20px auto;padding:30px;background-color:#FAF3E0;border-radius:12px;font-family:'Poppins', sans-serif;color:#2B2B2B;">
      <div style="text-align:center;margin-bottom:30px;">
        <img src="${process.env.LOGO_URL}" alt="SnakeBee Logo" style="max-width:180px;height:auto;">
      </div>
      ${dynamicHtml}
      <p style="font-size:12px;color:#777;text-align:center;margin-top:40px;">
        ${t('emails.automaticNotificationNote', 'Questa è una mail automatica.')}
      </p>
    </div>
  `;
};

/**
 * Invia email broadcast a un singolo utente con template predefinito
 */
const sendBroadcastEmailToUser = async (user, subject, dynamicHtml, dynamicText = "") => {
  const html = buildHtmlTemplate(dynamicHtml, user.language || "it");

  try {
    await transporter.sendMail({
      from: `"SnakeBee" <noreply@snakebee.it>`,
      to: user.email,
      subject,
      text: dynamicText,
      html,
    });
    return true;
  } catch (err) {
    console.error(`Error sending broadcast email to ${user.email}:`, err);
    return false;
  }
};

const sendReferralRewardEmail = async (to, lng, name, promoCode) => {
    const t = i18next.getFixedT(lng || 'it');
    const mailOptions = {
        from: `"SnakeBee" <noreply@snakebee.it>`,
        to,
        subject: t('emails.referralReward.subject'),
        text:  t('emails.referralReward.text', { name, promoCode }),
        html: `
        <div style="max-width:600px;margin:20px auto;padding:30px;background-color:#FAF3E0;border-radius:12px;font-family:'Poppins', sans-serif;color:#2B2B2B;">
            <div style="text-align:center;margin-bottom:30px;">
                <img src="${process.env.LOGO_URL}" alt="SnakeBee Logo" style="max-width:180px;height:auto;">
            </div>
            <h1 style="color:#228B22;text-align:center;margin-bottom:25px;font-weight:700;">
                ${t('emails.referralReward.title')}
            </h1>
            <p style="font-size:16px;line-height:1.5;margin-bottom:20px;">
               ${t('emails.referralReward.instructions', { name })}
            </p>
            <p style="font-size:16px;line-height:1.5;margin-bottom:20px;">
                ${t('emails.referralReward.useCode')}
            </p>
            <div style="background-color:#EDE7D6;padding:20px;border-radius:8px;text-align:center;font-size:28px;letter-spacing:3px;font-weight:600;color:#556B2F;margin-bottom:30px;user-select:all;">
                ${promoCode}
            </div>
            <p style="font-size:12px;color:#777;text-align:center;margin-top:40px;">
               ${t('emails.referralReward.thanks')}
        </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Errore durante l'invio dell'email di ricompensa a:", to, error);
    }
};

export { sendVerificationEmail, sendReferralRewardEmail, sendBroadcastEmailToUser, sendEventReminderEmail, sendStripeNotificationEmail, sendPasswordResetEmail, transporter };
