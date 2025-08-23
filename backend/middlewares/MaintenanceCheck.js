
import SystemConfig from "../models/SystemConfig.js";

export const maintenanceCheck = async (req, res, next) => {
  const config = await SystemConfig.findOne(); 

  if (!config || !config.maintenanceMode) {
    return next(); 
  }

const email = req.body?.email?.toLowerCase() || req.user?.email?.toLowerCase();
  if (email && config.maintenanceWhitelist.includes(email)) {
    return next(); 
  }


  return res.status(503).json({
    message: req.t('maintenance') 
  });
};
