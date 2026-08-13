import { Router } from 'express';
import {
  getProducts,
  getProductById,
  getProductByBarcode,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController';
import { validateRequest } from '../middleware/validate';
import {
  createProductSchema,
  updateProductSchema,
  getProductByIdSchema,
  getProductByBarcodeSchema,
  listProductsSchema,
} from '../validators/productValidator';
import { authenticateUser, requireAdmin } from '../middleware/auth';

const router = Router();

// Customer-accessible READ endpoints
router.get('/', validateRequest(listProductsSchema), getProducts);
router.get('/barcode/:barcode', validateRequest(getProductByBarcodeSchema), getProductByBarcode);
router.get('/:id', validateRequest(getProductByIdSchema), getProductById);

// Admin-only WRITE endpoints (Create, Update, Delete)
router.post('/', authenticateUser, requireAdmin, validateRequest(createProductSchema), createProduct);
router.put('/:id', authenticateUser, requireAdmin, validateRequest(updateProductSchema), updateProduct);
router.delete('/:id', authenticateUser, requireAdmin, validateRequest(getProductByIdSchema), deleteProduct);

export default router;
