import { productRepository } from '../repositories/productRepository';
import { orderRepository, OrderWithItems } from '../repositories/orderRepository';
import { createOrderSchema, CreateOrderInput } from '../validators/orderValidator';

export class OrderService {
  async createOrder(userId: string, input: CreateOrderInput): Promise<OrderWithItems> {
    // 1. Validate request body schema
    const validationResult = createOrderSchema.safeParse(input);
    if (!validationResult.success) {
      const errorMessage = validationResult.error.errors.map((e) => e.message).join(', ');
      const err = new Error(errorMessage) as any;
      err.statusCode = 400;
      throw err;
    }

    const { items } = validationResult.data;

    // 2. Fetch current products & prices directly from DB repository (Zero-Trust rule)
    const calculatedItems = [];
    let grandTotal = 0;

    for (const item of items) {
      const product = await productRepository.findById(item.productId);
      if (!product) {
        const err = new Error(`Product not found with ID: ${item.productId}`) as any;
        err.statusCode = 404;
        throw err;
      }

      // 3. Stock availability validation
      if (product.stock_quantity < item.quantity) {
        const err = new Error(
          `Insufficient stock for "${product.name}". Requested: ${item.quantity}, Available: ${product.stock_quantity}`
        ) as any;
        err.statusCode = 400;
        throw err;
      }

      // 4. Calculate backend subtotal per item
      const dbPrice = Number(product.price);
      const itemSubtotal = Math.round(dbPrice * item.quantity * 100) / 100;
      grandTotal += itemSubtotal;

      calculatedItems.push({
        productId: product.id,
        quantity: item.quantity,
        priceAtPurchase: dbPrice,
        subtotal: itemSubtotal,
        productName: product.name,
        productBarcode: product.barcode,
        productImageUrl: product.image_url,
      });
    }

    const finalTotalAmount = Math.round(grandTotal * 100) / 100;

    // 5. Create order and order_items in DB
    const createdOrder = await orderRepository.createOrder({
      userId,
      totalAmount: finalTotalAmount,
      items: calculatedItems,
    });

    return createdOrder;
  }

  async getUserOrders(userId: string): Promise<OrderWithItems[]> {
    return await orderRepository.findByUserId(userId);
  }

  async getOrderById(orderId: string, userId: string): Promise<OrderWithItems> {
    const order = await orderRepository.findById(orderId, userId);
    if (!order) {
      const err = new Error(`Order not found with ID: ${orderId}`) as any;
      err.statusCode = 404;
      throw err;
    }
    return order;
  }
}

export const orderService = new OrderService();
