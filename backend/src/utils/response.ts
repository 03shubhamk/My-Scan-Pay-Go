import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: any;
}

export const sendSuccess = <T>(res: Response, data: T, message?: string, statusCode = 200): Response => {
  return res.status(statusCode).json({
    success: true,
    ...(message && { message }),
    data,
  });
};

export const sendError = (res: Response, message: string, statusCode = 500, error?: any): Response => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(error && { error }),
  });
};
