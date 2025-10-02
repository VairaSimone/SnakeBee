import jwt from 'jsonwebtoken';
import RevokedToken from '../models/RevokedToken.js';
import User from '../models/User.js';
import bcrypt from "bcrypt";

//Route Authentication
export const authenticateJWT = async (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        return res.status(401).json({ message: req.t('refresh_token') });
    }

    const token = authHeader.split(' ')[1];

    try {
        // Check if the token has been revoked
        const revokedTokens = await RevokedToken.find();
        for (const rt of revokedTokens) {
            if (await bcrypt.compare(token, rt.token)) {

                return res.status(403).json({ message: req.t('tokenRevoked') });
            }
        }
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

        const user = await User.findById(decoded.userid).select('role');
        if (!user) {
            return res.status(401).json({ message: req.t('user_notFound') });
        }

        if (user.role === 'banned') {
            return res.status(403).json({ message: req.t('account_ban') });
        }

        req.user = decoded;
        req.user.role = user.role;
        next();
    } catch (error) {

        const status = error.name === 'TokenExpiredError' ? 401 : 403;
        return res.status(status).json({ message: error.message });
    }
};

export const telegramTokenMiddleware = (req, res, next) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ message: "Missing Telegram token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // lo stesso usato in /link
    req.telegramId = decoded.telegramId;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") return res.status(401).json({ message: "Token scaduto" });
    return res.status(401).json({ message: "Token non valido" });
  }
};

