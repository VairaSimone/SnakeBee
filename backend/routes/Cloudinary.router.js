import express from 'express';
import cloudinary from '../config/CloudinaryConfig.js';
import { isAdmin } from '../middlewares/Authorization.js';
import { authenticateJWT } from '../middlewares/Auth.js';

const router = express.Router();

router.get('/usage', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const result = await cloudinary.api.usage();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
