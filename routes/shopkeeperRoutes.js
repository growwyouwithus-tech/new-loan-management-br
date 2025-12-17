import express from 'express';
import {
  createShopkeeper,
  getAllShopkeepers,
  getShopkeeperById,
  updateShopkeeper,
  deleteShopkeeper,
  updateShopkeeperKYC,
  getShopkeeperStatistics,
} from '../controllers/shopkeeperController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticate, authorize('shopkeeper', 'admin'), createShopkeeper);
router.get('/', authenticate, authorize('admin', 'verifier'), getAllShopkeepers);
router.get('/statistics', authenticate, authorize('admin'), getShopkeeperStatistics);
router.get('/:id', authenticate, getShopkeeperById);
router.put('/:id', authenticate, authorize('admin', 'shopkeeper'), updateShopkeeper);
router.delete('/:id', authenticate, authorize('admin'), deleteShopkeeper);
router.put('/:id/kyc', authenticate, authorize('admin', 'verifier'), updateShopkeeperKYC);

export default router;
