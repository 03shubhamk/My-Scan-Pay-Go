import { Request, Response, NextFunction } from 'express';
import { healthService } from '../services/healthService';

export const getHealth = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const healthResult = await healthService.checkSystemHealth();
    const statusCode = healthResult.status === 'UP' ? 200 : 503;

    res.status(statusCode).json({
      success: healthResult.status === 'UP',
      data: healthResult,
    });
  } catch (error) {
    next(error);
  }
};
