import express from 'express';
import * as reptileController from '../controllers/ReptileRoute_controller.js';
import { authenticateJWT } from '../middlewares/Auth.js';
import { isOwnerOrAdmin } from '../middlewares/Authorization.js';
import { validateReptile } from '../validate/validateReptile.js';
import  upload  from '../config/MulterConfig.js';
import { auditLogger } from '../middlewares/auditLogger.js';
import Reptile from '../models/Reptile.js';
import { GetEvents, CreateEvent, DeleteEvent, averageShedInterval } from '../controllers/EventController.js';
import { exportReptileData, generateReptilePDF } from '../controllers/ExportReptileData.js';
const reptileRouter = express.Router();

reptileRouter.get('/', authenticateJWT, reptileController.GetAllReptile);
reptileRouter.get('/:reptileId', authenticateJWT, isOwnerOrAdmin(Reptile, 'reptileId'), reptileController.GetIDReptile);
reptileRouter.get('/:userId/AllReptile', authenticateJWT, reptileController.GetAllReptileByUser);
reptileRouter.post('/', authenticateJWT, upload.single('image'), reptileController.PostReptile);
reptileRouter.put('/:reptileId', authenticateJWT, auditLogger('UPDATE_REPTILE'), upload.single('image'), validateReptile, isOwnerOrAdmin(Reptile, 'reptileId'), reptileController.PutReptile);
reptileRouter.delete('/:reptileId', authenticateJWT, auditLogger('DELETE_REPTILE'), isOwnerOrAdmin(Reptile, 'reptileId'), reptileController.DeleteReptile);

reptileRouter.get('/export/reptiles/:userId', authenticateJWT, exportReptileData);

reptileRouter.get('/:id/pdf', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  await generateReptilePDF(id, res);
});
reptileRouter.get('/analytics/shed-interval', authenticateJWT, averageShedInterval);

reptileRouter.get('/events/:reptileId',authenticateJWT,  GetEvents);
reptileRouter.post('/events', authenticateJWT,   CreateEvent);
reptileRouter.delete('/events/:eventId',authenticateJWT,   DeleteEvent);
export default reptileRouter;
