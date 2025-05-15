import express from 'express';
import {
  createPerformance,
  getPerformances,
  updatePerformance,
  deletePerformance,
} from '../controllers/performanceController.js';

const router = express.Router();

router.post('/performance', createPerformance);
router.get('/performance', getPerformances);
router.put('/performance/:id', updatePerformance);
router.delete('/performance/:id', deletePerformance);

export default router;
