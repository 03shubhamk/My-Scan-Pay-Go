import { Request, Response, NextFunction } from 'express';

export const scanExitQr = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.status(200).json({ success: true, message: 'Scan and decrypt exit QR token endpoint stub' });
  } catch (error) {
    next(error);
  }
};

export const confirmExitVerification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.status(200).json({ success: true, message: 'Confirm exit verification endpoint stub' });
  } catch (error) {
    next(error);
  }
};
