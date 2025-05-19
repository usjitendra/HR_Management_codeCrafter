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
performanceRouter.put('/update/:id', updatePerformance);
performanceRouter.delete('/delete/:id', deletePerformance);

export default performanceRouter;
