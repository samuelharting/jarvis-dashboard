import { Router } from 'express';
import { HealthResponse } from '../../shared/types.js';

export const healthRouter = Router();

healthRouter.get('/', (req, res) => {
  const healthResponse: HealthResponse = {
    ok: true,
    serverTime: new Date().toISOString()
  };
  
  res.json(healthResponse);
});