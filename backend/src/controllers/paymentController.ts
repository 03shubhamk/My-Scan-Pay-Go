import { Request, Response, NextFunction } from 'express';

export const verifyPayment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.status(200).json({ success: true, message: 'Verify payment signature endpoint stub' });
  } catch (error) {
    next(error);
  }
};

export const handleRazorpayWebhook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.status(200).json({ success: true, message: 'Razorpay webhook listener stub' });
  } catch (error) {
    next(error);
  }
};
