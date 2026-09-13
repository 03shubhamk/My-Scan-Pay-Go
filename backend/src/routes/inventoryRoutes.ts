import { Router } from 'express';
import {
  getInventoryList,
  getInventoryStats,
  getProductInventory,
  updateInventoryStock,
  restockProduct,
} from '../controllers/inventoryController';
import { authenticateUser, requireAdmin } from '../middleware/auth';

const router = Router();

// All inventory management endpoints are secured with admin authorization
router.use(authenticateUser, requireAdmin);

router.get('/', getInventoryList);
router.get('/stats', getInventoryStats);
router.get('/:productId', getProductInventory);
router.put('/:productId', updateInventoryStock);
router.patch('/:productId', updateInventoryStock);
router.post('/:productId/restock', restockProduct);

export default router;
