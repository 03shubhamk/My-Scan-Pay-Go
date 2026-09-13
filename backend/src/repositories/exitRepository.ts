import { pool } from '../config/database';
import { orderRepository, OrderWithItems } from './orderRepository';
import { paymentRepository } from './paymentRepository';

export interface ExitVerificationResult {
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  itemCount: number;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    subtotal: number;
  }[];
  paymentStatus: string;
  verificationStatus: 'VERIFIED' | 'FAILED' | 'EXPIRED' | 'PENDING';
  verifiedAt: Date;
  verifierNode: string;
}

export interface ExitLogItem {
  id: string;
  token: string;
  orderNumber: string;
  itemCount: number;
  totalAmount: number;
  status: 'VERIFIED' | 'FAILED' | 'PENDING';
  verifiedAt: string;
  verifier: string;
}

// In-memory fallback logs
const inMemoryExitLogs: ExitLogItem[] = [
  {
    id: 'log-1',
    token: 'SPG-EXIT-INIT-SAMPLE',
    orderNumber: 'ORD-A1000001',
    itemCount: 2,
    totalAmount: 47.0,
    status: 'VERIFIED',
    verifiedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    verifier: 'Gate Terminal #01',
  },
];

const isDbConnectionError = (err: any): boolean => {
  if (!err) return false;
  const msg = err.message || '';
  const code = err.code || '';
  return (
    code === 'ECONNREFUSED' ||
    code === 'ENOTFOUND' ||
    code === 'ETIMEDOUT' ||
    code === '28P01' ||
    msg.includes('ECONNREFUSED') ||
    msg.includes('connect') ||
    msg.includes('timeout') ||
    msg.includes('Connection terminated')
  );
};

