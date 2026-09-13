import { Request, Response, NextFunction } from 'express';
import { exitService } from '../services/exitService';

export const verifyExitToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.body.token || req.body.qrToken || req.body.verificationToken;
    const verifierNode = req.body.verifierNode || 'Gate Terminal #01';

    if (!token) {
      res.status(400).json({
        success: false,
        message: 'Exit verification token is required',
      });
      return;
    }

    const verificationResult = await exitService.verifyExitToken(token, verifierNode);

    res.status(200).json({
      success: true,
      message: 'Exit token verified successfully. Gate unlocked.',
      data: verificationResult,
    });
  } catch (error) {
    next(error);
  }
};

export const getExitLogs = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
    const logs = await exitService.getExitLogs(limit);

    res.status(200).json({
      success: true,
      data: logs,
    });
  } catch (error) {
    next(error);
  }
};

export const getExitStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { orderId } = req.params;
    const status = await exitService.getExitStatusByOrderId(orderId);

    if (!status) {
      res.status(404).json({
        success: false,
        message: 'Exit verification token not found for this order',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: status,
    });
  } catch (error) {
    next(error);
  }
};
