import jwt from 'jsonwebtoken';
import RevokedToken from '../models/RevokedToken.js';
import User from '../models/User.js';
import bcrypt from "bcrypt";

export const authenticateJWT = async (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        return res.status(401).json({ message: req.t('refresh_token') });
    }

    const token = authHeader.split(' ')[1];

    try {
        const revokedTokens = await RevokedToken.find();
        for (const rt of revokedTokens) {
            if (await bcrypt.compare(token, rt.token)) {
                return res.status(403).json({ message: req.t('tokenRevoked') });
            }
        }
        
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

        // 1. Troviamo l'utente REALE che ha fatto il login
        const loggedInUser = await User.findById(decoded.userid).select('role');
        if (!loggedInUser) {
            return res.status(401).json({ message: req.t('user_notFound') });
        }

        if (loggedInUser.role === 'banned') {
            return res.status(403).json({ message: req.t('account_ban') });
        }

        // --- INIZIO LOGICA ACCESSO DELEGATO ---
        const operateAsId = req.headers['x-operate-as'];

        // Se è presente l'header e l'utente chiede di operare come qualcun altro
        if (operateAsId && operateAsId !== decoded.userid) {
            
            // Cerca l'utente/allevamento principale
            const masterUser = await User.findById(operateAsId).select('role delegates');

            if (!masterUser) {
                return res.status(404).json({ message: "Allevamento principale non trovato" });
            }

            // Controlla se l'utente loggato è presente nell'array 'delegates' del masterUser
            const delegation = masterUser.delegates.find(
                d => d.user.toString() === decoded.userid.toString()
            );

            if (delegation) {
                // LA MAGIA: Inganniamo i controller! 
                // Impostiamo come userid quello del proprietario principale
                req.user = {
                    ...decoded,
                    userid: masterUser._id.toString(), 
                    role: masterUser.role // Opzionale: usiamo il ruolo del proprietario
                };
                
                // Salviamo le info sul delegato per eventuali controlli extra (es. se vuoi bloccare le delete)
                req.delegateRole = delegation.role; // es. 'editor' o 'viewer'
                req.realUserId = decoded.userid;    // Manteniamo traccia del vero utente che sta operando
                
                return next();
            } else {
                return res.status(403).json({ message: "Non hai i permessi per accedere a questo allevamento" });
            }
        }
        // --- FINE LOGICA ACCESSO DELEGATO ---


        // 2. Se non c'è delega, procediamo con l'accesso normale sul proprio account
        req.user = decoded;
        req.user.role = loggedInUser.role;
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET); 
    req.telegramId = decoded.telegramId;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") return res.status(401).json({ message: "Token scaduto" });
    return res.status(401).json({ message: "Token non valido" });
  }
};