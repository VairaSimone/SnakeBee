import rateLimit from 'express-rate-limit';

export const refreshLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minuti
  max: 5000,
  message: (req, res) => {
    return { message: req.t('rateLimit.refresh') };
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5000,
  message: (req, res) => {
    return { message: req.t('rateLimit.login') };
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const registerLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10000,
  message: (req, res) => {
    return { message: req.t('rateLimit.register') };
  },
  standardHeaders: true,
  legacyHeaders: false,
});
