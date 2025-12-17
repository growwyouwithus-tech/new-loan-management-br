export const LOAN_STATUS = {
  PENDING: 'Pending',
  VERIFIED: 'Verified',
  APPROVED: 'Approved',
  ACTIVE: 'Active',
  OVERDUE: 'Overdue',
  PAID: 'Paid',
  REJECTED: 'Rejected',
};

export const KYC_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
};

export const USER_ROLES = {
  ADMIN: 'admin',
  VERIFIER: 'verifier',
  COLLECTIONS: 'collections',
  SHOPKEEPER: 'shopkeeper',
};

export const NOTIFICATION_TYPES = {
  NEW_LOAN_APPLICATION: 'new_loan_application',
  KYC_REQUIRED: 'kyc_required',
  PAYMENT_DUE: 'payment_due',
  PAYMENT_OVERDUE: 'payment_overdue',
  LOAN_APPROVED: 'loan_approved',
  LOAN_REJECTED: 'loan_rejected',
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
};

export const NOTIFICATION_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
};

export const PAYMENT_MODES = {
  CASH: 'cash',
  UPI: 'upi',
  BANK_TRANSFER: 'bank_transfer',
  CHEQUE: 'cheque',
};
