import { exitRepository, ExitVerificationResult, ExitLogItem } from '../repositories/exitRepository';

export class ExitService {
  /**
   * Verify an exit QR token and atomically mark the order as EXIT_VERIFIED
   */
  async verifyExitToken(token: string, verifierNode?: string): Promise<ExitVerificationResult> {
    if (!token || typeof token !== 'string' || token.trim().length === 0) {
      const err = new Error('Exit verification token is required') as any;
      err.statusCode = 400;
      throw err;
    }

    return await exitRepository.verifyExitToken(token.trim(), verifierNode);
  }

  /**
   * Fetch recent turnstile verification logs for staff audit
   */
  async getExitLogs(limit: number = 20): Promise<ExitLogItem[]> {
    return await exitRepository.getExitLogs(limit);
  }

  /**
   * Get exit verification status for a specific order (for customer app polling/display)
   */
  async getExitStatusByOrderId(orderId: string): Promise<{
    orderId: string;
    exitStatus: string;
    verifiedAt?: Date;
    token: string;
  } | null> {
    if (!orderId) {
      const err = new Error('Order ID is required') as any;
      err.statusCode = 400;
      throw err;
    }

    return await exitRepository.getExitStatusByOrderId(orderId);
  }
}

export const exitService = new ExitService();
