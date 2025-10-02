import express from 'express';
import * as userController from '../controllers/UserRoute_controller.js';
import { authenticateJWT } from '../middlewares/Auth.js';
import { isAdmin, isOwnerOrAdmin } from '../middlewares/Authorization.js';
import User from '../models/User.js';
import upload from '../config/MulterConfig.js';
import SystemConfig from '../models/SystemConfig.js';
import { sendBroadcastEmailToUser, transporter } from '../config/mailer.config.js';

const userRouter = express.Router();

userRouter.get('/referral-link', authenticateJWT, userController.generateReferralLink);

userRouter.get('/', authenticateJWT, isAdmin, userController.GetAllUser);
userRouter.get('/:userId', authenticateJWT, isOwnerOrAdmin(User, 'userId'), userController.GetIDUser);
userRouter.put("/:userId", authenticateJWT, isOwnerOrAdmin(User, "userId"), upload.single("avatar"), userController.PutUser);
userRouter.delete('/:userId', authenticateJWT,isOwnerOrAdmin(User, "userId"), userController.DeleteUser);
userRouter.patch('/users/email-settings/:userId', authenticateJWT, userController.updateEmailPreferences);
userRouter.patch('/admin/users/:userId/role', authenticateJWT, isAdmin, userController.UpdateUserRole);
userRouter.patch('/fiscalDetails', authenticateJWT, userController.updateFiscalDetails);
userRouter.post("/admin/maintenance", authenticateJWT, isAdmin,  async (req, res) => {
  const { enable, whitelist } = req.body;
  let config = await SystemConfig.findOne();
  if (!config) config = new SystemConfig();
  config.maintenanceMode = enable;
  if (whitelist) config.maintenanceWhitelist = whitelist.map(e => e.toLowerCase());
  await config.save();
  await User.updateMany({}, { refreshTokens: [] });
  res.json({ message: "Updated configuration", config });
});




/**
 * POST /api/user/admin/send-bulk-email
 * body: {
  "filters": {
    "subscription.plan": "premium",
    "language": "it"
  },
  "subject": "Titolo della mail",
  "html": "<h1>Ciao premium user</h1><p>Contenuto dinamico...</p>",
  "text": "Versione testuale opzionale"
}

 */

userRouter.post("/admin/send-bulk-email",authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { filters = {},  emails = [], subject, html, text = "" } = req.body;

    if (!subject || !html) {
      return res.status(400).json({ error: "Subject and HTML are required" });
    }
    let users = [];

    if (Object.keys(filters).length > 0) {
      const dbUsers = await User.find(filters, { email: 1, language: 1, _id: 0 });
      users.push(...dbUsers.map(u => ({ email: u.email, language: u.language || 'en' })));
    }

       if (emails.length > 0) {
      const externalEmails = emails.map(e => ({ email: e, language: 'en' }));
      users.push(...externalEmails);
    }
        if (users.length === 0) {
      return res.json({ total: 0, sent: 0, failed: 0 });
    }

    const chunkSize = 200;
    let sentCount = 0;
    let failCount = 0;

for (let i = 0; i < users.length; i += chunkSize) {
  const chunk = users.slice(i, i + chunkSize);

const results = await Promise.allSettled(
  chunk.map((u) => sendBroadcastEmailToUser(u, subject, html, text))
);

  results.forEach(r => {
    if (r.status === "fulfilled" && r.value) sentCount++;
    else failCount++;
  });

  await new Promise(r => setTimeout(r, 500));
    }

    return res.json({
      total: users.length,
      sent: sentCount,
      failed: failCount,
    });
  } catch (err) {
    console.error("Bulk email error:", err);
    return res.status(500).json({ error: "Error sending email" });
  }
});


export default userRouter;
