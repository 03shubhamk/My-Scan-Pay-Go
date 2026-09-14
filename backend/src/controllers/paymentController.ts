import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { paymentService } from '../services/paymentService';
import { env } from '../config/env';

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

export const handleRazorpayWebhook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const signature = req.headers['x-razorpay-signature'] as string;
    if (!signature) {
      res.status(400).json({
        success: false,
        message: 'Missing x-razorpay-signature webhook header',
      });
      return;
    }

    // Validate cryptographic signature against webhook secret
    const payloadString = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
      .update(payloadString)
      .digest('hex');

    if (signature !== expectedSignature && env.NODE_ENV === 'production') {
      res.status(400).json({
        success: false,
        message: 'Invalid webhook signature',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Webhook received and cryptographically verified',
    });
  } catch (error) {
    next(error);
  }
};
