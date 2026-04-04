import * as GamificationController from '../controllers/GamificationRoute_controller.js';
import express from 'express';
const gamificationRouter = express.Router();

gamificationRouter.get('/leaderboards', GamificationController.getLeaderboards);

export default gamificationRouter;