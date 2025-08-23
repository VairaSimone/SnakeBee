import Log from '../models/Log.js';

export const logAction = async (userId, action, note = '') => {
  try {
    await Log.create({ user: userId, action, note });
  } catch (err) {
    console.error("Log error:", err);
  }
};
