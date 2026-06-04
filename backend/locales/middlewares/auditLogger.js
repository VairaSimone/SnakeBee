import fs from 'fs/promises';

export const auditLogger = (action) => async (req, res, next) => {
  const userId = req.user?.userid || 'Anonymous';
  const now = new Date().toISOString();
  const logEntry = `[${now}] USER:${userId} - ACTION:${action} - PATH:${req.originalUrl} - METHOD:${req.method}\n`;
  await fs.appendFile('audit.log', logEntry);
  next();
};
