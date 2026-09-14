import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { env } from '../config/env';

export interface NewOrderEventPayload {
  orderId: string;
  orderNumber?: string;
  userId: string;
  customerName?: string;
  customerEmail?: string;
  totalAmount: number;
  itemsCount: number;
  timestamp: string;
}

export interface PaymentCompletedEventPayload {
  orderId: string;
  orderNumber?: string;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  amount: number;
  customerName?: string;
  timestamp: string;
}

export interface LowInventoryEventPayload {
  productId: string;
  productName: string;
  barcode: string;
  category?: string;
  stockQuantity: number;
  lowStockThreshold: number;
  timestamp: string;
}

export interface ExitVerifiedEventPayload {
  orderId: string;
  orderNumber?: string;
  customerName?: string;
  verifierNode?: string;
  verifiedAt: string;
  timestamp: string;
}

let ioInstance: Server | null = null;

/**
 * Initialize Socket.IO server with CORS and error handling
 */
export const initSocketServer = (httpServer: HttpServer): Server => {
  const allowedOrigins = env.CORS_ORIGIN === '*'
    ? '*'
    : env.CORS_ORIGIN.split(',').map((o) => o.trim());

  ioInstance = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingInterval: 10000,
    pingTimeout: 5000,
  });

  ioInstance.on('connection', (socket: Socket) => {
    // Client connected
    socket.emit('connection:ack', {
      status: 'connected',
      socketId: socket.id,
      serverTime: new Date().toISOString(),
    });

    // Support joining admin room
    socket.on('join:admin', () => {
      socket.join('admin_channel');
    });

    socket.on('disconnect', () => {
      // Clean disconnect
    });
  });

  return ioInstance;
};

/**
 * Getter for current Socket.IO instance
 */
export const getSocketServer = (): Server | null => {
  return ioInstance;
};

/**
 * Set or reset the socket instance (useful for testing)
 */
export const setSocketServer = (server: Server | null): void => {
  ioInstance = server;
};

/**
 * 1. Safe Dispatch: New Order Placed
 */
export const emitNewOrder = (payload: NewOrderEventPayload): void => {
  try {
    if (ioInstance) {
      ioInstance.emit('admin:new_order', payload);
    }
  } catch (err) {
    // Non-blocking catch to ensure REST API flow is never interrupted
    console.error('[Socket.IO] Error emitting admin:new_order event:', err);
  }
};

/**
 * 2. Safe Dispatch: Payment Completed
 */
export const emitPaymentCompleted = (payload: PaymentCompletedEventPayload): void => {
  try {
    if (ioInstance) {
      ioInstance.emit('admin:payment_completed', payload);
    }
  } catch (err) {
    console.error('[Socket.IO] Error emitting admin:payment_completed event:', err);
  }
};

/**
 * 3. Safe Dispatch: Low Inventory Alert
 */
export const emitLowInventory = (payload: LowInventoryEventPayload): void => {
  try {
    if (ioInstance) {
      ioInstance.emit('admin:low_inventory', payload);
    }
  } catch (err) {
    console.error('[Socket.IO] Error emitting admin:low_inventory event:', err);
  }
};

/**
 * 4. Safe Dispatch: Exit Turnstile Clearance
 */
export const emitExitVerified = (payload: ExitVerifiedEventPayload): void => {
  try {
    if (ioInstance) {
      ioInstance.emit('admin:exit_verified', payload);
    }
  } catch (err) {
    console.error('[Socket.IO] Error emitting admin:exit_verified event:', err);
  }
};
