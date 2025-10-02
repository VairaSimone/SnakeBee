import express from 'express';
import * as authController from '../controllers/AuthRoute_controller.js';
import { authenticateJWT } from '../middlewares/Auth.js';
import { refreshToken } from '../config/RefreshToken.js';
import passport from 'passport';
import { loginLimiter, registerLimiter, refreshLimiter } from '../middlewares/RateLimiter.js';
import * as validateAuth from "../validate/validateAuth.js";
import validateBody from "../middlewares/validate.js";
import User from "../models/User.js";
import { maintenanceCheck } from '../middlewares/MaintenanceCheck.js';


const authRouter = express.Router();

authRouter.post('/login',  maintenanceCheck, validateBody(validateAuth.signinSchema), authController.validateLogin, authController.login);
authRouter.post('/register', maintenanceCheck, validateBody(validateAuth.signupSchema), authController.register);
authRouter.post('/logout', authController.logout);
authRouter.post('/refresh-token', refreshToken);
authRouter.get('/me', authenticateJWT, authController.getMe);
authRouter.post('/verify-email', authController.verifyEmail)
authRouter.post('/forgot-password', authController.forgotPassword)
authRouter.post('/reset-password', validateBody(validateAuth.resetPasswordSchema), authController.resetPassword)
authRouter.post('/resend-verification', authController.resendVerificationEmail);
authRouter.post("/change-email", authenticateJWT, validateBody(validateAuth.changeEmailSchema), authController.changeEmailAndResendVerification);
authRouter.post("/change-password", [authenticateJWT, validateBody(validateAuth.changePasswordSchema)], authController.changePassword);
authRouter.get("/login-google",  (req, res, next) => {
    const refCode = req.query.ref;
    if (refCode) {
        req.session.refCode = refCode;
    }
    passport.authenticate("google", {
        scope: ["profile", "email"],
        accessType: "offline",
        prompt: "consent"
    })(req, res, next);
});
authRouter.get("/callback-google", passport.authenticate("google", { session: false }), maintenanceCheck, authController.callBackGoogle)
authRouter.get('/login-history', authenticateJWT, async (req, res) => {
    try {
        const user = await User.findById(req.user.userid).select('loginHistory');
        if (!user) return res.status(404).json({ message: req.t('user_notFound') });

        const history = [...(user.loginHistory || [])].reverse();
        res.json(history);
    } catch (e) {
        console.error('Errore login-history:', e);
        res.status(500).json({ message: req.t('server_error')  });
    }
});

export default authRouter;
