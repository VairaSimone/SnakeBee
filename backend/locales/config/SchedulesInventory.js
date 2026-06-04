import cron from 'node-cron';
import { checkAndSendLowInventoryAlerts } from '../controllers/FoodInventoryController.js';
cron.schedule('0 7 * * *', () => {
  console.log('Running daily inventory check...');
  checkAndSendLowInventoryAlerts();
});