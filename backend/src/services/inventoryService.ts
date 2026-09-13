import { inventoryRepository, InventoryItem, InventoryStats } from '../repositories/inventoryRepository';
import { productRepository } from '../repositories/productRepository';

export class InventoryService {
  async listInventory(options: {
    search?: string;
    category?: string;
    status?: 'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
    page?: number;
    limit?: number;
  }): Promise<{ items: InventoryItem[]; total: number; page: number; limit: number }> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.max(1, Math.min(100, options.limit || 50));

    const { items, total } = await inventoryRepository.findAll({
      search: options.search,
      category: options.category,
      status: options.status,
      page,
      limit,
    });

    return { items, total, page, limit };
  }

  async getInventoryStats(): Promise<InventoryStats> {
    return await inventoryRepository.getInventoryStats();
  }

  async getProductInventory(productId: string): Promise<InventoryItem> {
    const item = await inventoryRepository.findByProductId(productId);
    if (!item) {
      const err = new Error(`Inventory record not found for product ID: ${productId}`) as any;
      err.statusCode = 404;
      throw err;
    }
    return item;
  }

  async updateStock(
    productId: string,
    data: { quantity?: number; lowStockThreshold?: number }
  ): Promise<InventoryItem> {
    // Validate product existence
    const product = await productRepository.findById(productId);
    if (!product) {
      const err = new Error(`Product not found with ID: ${productId}`) as any;
      err.statusCode = 404;
      throw err;
    }

    if (data.quantity !== undefined && data.quantity < 0) {
      const err = new Error('Stock quantity cannot be negative') as any;
      err.statusCode = 400;
      throw err;
    }

    if (data.lowStockThreshold !== undefined && data.lowStockThreshold < 0) {
      const err = new Error('Low stock threshold cannot be negative') as any;
      err.statusCode = 400;
      throw err;
    }

    return await inventoryRepository.updateStock(productId, data);
  }

  async restockProduct(productId: string, quantityToAdd: number): Promise<InventoryItem> {
    const product = await productRepository.findById(productId);
    if (!product) {
      const err = new Error(`Product not found with ID: ${productId}`) as any;
      err.statusCode = 404;
      throw err;
    }

    if (!quantityToAdd || quantityToAdd <= 0) {
      const err = new Error('Restock quantity must be greater than 0') as any;
      err.statusCode = 400;
      throw err;
    }

    return await inventoryRepository.restock(productId, quantityToAdd);
  }
}

export const inventoryService = new InventoryService();
