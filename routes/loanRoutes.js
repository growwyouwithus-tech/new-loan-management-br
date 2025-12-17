import express from 'express';
import {
  createLoan,
  getAllLoans,
  getLoanById,
  updateLoanStatus,
  updateKYCStatus,
  collectPayment,
  applyPenalty,
  deleteLoan,
  getLoanStatistics,
  setNextDueDate,
} from '../controllers/loanController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticate, authorize('shopkeeper', 'admin'), createLoan);
router.get('/', authenticate, getAllLoans);
router.get('/my-loans', authenticate, getAllLoans);
router.get('/statistics', authenticate, getLoanStatistics);
router.get('/:id', authenticate, getLoanById);
router.put('/:id/status', authenticate, authorize('admin', 'verifier'), updateLoanStatus);
router.put('/:id/kyc', authenticate, authorize('admin', 'verifier'), updateKYCStatus);
router.post('/:id/payment', authenticate, authorize('collections', 'admin'), collectPayment);
router.post('/:id/penalty', authenticate, authorize('collections', 'admin'), applyPenalty);
router.put('/:id/due-date', authenticate, authorize('admin', 'collections'), setNextDueDate);
router.delete('/:id', authenticate, authorize('admin', 'shopkeeper'), deleteLoan);

export default router;
