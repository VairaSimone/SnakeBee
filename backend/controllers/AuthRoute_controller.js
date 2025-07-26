import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { body, validationResult } from 'express-validator';
import RevokedToken from '../models/RevokedToken.js';
import crypto from 'crypto';
import { logSecurityEvent } from "../utils/securityLogger.js";

import { sendVerificationEmail, sendPasswordResetEmail } from "../config/mailer.config.js";
const MAX_VERIFICATION_EMAILS = 5;
async function pwnedPassword() {
  const { pwnedPassword } = await import("hibp");
  return pwnedPassword;
}

const generateAccessToken = (user) => {
  return jwt.sign({ userid: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '2h' });
};

//generate the refresh token with a longer duration that will be used to request the access token
const generateRefreshToken = (user) => {
  return jwt.sign({ userid: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
};
// Tempo minimo tra gli invii della stessa email (in millisecondi)
const EMAIL_RESEND_COOLDOWN = 60 * 1000; // 60 secondi

// Tempo di validità del codice di reset password (in millisecondi)
const PASSWORD_RESET_CODE_EXPIRY = 60 * 60 * 1000; // 1 ora

export const validateLogin = [
  body('email').isEmail().withMessage('Email non valida'),
  body('password').notEmpty().withMessage('La password è obbligatoria'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  }
];


export const login = async (req, res, next) => {
  try {
    const MAX_LOGIN_ATTEMPTS = 5;
    // Durata del blocco in millisecondi (15 minuti)
    const LOCKOUT_DURATION = 15 * 60 * 1000;

    const email = await req.body.email.toLowerCase();

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Error in the credentials entered" });
    if (user.accountLockedUntil && new Date() < user.accountLockedUntil) {
      const timeLeft = Math.ceil((user.accountLockedUntil - new Date()) / 1000);
      return res.status(403).json({ message: `Account bloccato. Riprova tra ${timeLeft} secondi.` });
    }
    if (!user.password) {
      return res.status(400).json({ message: 'Account creato tramite Google: effettua il login con Google.' });
    }
    if (user.isBanned) {
      return res.status(403).json({ message: "Il tuo account è stato bannato. Contatta l'assistenza per informazioni." });
    }
    // Controllo email verificata
    if (!user.isVerified) {
      return res.status(403).json({ message: "Email non verificata. Controlla la tua casella di posta per il codice di verifica." });
    }

    const validPassword = await bcrypt.compareSync(req.body.password, user.password);
    if (!validPassword) {
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        // Blocca l'account per la durata specificata
        user.accountLockedUntil = new Date(Date.now() + LOCKOUT_DURATION);
        await user.save();
        return res.status(403).json({ message: `Troppi tentativi falliti. Account bloccato per ${LOCKOUT_DURATION / 60000} minuti.` });
      }
      return res.status(401).json({ message: "Error in the credentials entered" });
    }
    user.loginAttempts = 0;
    user.accountLockedUntil = null;

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    const hashedToken = await bcrypt.hash(refreshToken, 12);
    if (!user.refreshTokens) user.refreshTokens = [];
    if (user.refreshTokens.length >= 10) {
      user.refreshTokens = user.refreshTokens.slice(-9);
    }
    user.refreshTokens.push({ token: hashedToken });
    await user.save();
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      path: '/',

      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    user.loginHistory = user.loginHistory || [];
    user.loginHistory.push({
      ip: req.ip,
      userAgent: req.get('User-Agent') || 'unknown',
    });
    if (user.loginHistory.length > 20) {
      user.loginHistory = user.loginHistory.slice(-20);
    }
    await user.save();
    return res.json({ accessToken, refreshToken  });
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Server Error" });
  }
};

export const register = async (req, res, next) => {
  try {
    const normalizedEmail = req.body.email.toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "Email già in uso" });
    }
    if (!req.body.privacyConsent) {
      return res.status(400).json({ message: "Devi accettare la Privacy Policy per registrarti." });
    }
    // Genera un codice di verifica
    const verificationCode = crypto.randomBytes(3).toString('hex').toUpperCase(); // Es. codice di 6 caratteri
    const count = await pwnedPassword(req.body.password);
    if (count > 0) {
      return res.status(400).json({ message: "Questa password è troppo comune o compromessa. Scegline un'altra." });
    }
    const pwd = await bcrypt.hash(req.body.password, 12);
    const newUser = new User({
      name: req.body.name,
      email: normalizedEmail,
      password: pwd,
      avatar: req.body.avatar,
      verificationCode,
      isVerified: false,
      privacyConsent: {
        accepted: req.body.privacyConsent === true,
        timestamp: new Date()
      }
    });


    // Invia l'email di verifica
    await newUser.save();
    await sendVerificationEmail(newUser.email, verificationCode);
    // Modifica il messaggio di risposta
    res.status(201).json({ message: "Registrazione quasi completata! Controlla la tua email per il codice di verifica." });
  } catch (e) {
    // Se l'errore è dovuto a email/username duplicato, gestiscilo specificamente
    if (e.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: "Errore: Username o Email già in uso!" });
    }
    next(e);
  }

}

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userid).select('-password -verificationCode -resetPasswordCode -refreshTokens -lastPasswordResetEmailSentAt -resetPasswordExpires -accountLockedUntil -loginAttempts'); if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: "Server Error" });
  }
};

