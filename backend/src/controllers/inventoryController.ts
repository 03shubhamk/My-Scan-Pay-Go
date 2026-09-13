import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { inventoryService } from '../services/inventoryService';

export const getInventoryList = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search, category, status, page, limit } = req.query;

    const result = await inventoryService.listInventory({
      search: search as string,
      category: category as string,
      status: status as any,
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 50,
    });

    res.status(200).json({
      success: true,
      message: 'Inventory list retrieved successfully',
      data: result.items,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getInventoryStats = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const stats = await inventoryService.getInventoryStats();
    res.status(200).json({
      success: true,
      message: 'Inventory statistics retrieved successfully',
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

export const getProductInventory = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { productId } = req.params;
    const item = await inventoryService.getProductInventory(productId);
    res.status(200).json({
      success: true,
      message: 'Product inventory retrieved successfully',
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

export const updateInventoryStock = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { productId } = req.params;
    const { quantity, lowStockThreshold } = req.body;

    const updated = await inventoryService.updateStock(productId, {
      quantity: quantity !== undefined ? Number(quantity) : undefined,
      lowStockThreshold: lowStockThreshold !== undefined ? Number(lowStockThreshold) : undefined,
    });

    res.status(200).json({
      success: true,
      message: 'Inventory updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const restockProduct = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    const updated = await inventoryService.restockProduct(productId, Number(quantity));

    res.status(200).json({
      success: true,
      message: `Successfully restocked ${quantity} units`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};
