import RevokedToken from '../models/RevokedToken.js';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import bcrypt from "bcrypt";

//Refresh Token Management. Requests an Access Token if expired and saves the Refresh Token in cookies
export const refreshToken = async (req, res) => {


    const generateAccessToken = (user) => {
        return jwt.sign({ userid: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '2h' });
    };

    const generateRefreshToken = (user) => {
        return jwt.sign({ userid: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
    };

    const token = req.cookies.refreshToken;
    if (!token) return res.status(403).json({ message: "Refresh token missing" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(decoded.userid);
        if (!user) return res.status(403).json({ message: "Invalid token" });


        const isRevoked = await RevokedToken.findOne({ token });
        // Check reuse attack

        if (isRevoked) return res.status(403).json({ message: "Token Revoked" });

        const maxTokenAgeMs = 7 * 24 * 60 * 60 * 1000;
        const issuedAtMs = decoded.iat * 1000;
        if (Date.now() - issuedAtMs > maxTokenAgeMs) {
            console.warn("Token troppo vecchio: potenziale rischio di replay attack");
            return res.status(403).json({ message: "Refresh token troppo vecchio" });
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
            // Reuse o token non valido
            console.warn("REUSE DETECTED: Refresh token usato ma non più valido.");
            user.refreshTokens = [];
            await user.save();
            return res.status(403).json({ message: "Token reuse detected. All sessions cleared." });
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

        // Add the old refresh token to the list of revoked tokens
        if (!isRevoked && decoded.exp * 1000 > Date.now()) {
            const revokedToken = new RevokedToken({
                token,
                expiresAt: new Date(decoded.exp * 1000)
            });
            await revokedToken.save();

        }
        // Send the new refresh token and access token
        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 day
        });

        return res.json({ accessToken: newAccessToken });
    } catch (error) {
        return res.status(403).json({ message: "Invalid or expired token" });
    }
};
