import express from 'express';
import * as notificationController from '../controllers/NotificationRoute_controller.js';
import { authenticateJWT } from '../middlewares/Auth.js';
import { validateNotification, validateNotificationUpdate } from '../validate/validateNotification.js';
import { isOwnerOrAdmin } from '../middlewares/Authorization.js';
import Notification from '../models/Notification.js';

const notificationRouter = express.Router();

notificationRouter.get('/user/:userId', authenticateJWT, notificationController.getUserNotifications);
notificationRouter.post('/reptile/:reptileId/', authenticateJWT, validateNotification, notificationController.createNotification);
notificationRouter.put('/:notificationId', authenticateJWT, validateNotificationUpdate, notificationController.updateNotification);
notificationRouter.get('/unread/count', authenticateJWT, notificationController.getUnreadNotificationCount);
notificationRouter.delete('/:notificationId', authenticateJWT, isOwnerOrAdmin(Notification, 'id'), notificationController.deleteNotification);

export default notificationRouter;
