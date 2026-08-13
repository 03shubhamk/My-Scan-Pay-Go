import { Request, Response, NextFunction } from 'express';
import { productService } from '../services/productService';

export const getProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search, category, page, limit } = req.query;

    const result = await productService.listProducts({
      search: search ? String(search) : undefined,
      category: category ? String(category) : undefined,
      page: page ? parseInt(String(page), 10) : 1,
      limit: limit ? parseInt(String(limit), 10) : 10,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await productService.getProductById(id);

    res.status(200).json({
      success: true,
      data: { product },
    });
  } catch (error) {
    next(error);
  }
};

export const getProductByBarcode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { barcode } = req.params;
    const product = await productService.getProductByBarcode(barcode);

    res.status(200).json({
      success: true,
      data: { product },
    });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const product = await productService.createProduct(req.body);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await productService.updateProduct(id, req.body);

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: { product },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await productService.deleteProduct(id);

    res.status(200).json({
      success: true,
      message: result.message,
      data: { id: result.id },
    });
  } catch (error) {
    next(error);
  }
};
