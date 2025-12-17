import express from 'express';
import {
  createPayment,
  getAllPayments,
  getPaymentById,
  getPaymentsByLoan,
  updatePayment,
  deletePayment,
  getPaymentStatistics,
} from '../controllers/paymentController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticate, authorize('collections', 'admin'), createPayment);
router.get('/', authenticate, getAllPayments);
router.get('/statistics', authenticate, authorize('admin', 'collections'), getPaymentStatistics);
router.get('/loan/:loanId', authenticate, getPaymentsByLoan);
router.get('/:id', authenticate, getPaymentById);
router.put('/:id', authenticate, authorize('admin', 'collections'), updatePayment);
router.delete('/:id', authenticate, authorize('admin'), deletePayment);

export default router;
