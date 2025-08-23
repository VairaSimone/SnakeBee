// models/SystemConfig.js
import mongoose from "mongoose";

const systemConfigSchema = new mongoose.Schema({
  maintenanceMode: { type: Boolean, default: false },
  maintenanceWhitelist: { type: [String], default: [] } 
});

export default mongoose.model("SystemConfig", systemConfigSchema);
