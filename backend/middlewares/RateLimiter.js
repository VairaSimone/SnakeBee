import rateLimit from 'express-rate-limit';

export const refreshLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minuti
  max: 5, // massimo 5 richieste ogni 5 minuti per IP
  message: { message: "Too many refresh attempts. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});
export const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minuti
  max: 5, // max 5 tentativi per IP
  message: { message: "Troppi tentativi di login. Riprova più tardi." },
  standardHeaders: true,
  legacyHeaders: false,
});

export const registerLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minuti
  max: 10,
  message: { message: "Troppi tentativi di registrazione. Riprova più tardi." },
  standardHeaders: true,
  legacyHeaders: false,
});