export const logout = async (req, res, next) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(400).json({ message: "Token not found" });

  try {
    // Decodifica il token (non verifica, serve solo userId)
    const decoded = jwt.decode(token);
    if (!decoded) return res.status(400).json({ message: "Invalid token decoding" });

    const user = await User.findById(decoded.userid);
    if (!user) return res.status(400).json({ message: "Invalid user" });

    // Verifica se esiste e rimuovilo
    const filteredTokens = [];
    let matched = false;
    for (const rt of user.refreshTokens) {
      const match = await bcrypt.compareSync(token, rt.token);
      if (!match) {
        filteredTokens.push(rt);
      } else {
        matched = true;
      }
    }

    if (!matched) {
      return res.status(400).json({ message: "Token non trovato tra i refresh token attivi" });
    }

    user.refreshTokens = filteredTokens;
    await user.save();

    const revokedToken = new RevokedToken({
      token,
      expiresAt: new Date(decoded.exp * 1000)
    });
    await revokedToken.save();

    res.clearCookie('refreshToken', {
      httpOnly: true,
      sameSite: 'None',
      secure: true
    });

    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const callBackGoogle = async (req, res, next) => {
  try {
    const { accessToken, refreshToken, googleId, name, email } = req.user;
    if (!accessToken || !refreshToken) return res.status(401).send("Autenticazione fallita");

    let user = await User.findOne({ googleId });
    if (!user) {
      user = new User({
        googleId,
        name: name || "User",
        email,
        avatar: profile._json.picture || defaultAvatarURL,
            privacyConsent: {
      accepted: true,
      timestamp: new Date()
    }
      });
      user.loginHistory = user.loginHistory || [];
      user.loginHistory.push({
        ip: req.ip,
        userAgent: req.get('User-Agent') || 'unknown',
      });
      if (user.loginHistory.length > 20) {
        user.loginHistory = user.loginHistory.slice(-20);
      }
      await user.save();
    }


    const hashedToken = await bcrypt.hash(refreshToken, 12);
    if (!user.refreshTokens) user.refreshTokens = [];
    if (user.refreshTokens.length >= 10) {
      user.refreshTokens = user.refreshTokens.slice(-9);
    }
    user.refreshTokens.push({ token: hashedToken });
    await user.save();

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

res.redirect(`${process.env.FRONTEND_URL}/login-google-callback?accessToken=${accessToken}&refreshToken=${refreshToken}`);
  } catch (err) {
    console.error("Errore nell'autenticazione con Google:", err);
    res.status(500).send("Errore del server");
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    if (!oldPassword || !newPassword || !confirmPassword) {
      return res
        .status(400)
        .json({ message: "Tutti i campi sono richiesti." });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Le password non corrispondono." });
    }
    // Recupera l'utente loggato usando l'ID ottenuto dal token
    const user = await User.findById(req.user.userid);
    if (!user) {
      return res.status(404).json({ message: "Utente non trovato." });
    }
    if (!user.password) {
      return res.status(400).json({ message: "Impossibile cambiare password: account creato con Google" });
    }

    // Verifica che la vecchia password corrisponda
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "La vecchia password non è corretta." });
    }

    const count = await pwnedPassword(req.body.password);
    if (count > 0) {
      return res.status(400).json({ message: "Questa password è troppo comune o compromessa. Scegline un'altra." });
    }
    // Hash della nuova password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;

    // Salva l'aggiornamento nel database
    await user.save();
    await logSecurityEvent({
      userId: user.id,
      action: "PASSWORD_CHANGED",
      req
    });

    res.status(200).json({ message: "Password aggiornata con successo." });
  } catch (error) {
    next(error);
  }
};


