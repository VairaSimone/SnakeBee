import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST, // es. 'smtp.gmail.com'
  port: process.env.EMAIL_PORT, // es. 465 or 587
  secure: process.env.EMAIL_SECURE === 'true', // true per 465, false per altri
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  }, tls: {
    rejectUnauthorized: false
  }
});

//Email registrazione
const sendVerificationEmail = async (to, code) => {
  const verificationLink = `${process.env.FRONTEND_URL}/verify-email?email=${encodeURIComponent(to)}`;
  const mailOptions = {
    from: `"SnakeBee" <noreply@snakebee.it>`,
    to: to,
    subject: 'Conferma il tuo indirizzo email per SnakeBee',
    text: `Benvenuto in SnakeBee!\n\nUtilizza questo codice per verificare la tua email: ${code}\nOppure clicca qui: ${verificationLink}`,
    html: `
<div style="
        max-width: 600px;
        margin: 20px auto;
        padding: 30px;
        background-color: #FAF3E0; /* clay */
        border-radius: 12px;
        font-family: 'Poppins', sans-serif;
        color: #2B2B2B; /* charcoal */
      ">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="${process.env.LOGO_URL}" alt="SnakeBee Logo" style="max-width: 180px; height: auto;">
        </div>

        <h1 style="color: #228B22; text-align: center; margin-bottom: 25px; font-weight: 700;">
          Benvenuto in SnakeBee! 🎉
        </h1>

        <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
          Ciao! Per completare la tua registrazione, conferma il tuo indirizzo email utilizzando il codice qui sotto:
        </p>

        <div style="
          background-color: #EDE7D6; /* sand */
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          font-size: 28px;
          letter-spacing: 3px;
          font-weight: 600;
          color: #556B2F; /* olive */
          margin-bottom: 30px;
          user-select: all;
        ">
          ${code}
        </div>

        <div style="text-align: center; margin-bottom: 25px;">
          <a href="${verificationLink}"
            style="
              background-color: #228B22; /* forest */
              color: #FFD700; /* honey */
              padding: 14px 35px;
              border-radius: 25px;
              text-decoration: none;
              font-weight: 700;
              font-size: 18px;
              display: inline-block;
              box-shadow: 0 4px 8px rgba(34, 139, 34, 0.3);
              transition: background-color 0.3s ease;
            "
            onmouseover="this.style.backgroundColor='#556B2F'"
            onmouseout="this.style.backgroundColor='#228B22'"
          >
            Verifica Ora
          </a>
        </div>

        <p style="font-size: 14px; color: #555; text-align: center; word-break: break-word;">
          Oppure copia e incolla questo link nel tuo browser:<br>
          <a href="${verificationLink}" style="color: #228B22; text-decoration: underline;">
            ${verificationLink}
          </a>
        </p>

        <p style="font-size: 12px; color: #777; text-align: center; margin-top: 40px;">
          Se non hai richiesto questa registrazione, ignora pure questa email.
        </p>
      </div>
    ` };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email di verifica inviata a:', to);
  } catch (error) {
    console.error("Errore nell'invio dell'email di verifica a:" + error, to);
  }
};

//Password reset email
const sendPasswordResetEmail = async (to, code) => {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?email=${encodeURIComponent(to)}`;
  const mailOptions = {
    from: `"SnakeBee" <noreply@snakebee.it>`,
    to: to,
    subject: 'Reset della Password - SnakeBee',
    text: `Hai richiesto il reset della password. Codice: ${code}\nLink diretto: ${resetLink}`,
    html: `
<div style="
        max-width: 600px;
        margin: 20px auto;
        padding: 30px;
        background-color: #FAF3E0; /* clay */
        border-radius: 12px;
        font-family: 'Poppins', sans-serif;
        color: #2B2B2B; /* charcoal */
      ">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="${process.env.LOGO_URL}" alt="SnakeBee Logo" style="max-width: 180px; height: auto;">
        </div>

        <h1 style="color: #CC3300; text-align: center; margin-bottom: 25px; font-weight: 700;">
          Reset della Password 🔐
        </h1>

        <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
          Ciao! Hai richiesto di resettare la tua password. Usa il codice qui sotto o clicca il pulsante per procedere:
        </p>

        <div style="
          background-color: #EDE7D6; /* sand */
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          font-size: 28px;
          letter-spacing: 3px;
          font-weight: 600;
          color: #CC3300; /* brick */
          margin-bottom: 30px;
          user-select: all;
        ">
          ${code}
        </div>

        <div style="text-align: center; margin-bottom: 25px;">
          <a href="${resetLink}"
            style="
              background-color: #CC3300; /* brick */
              color: #FFD700; /* honey */
              padding: 14px 35px;
              border-radius: 25px;
              text-decoration: none;
              font-weight: 700;
              font-size: 18px;
              display: inline-block;
              box-shadow: 0 4px 8px rgba(204, 51, 0, 0.3);
              transition: background-color 0.3s ease;
            "
            onmouseover="this.style.backgroundColor='#992200'"
            onmouseout="this.style.backgroundColor='#CC3300'"
          >
            Resetta Password Ora
          </a>
        </div>

        <p style="font-size: 14px; color: #555; text-align: center; word-break: break-word;">
          Questo link è valido per 1 ora.<br>
          <a href="${resetLink}" style="color: #CC3300; text-decoration: underline;">
            ${resetLink}
          </a>
        </p>

        <p style="font-size: 12px; color: #777; text-align: center; margin-top: 40px;">
          Se non hai richiesto questa operazione, ignora pure questa email.
        </p>
      </div>
      `  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email di reset password inviata a:', to);
  } catch (error) {
    console.error("Errore nell'invio dell'email di reset password a", to);
    throw error;
  }
};


export { sendVerificationEmail, sendPasswordResetEmail, transporter };
