import express from 'express';
import * as authController from '../controllers/AuthRoute_controller.js';
import { authenticateJWT } from '../middlewares/Auth.js';
import { refreshToken } from '../config/RefreshToken.js';
import passport from 'passport';
import { loginLimiter, registerLimiter, refreshLimiter } from '../middlewares/RateLimiter.js';
import * as validateAuth from "../validate/validateAuth.js";
import validateBody from "../middlewares/validate.js";
import User from "../models/User.js";


const authRouter = express.Router();

authRouter.post('/login', loginLimiter, validateBody(validateAuth.signinSchema), authController.validateLogin, authController.login);
authRouter.post('/register', registerLimiter, [
    validateBody(validateAuth.signupSchema),
],
    authController.register);
authRouter.post('/logout', authController.logout);
authRouter.post('/refresh-token', refreshLimiter, refreshToken);
authRouter.get('/me', authenticateJWT, authController.getMe);
authRouter.post('/verify-email', authController.verifyEmail)
authRouter.post('/forgot-password', authController.forgotPassword)
authRouter.post('/reset-password', validateBody(validateAuth.resetPasswordSchema), authController.resetPassword)
authRouter.get('/login-history', authenticateJWT, async (req, res) => {
    try {
        const user = await User.findById(req.user.userid).select('loginHistory');
        if (!user) return res.status(404).json({ message: 'User not found' });

        const history = [...(user.loginHistory || [])].reverse(); 
        res.json(history);
    } catch (e) {
        console.error('Errore login-history:', e);
        res.status(500).json({ message: 'Errore server' });
    }
});
authRouter.post('/resend-verification', authController.resendVerificationEmail);
authRouter.post("/change-email", authenticateJWT,
    [validateBody(validateAuth.changeEmailSchema)],
    authController.changeEmailAndResendVerification
);
authRouter.post("/change-password", [authenticateJWT, validateBody(validateAuth.changePasswordSchema)], authController.changePassword);

authRouter.get("/login-google", passport.authenticate("google", { scope: ["profile", "email"] }))
authRouter.get("/callback-google", passport.authenticate("google", { session: false }), authController.callBackGoogle)



export default authRouter;
