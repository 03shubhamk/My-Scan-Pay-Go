import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { orderService } from '../services/orderService';
import { paymentService } from '../services/paymentService';
import { productRepository } from '../repositories/productRepository';

export const validateCart = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { items } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ success: false, message: 'Cart items cannot be empty' });
      return;
    }

    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = await productRepository.findById(item.productId);
      if (!product) {
        res.status(404).json({ success: false, message: `Product not found: ${item.productId}` });
        return;
      }

      if (product.stock_quantity < item.quantity) {
        res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Available: ${product.stock_quantity}`,
        });
        return;
      }

      const itemPrice = Number(product.price);
      const itemSubtotal = Math.round(itemPrice * item.quantity * 100) / 100;
      subtotal += itemSubtotal;

      validatedItems.push({
        productId: product.id,
        name: product.name,
        price: itemPrice,
        quantity: item.quantity,
        subtotal: itemSubtotal,
        imageUrl: product.image_url,
      });
    }

    const estimatedTax = Math.round(subtotal * 0.05 * 100) / 100; // 5% GST
    const grandTotal = Math.round((subtotal + estimatedTax) * 100) / 100;

    res.status(200).json({
      success: true,
      message: 'Cart validated successfully with authoritative DB pricing',
      data: {
        items: validatedItems,
        subtotalAmount: subtotal,
        estimatedTax,
        grandTotal,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createPaymentOrder = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    let orderId = req.body.orderId;

    // If orderId is not provided but items are provided, create the order first
    if (!orderId && req.body.items && Array.isArray(req.body.items)) {
      const newOrder = await orderService.createOrder(userId, { items: req.body.items });
      orderId = newOrder.id;
    }

    if (!orderId) {
      res.status(400).json({ success: false, message: 'orderId or items array is required' });
      return;
    }

    const paymentOrder = await paymentService.createPaymentOrder(userId, orderId);

    res.status(200).json({
      success: true,
      message: 'Payment order created successfully',
      data: paymentOrder,
    });
  } catch (error) {
    next(error);
  }
};
