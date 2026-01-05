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
import { upload } from '../middleware/imageUpload.js';

const router = express.Router();

router.post('/', authenticate, authorize('shopkeeper', 'admin'), 
  upload.fields([
    { name: 'clientPhoto', maxCount: 1 },
    { name: 'clientAadharFront', maxCount: 1 },
    { name: 'clientAadharBack', maxCount: 1 },
    { name: 'clientPanFront', maxCount: 1 },
    { name: 'guarantorPhoto', maxCount: 1 },
    { name: 'guarantorAadharFront', maxCount: 1 },
    { name: 'guarantorAadharBack', maxCount: 1 },
    { name: 'guarantorPanFront', maxCount: 1 }
  ]),
  createLoan
);
router.get('/', authenticate, getAllLoans);
router.get('/my-loans', authenticate, getAllLoans);
router.get('/statistics', authenticate, getLoanStatistics);
router.get('/:id', authenticate, getLoanById);
router.put('/:id/status', authenticate, authorize('admin', 'verifier'), updateLoanStatus);
router.put('/:id/kyc', authenticate, authorize('admin', 'verifier'), updateKYCStatus);
router.post('/:id/payment', authenticate, authorize('shopkeeper', 'collections', 'admin'), collectPayment);
router.post('/:id/penalty', authenticate, authorize('collections', 'admin'), applyPenalty);
router.put('/:id/due-date', authenticate, authorize('admin', 'collections'), setNextDueDate);
router.delete('/:id', authenticate, authorize('admin', 'shopkeeper'), deleteLoan);

export default router;
