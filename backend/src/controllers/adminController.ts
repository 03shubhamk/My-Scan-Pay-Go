import { Request, Response, NextFunction } from 'express';
import { adminService } from '../services/adminService';

export const getDashboardStats = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stats = await adminService.getDashboardStats();
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

export const getDashboardAnalytics = getDashboardStats;

export const getInventoryLogs = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    res.status(200).json({
      success: true,
      message: 'Admin inventory logs',
      data: [],
    });
  } catch (error) {
    next(error);
  }
};
