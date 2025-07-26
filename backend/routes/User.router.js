import express from 'express';
import * as userController from '../controllers/UserRoute_controller.js';
import { authenticateJWT } from '../middlewares/Auth.js';
import { isAdmin, isOwnerOrAdmin } from '../middlewares/Authorization.js';
import User from '../models/User.js';
import { auditLogger } from '../middlewares/auditLogger.js';
import upload from '../config/MulterConfig.js';

const userRouter = express.Router();
userRouter.get(
    '/',
    authenticateJWT, isAdmin,
    auditLogger('GET_ALL_USERS'),
    userController.GetAllUser
);
userRouter.get(
    '/:userId',
    authenticateJWT,
    auditLogger('GET_USER_BY_ID'),
    isOwnerOrAdmin(User, 'userId'),
    userController.GetIDUser
);
userRouter.put("/:userId", authenticateJWT, auditLogger('UPDATE_USER'), isOwnerOrAdmin(User, "userId"), upload.single("avatar"), userController.PutUser);
userRouter.delete('/:userId', authenticateJWT, auditLogger('DELETE_USER'), isOwnerOrAdmin(User, "userId"), userController.DeleteUser);

userRouter.patch('/users/email-settings/:userId', authenticateJWT, userController.updateEmailPreferences);


export default userRouter;
