import { apiClient } from './apiClient';

export interface InventoryItem {
  id: string;
  product_id: string;
  product_name: string;
  product_barcode: string;
  product_category: string;
  product_price: number;
  product_image_url?: string;
  quantity: number;
  low_stock_threshold: number;
  stock_status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  updated_at: string;
}

export interface InventoryStats {
  totalProducts: number;
  inStockCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalUnitsInStock: number;
}

export const inventoryService = {
  async getInventory(params?: {
    search?: string;
    category?: string;
    status?: 'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
    page?: number;
    limit?: number;
  }): Promise<{ items: InventoryItem[]; total: number }> {
    const res = await apiClient.get('/inventory', { params });
    return {
      items: res.data.data || [],
      total: res.data.pagination?.total || (res.data.data || []).length,
    };
  },

  async getInventoryStats(): Promise<InventoryStats> {
    const res = await apiClient.get('/inventory/stats');
    return res.data.data;
  },

  async updateStock(
    productId: string,
    data: { quantity?: number; lowStockThreshold?: number }
  ): Promise<InventoryItem> {
    const res = await apiClient.put(`/inventory/${productId}`, data);
    return res.data.data;
  },

  async restockProduct(productId: string, quantity: number): Promise<InventoryItem> {
    const res = await apiClient.post(`/inventory/${productId}/restock`, { quantity });
    return res.data.data;
  },
};
