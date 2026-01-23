import mongoose from 'mongoose';

const penaltySchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  appliedDate: {
    type: String,
    required: true,
  },
  appliedAt: {
    type: Date,
    default: Date.now,
  },
});

const paymentSchema = new mongoose.Schema({
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
    type: String,
    required: true,
  },
  paymentProof: {
    type: String,
  },
  transactionId: {
    type: String,
  },
  penalty: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const loanSchema = new mongoose.Schema({
  loanId: {
    type: String,
    required: true,
  },
  clientName: {
    type: String,
    required: true,
  },
  clientPhone: {
    type: String,
    required: true,
  },
  clientAadharNumber: {
    type: String,
    required: true,
  },
  clientAddress: {
    type: String,
    required: true,
  },
  clientFatherOrSpouseName: {
    type: String,
  },
  clientGender: {
    type: String,
  },
  clientWorkingAddress: {
    type: String,
  },
  clientPanNumber: {
    type: String,
  },
  customerName: {
    type: String,
  },
  customerPhone: {
    type: String,
  },
  customerEmail: {
    type: String,
  },
  customerAddress: {
    type: String,
  },
  customerAadhaar: {
    type: String,
  },
  customerPan: {
    type: String,
  },
  customerPhoto: {
    type: String,
  },
  aadhaarFrontImage: {
    type: String,
  },
  aadhaarBackImage: {
    type: String,
  },
  panFrontImage: {
    type: String,
  },
  guarantorName: {
    type: String,
  },
  guarantorPhone: {
    type: String,
  },
  guarantorEmail: {
    type: String,
  },
  guarantorAddress: {
    type: String,
  },
  guarantorAadhaar: {
    type: String,
  },
  guarantorRelationship: {
    type: String,
  },
  guarantorGender: {
    type: String,
  },
  guarantorWorkingAddress: {
    type: String,
  },
  guarantorPhoto: {
    type: String,
  },
  guarantorAadhaarImage: {
    type: String,
  },
  guarantorAadhaarFrontImage: {
    type: String,
  },
  guarantorAadhaarBackImage: {
    type: String,
  },
  guarantorPanImage: {
    type: String,
  },
  referenceName: {
    type: String,
  },
  referenceNumber: {
    type: String,
  },
  productName: {
    type: String,
  },
  productCategory: {
    type: String,
  },
  productCompany: {
    type: String,
  },
  productPrice: {
    type: Number,
  },
  price: {
    type: Number,
  },
  serialNumber: {
    type: String,
  },
  productImage: {
    type: String,
  },
  downPayment: {
    type: Number,
  },
  fileCharge: {
    type: Number,
  },
  bankName: {
    type: String,
  },
  accountNumber: {
    type: String,
  },
  ifscCode: {
    type: String,
  },
  branchName: {
    type: String,
  },
  paymentMode: {
    type: String,
  },
  passbookImage: {
    type: String,
  },
  loanAmount: {
    type: Number,
    required: true,
  },
  interestRate: {
    type: Number,
    required: true,
  },
  tenure: {
    type: Number,
    required: true,
  },
  emiAmount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Verified', 'Approved', 'Active', 'Overdue', 'Paid', 'Rejected'],
    default: 'Pending',
  },
  kycStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending',
  },
  appliedDate: {
    type: String,
    required: true,
  },
  emiStartDate: {
    type: String,
    required: true,
  },
  verifiedDate: {
    type: String,
  },
  approvedDate: {
    type: String,
  },
  rejectedDate: {
    type: String,
  },
  nextDueDate: {
    type: String,
  },
  emisPaid: {
    type: Number,
    default: 0,
  },
  emisRemaining: {
    type: Number,
  },
  submittedBy: {
    type: String,
    default: 'shopkeeper',
  },
  updatedBy: {
    type: String,
  },
  kycVerifiedBy: {
    type: String,
  },
  kycVerifiedDate: {
    type: String,
  },
  statusComment: {
    type: String,
  },
  verifierComment: {
    type: String,
  },
  adminComment: {
    type: String,
  },
  rejectionReason: {
    type: String,
  },
  commentDate: {
    type: Date,
  },
  lastPaymentDate: {
    type: String,
  },
  penalties: [penaltySchema],
  totalPenalty: {
    type: Number,
    default: 0,
  },
  payments: [paymentSchema],
  documents: [{
    type: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  shopkeeperId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
  },
  applicationMode: {
    type: String,
    enum: ['self', 'max_born_group'],
    default: 'max_born_group',
  },
}, {
  timestamps: true,
});

loanSchema.index({ loanId: 1 }, { unique: true });
loanSchema.index({ status: 1 });
loanSchema.index({ clientAadharNumber: 1 });
loanSchema.index({ shopkeeperId: 1 });

const Loan = mongoose.model('Loan', loanSchema);

export default Loan;
