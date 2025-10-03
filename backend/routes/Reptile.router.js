import express from 'express';
import * as reptileController from '../controllers/ReptileRoute_controller.js';
import { authenticateJWT } from '../middlewares/Auth.js';
import { isOwnerOrAdmin } from '../middlewares/Authorization.js';
import  upload  from '../config/MulterConfig.js';
import Reptile from '../models/Reptile.js';
import { GetEvents, CreateEvent, DeleteEvent, averageShedInterval } from '../controllers/EventController.js';
import { exportReptileData, generateReptilePDF } from '../controllers/ExportReptileData.js';

const reptileRouter = express.Router();

reptileRouter.get('/', authenticateJWT, reptileController.GetAllReptile);
reptileRouter.get('/:id/pdf', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  await generateReptilePDF(req, res);
});
reptileRouter.get('/:reptileId', authenticateJWT, isOwnerOrAdmin(Reptile, 'reptileId'), reptileController.GetIDReptile);
reptileRouter.get('/:userId/AllReptile', authenticateJWT, reptileController.GetAllReptileByUser);
reptileRouter.get('/:userId/AllReptileUser', authenticateJWT, reptileController.GetReptileByUser);
reptileRouter.post('/', authenticateJWT, upload.array('image') , reptileController.PostReptile);
reptileRouter.put('/:reptileId', authenticateJWT, upload.array('image'), isOwnerOrAdmin(Reptile, 'reptileId'), reptileController.PutReptile);
reptileRouter.delete('/:reptileId', authenticateJWT, isOwnerOrAdmin(Reptile, 'reptileId'), reptileController.DeleteReptile);
reptileRouter.get('/export/reptiles/:userId', authenticateJWT, exportReptileData);
reptileRouter.get('/analytics/shed-interval', authenticateJWT, averageShedInterval);
reptileRouter.get('/events/:reptileId',authenticateJWT,  GetEvents);
reptileRouter.post('/events', authenticateJWT,   CreateEvent);
reptileRouter.delete('/events/:eventId',authenticateJWT,   DeleteEvent);
reptileRouter.delete('/:reptileId/image/:imageIndex', authenticateJWT, isOwnerOrAdmin(Reptile, 'reptileId'), reptileController.DeleteReptileImage);
reptileRouter.get('/public/reptile/:reptileId', reptileController.GetReptilePublic);

export default reptileRouter;
