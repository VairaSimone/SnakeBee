
import SystemConfig from "../models/SystemConfig.js";

export const maintenanceCheck = async (req, res, next) => {
  const config = await SystemConfig.findOne(); 

  if (!config || !config.maintenanceMode) {
    return next(); 
  }

let email;
 if (req.user) {
    email = req.user.email?.toLowerCase() || req.user.emails?.[0]?.value?.toLowerCase();
  } else if (req.body?.email) {
    email = req.body.email.toLowerCase();
  }

  if (email && Array.isArray(config.maintenanceWhitelist) && config.maintenanceWhitelist.includes(email)) {
    return next();
  }


  return res.status(503).json({
    message: req.t('maintenance') 
  });
};
