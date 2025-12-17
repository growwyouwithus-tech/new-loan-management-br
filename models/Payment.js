import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  paymentId: {
    type: String,
    required: true,
    unique: true,
  },
  loanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Loan',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  paymentMode: {
    type: String,
    enum: ['cash', 'upi', 'bank_transfer', 'cheque'],
    required: true,
  },
  paymentDate: {
    type: String,
    required: true,
  },
  collectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  transactionId: {
    type: String,
  },
  emiNumber: {
    type: Number,
    required: true,
  },
  paymentProof: {
    type: String,
  },
  remarks: {
    type: String,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed',
  },
}, {
  timestamps: true,
});

paymentSchema.index({ loanId: 1 });
paymentSchema.index({ paymentDate: 1 });

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
