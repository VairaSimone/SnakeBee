import cron from 'node-cron';
import RevokedToken from '../models/RevokedToken.js';

// JOB performs expired token deletion every day at midnight
cron.schedule('0 0 * * *', async () => {
    try {
        await RevokedToken.deleteMany({ expiresAt: { $lt: new Date() } });
        console.log('JOB - Revoked Tokens Expired Deleted');
    } catch (error) {
        console.error('JOB - Error while cleaning revoked tokens: ', error);
    }
});
