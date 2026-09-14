import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { env } from '../config/env';

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = (err as any).statusCode || (err as any).status || (err instanceof AppError ? err.statusCode : 500);
  const rawMessage = err.message || 'Internal Server Error';

  // Sanitize internal server error details in production to prevent information disclosure
  const safeMessage =
    env.NODE_ENV === 'production' && statusCode === 500
      ? 'An unexpected server error occurred. Please try again later.'
      : rawMessage;

  if (env.NODE_ENV !== 'test') {
    console.error(`[Global Error Handler] Status ${statusCode}: ${rawMessage}`, err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message: safeMessage,
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
