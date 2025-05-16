import express from 'express';
import {
  createPerformance,
  getPerformances,
  updatePerformance,
  deletePerformance,
} from '../controllers/performance.controller';

const performanceRouter = express.Router();

performanceRouter.post('/performance', createPerformance);
// performanceRouter.get('/performance', getPerformances);
// performanceRouter.put('/performance/:id', updatePerformance);
// performanceRouter.delete('/performance/:id', deletePerformance);

export default performanceRouter;
