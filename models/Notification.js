import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
      'new_loan_application',
      'kyc_required',
      'payment_due',
      'payment_overdue',
      'loan_approved',
      'loan_rejected',
      'info',
      'success',
      'warning',
      'error'
    ],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  targetRole: {
    type: String,
    enum: ['admin', 'verifier', 'collections', 'shopkeeper'],
  },
  loanId: {
    type: String,
  },
  clientName: {
    type: String,
  },
  clientId: {
    type: String,
  },
  loanAmount: {
    type: Number,
  },
  daysOverdue: {
    type: Number,
  },
  amount: {
    type: Number,
  },
  kycStatus: {
    type: String,
  },
  read: {
    type: Boolean,
    default: false,
  },
  readBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    readAt: {
      type: Date,
      default: Date.now,
    },
  }],
}, {
  timestamps: true,
});

notificationSchema.index({ targetRole: 1, read: 1 });
notificationSchema.index({ createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
