import { productRepository } from '../repositories/productRepository';
import { AppError } from '../utils/AppError';

export class ProductService {
  async getProductByBarcode(barcode: string) {
    const product = await productRepository.findByBarcode(barcode);
    if (!product) {
      throw new AppError(`Product not found with barcode '${barcode}'`, 404);
    }
    return product;
  }

  async getProductById(id: string) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new AppError('Product not found', 404);
    }
    return product;
  }

  async listProducts(options: { search?: string; category?: string; page: number; limit: number }) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 10));

    const { products, total } = await productRepository.findAll({
      search: options.search,
      category: options.category,
      page,
      limit,
    });

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async createProduct(data: {
    name: string;
    description?: string;
    barcode: string;
    category: string;
    price: number;
    imageUrl?: string;
    stockQuantity: number;
    lowStockThreshold?: number;
  }) {
    if (data.price < 0) {
      throw new AppError('Price cannot be negative', 400);
    }
    if (data.stockQuantity < 0) {
      throw new AppError('Stock quantity cannot be negative', 400);
    }

    // Check for duplicate barcode
    const existing = await productRepository.findByBarcode(data.barcode);
    if (existing) {
      throw new AppError(`Product with barcode '${data.barcode}' already exists`, 400);
    }

    return await productRepository.createProduct(data);
  }

  async updateProduct(
    id: string,
    data: Partial<{
      name: string;
      description?: string;
      barcode: string;
      category: string;
      price: number;
      imageUrl?: string;
      stockQuantity: number;
      lowStockThreshold?: number;
    }>
  ) {
    const existing = await productRepository.findById(id);
    if (!existing) {
      throw new AppError('Product not found', 404);
    }

    if (data.price !== undefined && data.price < 0) {
      throw new AppError('Price cannot be negative', 400);
    }
    if (data.stockQuantity !== undefined && data.stockQuantity < 0) {
      throw new AppError('Stock quantity cannot be negative', 400);
    }

    // If changing barcode, check duplicate
    if (data.barcode && data.barcode !== existing.barcode) {
      const barcodeCheck = await productRepository.findByBarcode(data.barcode);
      if (barcodeCheck && barcodeCheck.id !== id) {
        throw new AppError(`Barcode '${data.barcode}' is already in use by another product`, 400);
      }
    }

    const updated = await productRepository.updateProduct(id, data);
    if (!updated) {
      throw new AppError('Failed to update product', 500);
    }
    return updated;
  }

  async deleteProduct(id: string) {
    const existing = await productRepository.findById(id);
    if (!existing) {
      throw new AppError('Product not found', 404);
    }

    const deleted = await productRepository.deleteProduct(id);
    if (!deleted) {
      throw new AppError('Failed to delete product', 500);
    }
    return { id, message: 'Product deleted successfully' };
  }
}

export const productService = new ProductService();
