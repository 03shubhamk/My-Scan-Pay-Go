import crypto from 'crypto';
import Razorpay from 'razorpay';
import { env } from '../config/env';
import { orderRepository, OrderWithItems } from '../repositories/orderRepository';
import { paymentRepository } from '../repositories/paymentRepository';
import { userRepository } from '../repositories/userRepository';
import { productRepository } from '../repositories/productRepository';
import { emitPaymentCompleted, emitLowInventory } from '../socket/socketServer';
import { Payment, ExitVerification } from '../types';

export interface RazorpayOrderResponse {
  orderId: string;
  razorpayOrderId: string;
  amount: number;
  amountInPaise: number;
  currency: string;
  keyId: string;
  customer: {
    name: string;
    email: string;
  };
}

export interface VerifyPaymentInput {
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface PaymentVerificationResult {
  orderId: string;
  paymentStatus: string;
  razorpayPaymentId: string;
  exitQrToken: string;
  order: OrderWithItems;
  payment: Payment;
}

export class PaymentService {
  private razorpayClient: Razorpay | null = null;

  constructor() {
    try {
      if (env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET) {
        this.razorpayClient = new Razorpay({
          key_id: env.RAZORPAY_KEY_ID,
          key_secret: env.RAZORPAY_KEY_SECRET,
        });
      }
    } catch {
      this.razorpayClient = null;
    }
  }

  /**
   * 1. Create Razorpay Payment Order
   * Authoritatively fetches order from DB, generates gateway order, and saves payment record.
   * NEVER returns Razorpay Secret to client.
   */
  async createPaymentOrder(userId: string, orderId: string): Promise<RazorpayOrderResponse> {
    // 1. Fetch and validate order ownership
    const order = await orderRepository.findById(orderId, userId);
    if (!order) {
      const err = new Error(`Order not found or access denied for ID: ${orderId}`) as any;
      err.statusCode = 404;
      throw err;
    }

    // 2. Prevent payment if order is already paid
    if (order.payment_status === 'PAID') {
      const err = new Error(`Order ${orderId} has already been paid`) as any;
      err.statusCode = 400;
      throw err;
    }

    const user = await userRepository.findById(userId);
    const customerName = user ? user.name : 'Customer';
    const customerEmail = user ? user.email : 'customer@scanpaygo.com';

    const amountInPaise = Math.round(order.total_amount * 100);
    let razorpayOrderId: string;

    // Check if an existing payment order is already active
    const existingPayment = await paymentRepository.findByOrderId(orderId);
    if (existingPayment && existingPayment.status === 'CREATED' && existingPayment.razorpay_order_id) {
      razorpayOrderId = existingPayment.razorpay_order_id;
    } else {
      const isTestOrMockKey =
        process.env.NODE_ENV === 'test' ||
        !env.RAZORPAY_KEY_ID ||
        env.RAZORPAY_KEY_ID.includes('YourKeyIdHere') ||
        env.RAZORPAY_KEY_ID.includes('mock') ||
        env.RAZORPAY_KEY_SECRET.includes('YourRazorpaySecretHere');

      // Create new Razorpay order via SDK or simulated mock
      if (this.razorpayClient && !isTestOrMockKey) {
        try {
          const rzpOrder = await this.razorpayClient.orders.create({
            amount: amountInPaise,
            currency: 'INR',
            receipt: order.id,
            notes: {
              orderId: order.id,
              userId: userId,
              orderNumber: order.order_number || '',
            },
          });
          razorpayOrderId = rzpOrder.id;
        } catch (gatewayErr: any) {
          razorpayOrderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        }
      } else {
        razorpayOrderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      }

      await paymentRepository.createPayment({
        orderId: order.id,
        razorpayOrderId,
        amount: order.total_amount,
        status: 'CREATED',
      });
    }

    return {
      orderId: order.id,
      razorpayOrderId,
      amount: order.total_amount,
      amountInPaise,
      currency: 'INR',
      keyId: env.RAZORPAY_KEY_ID, // Only public key is shared
      customer: {
        name: customerName,
        email: customerEmail,
      },
    };
  }

  /**
   * 2. Server-side Cryptographic Signature Verification
   * Verifies Razorpay HMAC-SHA256 signature, updates payment and order status,
   * atomically decrements inventory, and generates Exit QR verification token.
   */
  async verifyPayment(
    userId: string,
    input: VerifyPaymentInput
  ): Promise<PaymentVerificationResult> {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = input;

    if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      const err = new Error(
        'Missing required payment verification parameters (orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature)'
      ) as any;
      err.statusCode = 400;
      throw err;
    }

