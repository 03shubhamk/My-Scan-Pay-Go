import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Product name is required' }).min(2, 'Name must be at least 2 characters'),
    description: z.string().optional(),
    barcode: z.string({ required_error: 'Barcode is required' }).min(3, 'Barcode must be at least 3 characters'),
    category: z.string({ required_error: 'Category is required' }).min(2, 'Category is required'),
    price: z.number({ required_error: 'Price is required' }).min(0, 'Price must be greater than or equal to 0'),
    imageUrl: z.string().url('Invalid image URL format').optional().or(z.literal('')),
    stockQuantity: z.number({ required_error: 'Stock quantity is required' }).int('Stock must be an integer').min(0, 'Stock cannot be negative'),
    lowStockThreshold: z.number().int().min(0).optional().default(10),
  }),
});

export const updateProductSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Invalid product ID format'),
  }),
  body: z.object({
    name: z.string().min(2).optional(),
    description: z.string().optional(),
    barcode: z.string().min(3).optional(),
    category: z.string().min(2).optional(),
    price: z.number().min(0).optional(),
    imageUrl: z.string().url().optional().or(z.literal('')),
    stockQuantity: z.number().int().min(0).optional(),
    lowStockThreshold: z.number().int().min(0).optional(),
  }),
});

export const getProductByIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Invalid product ID format'),
  }),
});

export const getProductByBarcodeSchema = z.object({
  params: z.object({
    barcode: z.string({ required_error: 'Barcode parameter is required' }),
  }),
});

export const listProductsSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    category: z.string().optional(),
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
  }),
});
