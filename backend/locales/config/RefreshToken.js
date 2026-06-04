import RevokedToken from '../models/RevokedToken.js';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import bcrypt from "bcrypt";

//Refresh Token Management. Requests an Access Token if expired and saves the Refresh Token in cookies
export const refreshToken = async (req, res) => {


    const generateAccessToken = (user) => {
        return jwt.sign({ userid: user._id, role: user.role }, process.env.JWT_ACCESS_SECRET, { expiresIn: '30min' });
    };

    const generateRefreshToken = (user) => {
        return jwt.sign({ userid: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
    };

    const token = req.cookies.refreshToken;
    if (!token) return res.status(403).json({ message: req.t('refresh_token') });
    try {
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(decoded.userid);
        if (!user) return res.status(403).json({ messaggio: req.t('token_invalid') });
        const revokedTokens = await RevokedToken.find();
        for (const rt of revokedTokens) {
            const match = await bcrypt.compare(token, rt.token);
            if (match) {
                return res.status(403).json({ message: req.t('tokenRevoked') });
            }
        }

        const maxTokenAgeMs = 7 * 24 * 60 * 60 * 1000;
        const issuedAtMs = decoded.iat * 1000;
        if (Date.now() - issuedAtMs > maxTokenAgeMs) {
            console.warn("Token too old: potential risk of replay attack");
            return res.status(403).json({ message: req.t('refresh_old') });
        }


        let match = false;
        for (const rt of user.refreshTokens) {
            const isMatch = await bcrypt.compare(token, rt.token);
            if (isMatch) {
                match = true;
                break;
            }
        }

        if (!match) {
            // Reuse or invalid token
            console.warn("REUSE DETECTED: Refresh token used but no longer valid.");
            user.refreshTokens = [];
            await user.save();
            return res.status(403).json({ message: req.t('token_warn')  });
        }

        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);

        // Update the refresh token in the DB
        const hashedNew = await bcrypt.hash(newRefreshToken, 12);

        const filteredTokens = [];
        for (const rt of user.refreshTokens) {
            const match = await bcrypt.compare(token, rt.token);
            if (!match) filteredTokens.push(rt);
        }

        filteredTokens.push({ token: hashedNew });
        user.refreshTokens = filteredTokens;

        await user.save();

                // Send the new refresh token and access token
        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
            path: '/api/v1',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 day
        });

        return res.json({ accessToken: newAccessToken });
    } catch (error) {
        return res.status(403).json({ message: req.t('token_invalid') });
    }
};