    // 1. Fetch order directly from DB
    const order = await orderRepository.findById(orderId, userId);
    if (!order) {
      const err = new Error(`Order not found with ID: ${orderId}`) as any;
      err.statusCode = 404;
      throw err;
    }

    // 2. Idempotency handling: If order is ALREADY PAID, return successful result without re-executing
    if (order.payment_status === 'PAID') {
      const existingPayment = (await paymentRepository.findByOrderId(orderId)) || {
        id: `pay-${orderId}`,
        order_id: orderId,
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: razorpayPaymentId,
        amount: order.total_amount,
        status: 'CAPTURED' as const,
        created_at: order.updated_at,
      };

      const existingExit = await paymentRepository.getExitVerification(orderId);
      const exitToken = existingExit
        ? existingExit.verification_token
        : this.generateExitToken(orderId, userId);

      return {
        orderId: order.id,
        paymentStatus: 'PAID',
        razorpayPaymentId,
        exitQrToken: exitToken,
        order,
        payment: existingPayment,
      };
    }

    // 3. Cryptographic Signature Validation
    const expectedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      // Record failed payment attempt
      await paymentRepository.recordPaymentFailure(orderId, razorpayPaymentId);
      const err = new Error('Invalid payment signature verification failed') as any;
      err.statusCode = 400;
      throw err;
    }

    // 4. Generate Cryptographic Exit QR Token
    const exitVerificationToken = this.generateExitToken(orderId, userId);

    // 5. Atomically capture payment, mark order as PAID, deduct inventory, and save exit verification
    const { order: updatedOrder, payment: capturedPayment, exitVerification } =
      await paymentRepository.verifyAndCaptureOrder(
        orderId,
        razorpayPaymentId,
        exitVerificationToken
      );

    // 6. Safe Real-Time Socket.IO Notification (Non-blocking)
    try {
      const user = await userRepository.findById(userId);
      emitPaymentCompleted({
        orderId: updatedOrder.id,
        orderNumber: updatedOrder.order_number,
        razorpayPaymentId,
        razorpayOrderId,
        amount: updatedOrder.total_amount,
        customerName: user ? user.name : 'Customer',
        timestamp: new Date().toISOString(),
      });

      // 7. Check if purchased items triggered low inventory thresholds
      if (updatedOrder.items && updatedOrder.items.length > 0) {
        for (const item of updatedOrder.items) {
          const prod = await productRepository.findById(item.product_id);
          if (prod && prod.stock_quantity <= prod.low_stock_threshold) {
            emitLowInventory({
              productId: prod.id,
              productName: prod.name,
              barcode: prod.barcode,
              category: prod.category,
              stockQuantity: prod.stock_quantity,
              lowStockThreshold: prod.low_stock_threshold,
              timestamp: new Date().toISOString(),
            });
          }
        }
      }
    } catch (socketErr) {
      console.error('[PaymentService] Error dispatching payment/inventory socket events:', socketErr);
    }

    return {
      orderId: updatedOrder.id,
      paymentStatus: 'PAID',
      razorpayPaymentId,
      exitQrToken: exitVerification.verification_token,
      order: updatedOrder,
      payment: capturedPayment,
    };
  }

  /**
   * 3. Record Payment Failure
   */
  async recordFailure(
    userId: string,
    orderId: string,
    razorpayPaymentId?: string,
    reason?: string
  ): Promise<{ success: boolean; message: string }> {
    const order = await orderRepository.findById(orderId, userId);
    if (!order) {
      const err = new Error(`Order not found with ID: ${orderId}`) as any;
      err.statusCode = 404;
      throw err;
    }

    await paymentRepository.recordPaymentFailure(orderId, razorpayPaymentId);
    return {
      success: true,
      message: reason || 'Payment failure recorded',
    };
  }

  /**
   * Helper: Generates HMAC signed Exit Verification Token
   */
  private generateExitToken(orderId: string, userId: string): string {
    const payload = `${orderId}:${userId}:${Date.now()}`;
    const hmac = crypto.createHmac('sha256', env.EXIT_QR_SECRET).update(payload).digest('hex');
    return `SPG-EXIT-${orderId.substring(0, 8).toUpperCase()}-${hmac.substring(0, 32)}`;
  }
}

export const paymentService = new PaymentService();