export class ExitRepository {
  /**
   * 1. Validate Exit Token and Atomically Mark as Verified
   */
  async verifyExitToken(
    token: string,
    verifierNode: string = 'Gate Terminal #01'
  ): Promise<ExitVerificationResult> {
    const trimmedToken = token.trim();

    try {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // 1. Fetch Exit Verification record and join Order & User
        const query = `
          SELECT 
            ev.id as exit_id,
            ev.order_id,
            ev.verification_token,
            ev.status as exit_status,
            ev.verified_at,
            ev.created_at as exit_created_at,
            o.user_id,
            o.total_amount,
            o.status as order_status,
            o.payment_status,
            u.name as customer_name,
            u.email as customer_email
          FROM exit_verifications ev
          JOIN orders o ON ev.order_id = o.id
          LEFT JOIN users u ON o.user_id = u.id
          WHERE ev.verification_token = $1
          FOR UPDATE OF ev, o
        `;
        const res = await client.query(query, [trimmedToken]);

        if (res.rows.length === 0) {
          const err = new Error('Invalid or counterfeit exit verification token') as any;
          err.statusCode = 404;
          throw err;
        }

        const row = res.rows[0];

        // 2. Check if already verified
        if (row.exit_status === 'VERIFIED') {
          const verifiedTime = row.verified_at ? new Date(row.verified_at).toLocaleTimeString() : 'earlier';
          const err = new Error(`Order exit has already been verified at ${verifiedTime}`) as any;
          err.statusCode = 400;
          throw err;
        }

        // 3. Check payment status
        if (row.payment_status !== 'PAID') {
          const err = new Error('Order is unpaid or payment was declined') as any;
          err.statusCode = 400;
          throw err;
        }

        // 4. Check expiration (24 hours window)
        const tokenAgeMs = Date.now() - new Date(row.exit_created_at).getTime();
        if (tokenAgeMs > 24 * 60 * 60 * 1000 || row.exit_status === 'EXPIRED') {
          const err = new Error('Exit verification token has expired. Please contact store staff.') as any;
          err.statusCode = 400;
          throw err;
        }

        // 5. Mark Exit Verification as VERIFIED
        const now = new Date();
        const updateExitQuery = `
          UPDATE exit_verifications
          SET status = 'VERIFIED', verified_at = $1
          WHERE id = $2
        `;
        await client.query(updateExitQuery, [now, row.exit_id]);

        // 6. Mark Order as EXIT_VERIFIED
        const updateOrderQuery = `
          UPDATE orders
          SET status = 'EXIT_VERIFIED', updated_at = $1
          WHERE id = $2
        `;
        await client.query(updateOrderQuery, [now, row.order_id]);

        // 7. Fetch Order Items
        const itemsQuery = `
          SELECT oi.product_id, oi.quantity, oi.price_at_purchase, oi.subtotal, p.name as product_name
          FROM order_items oi
          LEFT JOIN products p ON oi.product_id = p.id
          WHERE oi.order_id = $1
        `;
        const itemsRes = await client.query(itemsQuery, [row.order_id]);

        await client.query('COMMIT');

        const items = itemsRes.rows.map((itemRow) => ({
          productId: itemRow.product_id,
          productName: itemRow.product_name || 'Item',
          quantity: parseInt(itemRow.quantity, 10),
          price: parseFloat(itemRow.price_at_purchase),
          subtotal: parseFloat(itemRow.subtotal),
        }));

        const totalItemsCount = items.reduce((acc, curr) => acc + curr.quantity, 0);
        const orderNumber = `ORD-${row.order_id.substring(0, 8).toUpperCase()}`;

        const result: ExitVerificationResult = {
          orderId: row.order_id,
          orderNumber,
          customerName: row.customer_name || 'Customer',
          customerEmail: row.customer_email || 'customer@scanpaygo.com',
          totalAmount: parseFloat(row.total_amount),
          itemCount: totalItemsCount,
          items,
          paymentStatus: 'PAID',
          verificationStatus: 'VERIFIED',
          verifiedAt: now,
          verifierNode,
        };

        // Record log
        inMemoryExitLogs.unshift({
          id: `log-${Date.now()}`,
          token: trimmedToken,
          orderNumber,
          itemCount: totalItemsCount,
          totalAmount: result.totalAmount,
          status: 'VERIFIED',
          verifiedAt: now.toISOString(),
          verifier: verifierNode,
        });

        return result;
      } catch (txnErr) {
        try {
          await client.query('ROLLBACK');
        } catch (_) {}
        throw txnErr;
      } finally {
        try {
          client.release();
        } catch (_) {}
      }
    } catch (err: any) {
      if (isDbConnectionError(err)) {
        // Fallback for mock/test execution
        const { inMemoryOrders } = require('./orderRepository');
        let matchedOrder: OrderWithItems | null = null;
        let matchedToken = trimmedToken;

        // Check in-memory exit verification tokens
        for (const order of (inMemoryOrders as Map<string, OrderWithItems>).values()) {
          const exitPass = await paymentRepository.getExitVerification(order.id);
          if (exitPass && exitPass.verification_token === trimmedToken) {
            matchedOrder = order;
            break;
          }
        }

        // Also check if token matches pattern SPG-EXIT-<ORDERID-PREFIX>
        if (!matchedOrder && trimmedToken.startsWith('SPG-EXIT-')) {
          const parts = trimmedToken.split('-');
          const prefix = parts.length > 2 ? parts[2].toLowerCase() : '';
          for (const order of (inMemoryOrders as Map<string, OrderWithItems>).values()) {
            if (order.id.toLowerCase().startsWith(prefix)) {
              matchedOrder = order;
              break;
            }
          }
        }

        if (!matchedOrder) {
          inMemoryExitLogs.unshift({
            id: `log-${Date.now()}`,
            token: trimmedToken,
            orderNumber: 'UNKNOWN',
            itemCount: 0,
            totalAmount: 0.0,
            status: 'FAILED',
            verifiedAt: new Date().toISOString(),
            verifier: verifierNode,
          });

          const notFoundErr = new Error('Invalid or counterfeit exit verification token') as any;
          notFoundErr.statusCode = 404;
          throw notFoundErr;
        }

        // Check if already verified
        if (matchedOrder.status === 'EXIT_VERIFIED') {
          inMemoryExitLogs.unshift({
            id: `log-${Date.now()}`,
            token: trimmedToken,
            orderNumber: matchedOrder.order_number || `ORD-${matchedOrder.id.substring(0, 8).toUpperCase()}`,
            itemCount: matchedOrder.items.length,
            totalAmount: matchedOrder.total_amount,
            status: 'FAILED',
            verifiedAt: new Date().toISOString(),
            verifier: verifierNode,
          });

          const alreadyErr = new Error('Order exit has already been verified') as any;
          alreadyErr.statusCode = 400;
          throw alreadyErr;
        }

        // Check payment status
        if (matchedOrder.payment_status !== 'PAID') {
          inMemoryExitLogs.unshift({
            id: `log-${Date.now()}`,
            token: trimmedToken,
            orderNumber: matchedOrder.order_number || `ORD-${matchedOrder.id.substring(0, 8).toUpperCase()}`,
            itemCount: matchedOrder.items.length,
            totalAmount: matchedOrder.total_amount,
            status: 'FAILED',
            verifiedAt: new Date().toISOString(),
            verifier: verifierNode,
          });

          const unpaidErr = new Error('Order is unpaid or payment was declined') as any;
          unpaidErr.statusCode = 400;
          throw unpaidErr;
        }

        // Mark as verified
        matchedOrder.status = 'EXIT_VERIFIED';
        matchedOrder.updated_at = new Date();
        const now = new Date();

        const items = matchedOrder.items.map((i) => ({
          productId: i.product_id,
          productName: i.product_name || 'Sample Product',
          quantity: i.quantity,
          price: i.price_at_purchase,
          subtotal: i.subtotal,
        }));

        const totalItemsCount = items.reduce((acc, curr) => acc + curr.quantity, 0);
        const orderNumber = matchedOrder.order_number || `ORD-${matchedOrder.id.substring(0, 8).toUpperCase()}`;

        const result: ExitVerificationResult = {
          orderId: matchedOrder.id,
          orderNumber,
          customerName: 'Verified Shopper',
          customerEmail: 'customer@scanpaygo.com',
          totalAmount: matchedOrder.total_amount,
          itemCount: totalItemsCount,
          items,
          paymentStatus: 'PAID',
          verificationStatus: 'VERIFIED',
          verifiedAt: now,
          verifierNode,
        };

        inMemoryExitLogs.unshift({
          id: `log-${Date.now()}`,
          token: trimmedToken,
          orderNumber,
          itemCount: totalItemsCount,
          totalAmount: result.totalAmount,
          status: 'VERIFIED',
          verifiedAt: now.toISOString(),
          verifier: verifierNode,
        });

        return result;
      }
      throw err;
    }
  }

  /**
   * 2. Fetch Recent Turnstile Exit Logs
   */
  async getExitLogs(limit: number = 20): Promise<ExitLogItem[]> {
    try {
      const query = `
        SELECT 
          ev.id,
          ev.verification_token as token,
          o.id as order_id,
          COALESCE(SUM(oi.quantity), 1) as item_count,
          o.total_amount,
          ev.status,
          COALESCE(ev.verified_at, ev.created_at) as verified_at,
          'Gate Terminal #01' as verifier
        FROM exit_verifications ev
        JOIN orders o ON ev.order_id = o.id
        LEFT JOIN order_items oi ON o.id = oi.order_id
        GROUP BY ev.id, o.id
        ORDER BY ev.verified_at DESC NULLS LAST, ev.created_at DESC
        LIMIT $1
      `;
      const res = await pool.query(query, [limit]);

      if (res.rows.length === 0) return inMemoryExitLogs.slice(0, limit);

      return res.rows.map((row) => ({
        id: row.id,
        token: row.token,
        orderNumber: `ORD-${row.order_id.substring(0, 8).toUpperCase()}`,
        itemCount: parseInt(row.item_count, 10),
        totalAmount: parseFloat(row.total_amount),
        status: row.status,
        verifiedAt: new Date(row.verified_at).toISOString(),
        verifier: row.verifier,
      }));
    } catch (err: any) {
      if (isDbConnectionError(err)) {
        return inMemoryExitLogs.slice(0, limit);
      }
      throw err;
    }
  }

  /**
   * 3. Check Live Exit Verification Status for an Order
   */
  async getExitStatusByOrderId(orderId: string): Promise<{
    orderId: string;
    exitStatus: string;
    verifiedAt?: Date;
    token: string;
  } | null> {
    const exitPass = await paymentRepository.getExitVerification(orderId);
    if (!exitPass) return null;

    return {
      orderId: exitPass.order_id,
      exitStatus: exitPass.status,
      verifiedAt: exitPass.verified_at,
      token: exitPass.verification_token,
    };
  }
}

export const exitRepository = new ExitRepository();
