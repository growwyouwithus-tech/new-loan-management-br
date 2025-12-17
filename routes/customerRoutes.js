import express from 'express';
import {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  updateCustomerKYC,
} from '../controllers/customerController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticate, authorize('admin', 'shopkeeper'), createCustomer);
router.get('/', authenticate, getAllCustomers);
router.get('/profile', authenticate, getCustomerById);
router.put('/profile', authenticate, updateCustomer);
router.get('/:id', authenticate, getCustomerById);
router.put('/:id', authenticate, authorize('admin', 'shopkeeper'), updateCustomer);
router.delete('/:id', authenticate, authorize('admin'), deleteCustomer);
router.put('/:id/kyc', authenticate, authorize('admin', 'verifier'), updateCustomerKYC);

export default router;