export const resendVerificationEmail = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "L'email è richiesta." });
    }

    const user = await User.findOne({ email: new RegExp(`^${email}$`, 'i') });

    // Per sicurezza non svelare se l'utente esiste o meno
    if (!user || user.isVerified) {
      return res.status(200).json({ message: "Se l'email è corretta, riceverai un codice di verifica." });
    }

    if (user.verificationEmailAttempts >= MAX_VERIFICATION_EMAILS) {
      return res.status(429).json({ message: "Hai raggiunto il limite massimo di invii. Contatta il supporto." });
    }

    const timeSinceLastSend = Date.now() - new Date(user.lastVerificationEmailSentAt).getTime();
    if (timeSinceLastSend < EMAIL_RESEND_COOLDOWN) {
      const timeLeft = Math.ceil((EMAIL_RESEND_COOLDOWN - timeSinceLastSend) / 1000);
      return res.status(429).json({ message: `Attendi ${timeLeft} secondi prima di richiedere un nuovo invio.` });
    }

    const newVerificationCode = crypto.randomBytes(3).toString('hex').toUpperCase();

    user.verificationCode = newVerificationCode;
    user.lastVerificationEmailSentAt = new Date();
    user.verificationEmailAttempts = (user.verificationEmailAttempts || 0) + 1;
    await user.save();

    await sendVerificationEmail(user.email, newVerificationCode);

    res.json({ message: "Nuova email di verifica inviata. Controlla la tua casella di posta." });

  } catch (e) {
    console.error("Errore nel rinvio dell'email di verifica:", e);
    next(e);
  }
};


export const verifyEmail = async (req, res, next) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: "Email e codice sono richiesti." });
    }

    const user = await User.findOne({ email: new RegExp(`^${email}$`, 'i') });

    if (!user) {
      return res.status(404).json({ message: "Utente non trovato." });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Email già verificata." });
    }

    if (user.verificationCode !== code.toUpperCase()) { // Confronta con il codice salvato
      return res.status(400).json({ message: "Codice di verifica non valido." });
    }

    // Verifica riuscita: aggiorna l'utente
    user.isVerified = true;
    user.verificationCode = null;
    await user.save();

    res.json({ message: "Email verificata con successo! Ora puoi effettuare il login." });

  } catch (e) {
    next(e);
  }
};

// Funzione per cambiare l'email e rinviare l'email di verifica
export const changeEmailAndResendVerification = async (req, res, next) => {
  try {
    const { newEmail, password } = req.body;
    const userId = req.user.userid;

    if (!newEmail || !password) {
      return res.status(400).json({ message: "Email nuova e password sono richieste." });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "Utente non trovato." });

    if (!user.password) {
      return res.status(400).json({ message: "Questo account non ha una password impostata. Risulta essere impossibile effettuare modifiche su un account creato con Google" });
    }

    const isPasswordValid = await bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Password non corretta." });
    }

    if (newEmail === user.email) {
      return res.status(400).json({ message: "La nuova email è uguale a quella attuale." });
    }

    const emailExists = await User.findOne({ email: newEmail });
    if (emailExists) {
      return res.status(400).json({ message: "Questa email è già in uso da un altro utente." });
    }

    const timeSinceLast = user.lastVerificationEmailSentAt
      ? Date.now() - new Date(user.lastVerificationEmailSentAt).getTime()
      : EMAIL_RESEND_COOLDOWN;

    if (timeSinceLast < EMAIL_RESEND_COOLDOWN) {
      const timeLeft = Math.ceil((EMAIL_RESEND_COOLDOWN - timeSinceLast) / 1000);
      return res.status(429).json({ message: `Attendi ${timeLeft}s prima di un nuovo invio.` });
    }

    const code = crypto.randomBytes(3).toString("hex").toUpperCase();
    user.email = newEmail;
    user.isVerified = false;
    user.verificationCode = code;
    user.lastVerificationEmailSentAt = new Date();
    await user.save();
    res.clearCookie('refreshToken', {
      httpOnly: true,
      sameSite: 'None',
      secure: true,
    });
    await sendVerificationEmail(newEmail, code);
    res.json({ message: "Email aggiornata! Verifica la nuova casella.", forceLogout: true });
  } catch (e) {
    console.error("Errore nel cambio email:", e);
    next(e);
  }
};

