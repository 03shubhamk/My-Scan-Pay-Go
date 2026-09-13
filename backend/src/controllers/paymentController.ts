import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { paymentService } from '../services/paymentService';

export const verifyPayment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      res.status(400).json({
        success: false,
        message: 'Missing required payment verification parameters: orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature',
      });
      return;
    }

    const result = await paymentService.verifyPayment(userId, {
      orderId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    res.status(200).json({
      success: true,
      message: 'Payment verified and captured successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const reportPaymentFailure = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { orderId, razorpayPaymentId, reason } = req.body;
    if (!orderId) {
      res.status(400).json({ success: false, message: 'orderId is required' });
      return;
    }

    const result = await paymentService.recordFailure(userId, orderId, razorpayPaymentId, reason);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

export const handleRazorpayWebhook = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.status(200).json({
      success: true,
      message: 'Webhook received successfully',
    });
  } catch (error) {
    next(error);
  }
};
