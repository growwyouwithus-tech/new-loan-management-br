import mongoose from 'mongoose';

const shopkeeperSchema = new mongoose.Schema({
  shopkeeperId: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  shopName: {
    type: String,
    required: true,
  },
  ownerName: {
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
  gstNumber: {
    type: String,
  },
  panNumber: {
    type: String,
  },
  aadharNumber: {
    type: String,
    required: true,
  },
  ownerPhoto: {
    type: String,
  },
  shopImage: {
    type: String,
  },
  creditLimit: {
    type: Number,
    default: 0,
  },
  kycStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending',
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  verifiedDate: {
    type: Date,
  },
  rejectedDate: {
    type: Date,
  },
  rejectionReason: {
    type: String,
  },
  registrationDate: {
    type: String,
    required: true,
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

shopkeeperSchema.index({ shopkeeperId: 1 });
shopkeeperSchema.index({ userId: 1 });

const Shopkeeper = mongoose.model('Shopkeeper', shopkeeperSchema);

export default Shopkeeper;
