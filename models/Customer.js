import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  fatherName: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
  },
  aadharNumber: {
    type: String,
    required: true,
    unique: true,
  },
  panNumber: {
    type: String,
  },
  address: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  pincode: {
    type: String,
    required: true,
  },
  dateOfBirth: {
    type: String,
  },
  occupation: {
    type: String,
  },
  monthlyIncome: {
    type: Number,
  },
  kycStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending',
  },
  kycVerifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  kycVerifiedDate: {
    type: Date,
  },
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
  loans: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Loan',
  }],
}, {
  timestamps: true,
});

customerSchema.index({ aadharNumber: 1 });
customerSchema.index({ phoneNumber: 1 });

const Customer = mongoose.model('Customer', customerSchema);

export default Customer;
