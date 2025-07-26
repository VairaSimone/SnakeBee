import jwt from 'jsonwebtoken';
import RevokedToken from '../models/RevokedToken.js';

//Route Authentication
export const authenticateJWT = async (req, res, next) => {
    const authHeader = req.header('Authorization');

    if (!authHeader) {
        return res.status(401).json({ message: 'Access token missing' });
    }

    const token = authHeader.split(' ')[1];

    try {
        // Check if the token has been revoked
        const isRevoked = await RevokedToken.findOne({ token });
        if (isRevoked) {
            return res.status(403).json({ message: 'Token Revoked' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        const status = error.name === 'TokenExpiredError' ? 401 : 403;
        return res.status(status).json({ message: error.message });
    }
};
