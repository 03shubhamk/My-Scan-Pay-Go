import { apiClient } from './apiClient';

export interface Product {
  id: string;
  name: string;
  description?: string;
  barcode: string;
  category: string;
  price: number;
  image_url?: string;
  stock_quantity: number;
  low_stock_threshold: number;
  created_at: string;
  updated_at: string;
}

export interface CreateProductPayload {
  name: string;
  description?: string;
  barcode: string;
  category: string;
  price: number;
  imageUrl?: string;
  stockQuantity: number;
  lowStockThreshold?: number;
}

export interface UpdateProductPayload {
  name?: string;
  description?: string;
  barcode?: string;
  category?: string;
  price?: number;
  imageUrl?: string;
  stockQuantity?: number;
  lowStockThreshold?: number;
}

export interface GetProductsParams {
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
}

export const productService = {
  getProducts: async (params: GetProductsParams = {}) => {
    const response = await apiClient.get('/products', { params });
    return response.data.data; // { products, pagination }
  },

  getProductById: async (id: string) => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data.data.product as Product;
  },

  getProductByBarcode: async (barcode: string) => {
    const response = await apiClient.get(`/products/barcode/${barcode}`);
    return response.data.data.product as Product;
  },

  createProduct: async (payload: CreateProductPayload) => {
    const response = await apiClient.post('/products', payload);
    return response.data.data.product as Product;
  },

  updateProduct: async (id: string, payload: UpdateProductPayload) => {
    const response = await apiClient.put(`/products/${id}`, payload);
    return response.data.data.product as Product;
  },

  deleteProduct: async (id: string) => {
    const response = await apiClient.delete(`/products/${id}`);
    return response.data;
  },
};