// Controller per richiedere il reset password
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "L'email è richiesta per il reset password." });
    }

    const user = await User.findOne({ email: new RegExp(`^${email}$`, 'i') });

    // Per sicurezza, non rivelare se l'utente esiste o meno.
    // Invia sempre lo stesso messaggio di successo parziale.
    if (!user) {
      return res.status(200).json({ message: "Se un utente con questa email esiste, un'email per il reset della password è stata inviata." });
    }

    // Controllo del rate limiting per il reset password
    if (user.lastPasswordResetEmailSentAt) {
      const timeSinceLastSend = Date.now() - new Date(user.lastPasswordResetEmailSentAt).getTime();
      if (timeSinceLastSend < EMAIL_RESEND_COOLDOWN) {
        // Non bloccare completamente, ma potresti registrare un tentativo non riuscito o ritardare.
        // Per semplicità qui inviamo lo stesso messaggio di "successo" ma non inviamo l'email.
        console.warn(`Rate limit hit for password reset email to ${user.email}`);
        return res.status(200).json({ message: "Se un utente con questa email esiste, un'email per il reset della password è stata inviata." });
      }
    }


    // Genera un codice di reset unico (es. 6 caratteri esadecimali)
    const resetCode = crypto.randomBytes(3).toString('hex').toUpperCase(); // 6 caratteri

    // Imposta la data di scadenza (es. 1 ora da ora)
    const resetExpires = new Date(Date.now() + PASSWORD_RESET_CODE_EXPIRY);

    // Salva il codice di reset e la scadenza nell'utente
    user.resetPasswordCode = resetCode;
    user.resetPasswordExpires = resetExpires;
    user.lastPasswordResetEmailSentAt = new Date();
    await user.save();

    // Invia l'email con il codice di reset
    // Usiamo un try/catch separato per l'invio dell'email
    // per non impedire il salvataggio del codice se l'email fallisce,
    // ma gestiamo l'errore di invio.
    try {
      await sendPasswordResetEmail(user.email, resetCode);
      res.status(200).json({ message: "Se un utente con questa email esiste, un'email per il reset della password è stata inviata." });
    } catch (emailError) {
      console.error("Errore critico nell'invio dell'email di reset password:", emailError);
      // Potresti voler loggare l'errore o notificare un admin
      // e rispondere comunque al client con un messaggio generico
      // per evitare di esporre dettagli interni.
      res.status(500).json({ message: "Si è verificato un errore durante l'invio dell'email di reset. Riprova più tardi." });

      // Optional: Potresti voler annullare il salvataggio del codice se l'email fallisce
      // o marcare l'utente in qualche modo. Questo rende il flusso più complesso.
      // Per ora, lasciamo il codice salvato ma logghiamo l'errore di invio.
    }


  } catch (e) {
    console.error("Errore nella richiesta di reset password:", e);
    next(e); // Passa altri errori al gestore generale
  }
};

// Controller per resettare la password usando il codice
export const resetPassword = async (req, res, next) => {
  try {
    const { email, code, newPassword, confirmPassword } = req.body;
    const count = await pwnedPassword(req.body.newPassword);
    if (count > 0) {
      return res.status(400).json({ message: "Questa password è troppo comune o compromessa. Scegline un'altra." });
    }
    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: "Email, codice di reset e nuova password sono richiesti." });
    }

    // Cerca l'utente per email E codice di reset
    // Questo previene attacchi che tentano di indovinare il codice
    // sapendo solo l'email.
    const user = await User.findOne({

      email: new RegExp(`^${email}$`, 'i'),
      resetPasswordCode: code.toUpperCase() // Confronta il codice (rendilo case-insensitive se necessario)

    });


    // Se l'utente non è stato trovato con quel codice O il codice è nullo
    if (!user) {
      return res.status(400).json({ message: "Codice di reset non valido o email non corrispondente." });
    }

    // Controlla se il codice è scaduto
    if (user.resetPasswordExpires < new Date()) {
      // Pulisci i campi di reset password scaduti
      user.resetPasswordCode = null;
      user.resetPasswordExpires = null;
      await user.save();
      return res.status(400).json({ message: "Codice di reset scaduto. Richiedi un nuovo reset password." });
    }

    // Se il codice è valido e non scaduto:
    // 1. Hasher la nuova password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // 2. Aggiornare la password dell'utente
    user.password = hashedNewPassword;

    // 3. Invalidare il codice di reset
    user.resetPasswordCode = null;
    user.resetPasswordExpires = null;
    user.lastPasswordResetEmailSentAt = null; // Reset anche il timestamp di invio per sicurezza/pulizia

    // 4. Salvare l'utente
    await user.save();
    await logSecurityEvent({
      userId: user.id,
      action: "PASSWORD_CHANGED",
      req
    });

    res.status(200).json({ message: "Password resettata con successo. Ora puoi effettuare il login con la nuova password." });

  } catch (e) {
    console.error("Errore nel reset password:", e);
    next(e); // Passa altri errori al gestore generale
  }
};

