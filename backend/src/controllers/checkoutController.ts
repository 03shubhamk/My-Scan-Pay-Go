import { Request, Response, NextFunction } from 'express';

export const validateCart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.status(200).json({ success: true, message: 'Validate cart endpoint stub' });
  } catch (error) {
    next(error);
  }
};

export const createPaymentOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.status(200).json({ success: true, message: 'Create payment order endpoint stub' });
  } catch (error) {
    next(error);
  }
};
