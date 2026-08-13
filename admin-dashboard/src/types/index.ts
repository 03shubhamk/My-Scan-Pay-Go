export type UserRole = 'customer' | 'admin' | 'verifier';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
}

export interface Product {
  id: string;
  barcode: string;
  name: string;
  price: number;
  discountedPrice?: number;
  stockQuantity: number;
  unit: string;
  isActive: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  finalAmount: number;
  status: 'pending' | 'paid' | 'verified' | 'cancelled';
  createdAt: string;
}
