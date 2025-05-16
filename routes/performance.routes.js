import express from 'express';
import {
  createPerformance,
  getPerformances,
  updatePerformance,
  deletePerformance,
} from '../controllers/performance.controller.js';

const performanceRouter = express.Router();

performanceRouter.post('/create', createPerformance);
performanceRouter.get('/all/:id', getPerformances);
// performanceRouter.put('/performance/:id', updatePerformance);
// performanceRouter.delete('/performance/:id', deletePerformance);

export default performanceRouter;
