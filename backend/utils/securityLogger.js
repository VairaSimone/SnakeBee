export const logSecurityEvent = async ({ userId, action, req }) => {
  try {
    console.log(`[SECURITY EVENT] User: ${userId}, Action: ${action}, IP: ${req.ip}, UserAgent: ${req.get('User-Agent')}`);
  } catch (error) {
    console.error("Errore nel logging di sicurezza:", error);
  }
};
