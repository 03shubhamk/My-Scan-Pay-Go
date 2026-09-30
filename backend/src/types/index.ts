import { Request } from 'express';

export type UserRole = 'CUSTOMER' | 'ADMIN';

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  barcode: string;
  category: string;
  price: number;
  image_url?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Inventory {
  id: string;
  product_id: string;
  quantity: number;
  low_stock_threshold: number;
  updated_at: Date;
}

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'EXIT_VERIFIED';
  payment_status: 'UNPAID' | 'PAID' | 'FAILED' | 'REFUNDED';
  created_at: Date;
  updated_at: Date;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_at_purchase: number;
  subtotal: number;
}

export interface Payment {
  id: string;
  order_id: string;
  razorpay_order_id: string;
  razorpay_payment_id?: string;
  amount: number;
  status: 'CREATED' | 'AUTHORIZED' | 'CAPTURED' | 'FAILED' | 'REFUNDED';
  created_at: Date;
}

export interface ExitVerification {
  id: string;
  order_id: string;
  verification_token: string;
  status: 'PENDING' | 'VERIFIED' | 'FAILED' | 'EXPIRED';
  verified_at?: Date;
  created_at: Date;
}

export interface RazorpayWebhookEvent {
  entity: string;
  account_id: string;
  event: string;
  contains: string[];
  payload: {
    payment?: {
      entity: {
        id: string;
        order_id: string;
        amount: number;
        currency: string;
        status: string;
      };
    };
    order?: {
      entity: {
        id: string;
        amount: number;
        status: string;
      };
    };
  };
  created_at: number;
}

export interface SystemNotification {
  id: string;
  type: 'NEW_ORDER' | 'PAYMENT_COMPLETED' | 'LOW_INVENTORY' | 'EXIT_VERIFIED';
  title: string;
  message: string;
  data?: Record<string, any>;
  timestamp: string;
  read: boolean;
}

