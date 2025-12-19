import Loan from '../models/Loan.js';
import Notification from '../models/Notification.js';
import Customer from '../models/Customer.js';

export const createLoan = async (req, res) => {
  try {
    console.log('Creating loan with data:', req.body);
    console.log('User:', req.user);
    
    const {
      clientName,
      clientFatherOrSpouseName,
      clientGender,
      clientMobile,
      clientPhone,
      clientWorkingAddress,
      clientAddress,
      clientAadharNumber,
      clientPanNumber,
      guarantor,
      productCategory,
      productName,
      productCompany,
      price,
      serialNumber,
      downPayment,
      loanAmount,
      interestRate,
      tenure,
      emiAmount,
      emiStartDate,
      fileCharge,
      bankName,
      accountNumber,
      ifscCode,
      paymentMode,
      applicationMode,
      customerId,
    } = req.body;

    // Validate required fields
    if (!clientName) {
      return res.status(400).json({ message: 'Client name is required' });
    }
    if (!clientAadharNumber) {
      return res.status(400).json({ message: 'Client Aadhar number is required' });
    }
    if (!clientMobile && !clientPhone) {
      return res.status(400).json({ message: 'Client phone number is required' });
    }

    const loanId = `LN${Date.now().toString().slice(-8)}`;
    const appliedDate = new Date().toISOString().split('T')[0];
    const phone = clientMobile || clientPhone;
    const address = typeof clientAddress === 'object' 
      ? `${clientAddress.houseNo || ''}, ${clientAddress.galiNo || ''}, ${clientAddress.colony || ''}, ${clientAddress.city || ''}, ${clientAddress.state || ''} - ${clientAddress.pincode || ''}`
      : clientAddress || 'N/A';

    // Extract guarantor details
    const guarantorData = guarantor || {};
    const guarantorAddress = typeof guarantorData.address === 'object'
      ? `${guarantorData.address.houseNo || ''}, ${guarantorData.address.galiNo || ''}, ${guarantorData.address.colony || ''}, ${guarantorData.address.city || ''}, ${guarantorData.address.state || ''} - ${guarantorData.address.pincode || ''}`
      : guarantorData.address || '';

    const loanData = {
      loanId,
      clientName,
      clientPhone: phone,
      clientAadharNumber,
      clientAddress: address,
      clientFatherOrSpouseName,
      clientGender,
      clientWorkingAddress,
      clientPanNumber,
      // Duplicate fields for compatibility with frontend display
      customerName: clientName,
      customerPhone: phone,
      customerAddress: address,
      customerAadhaar: clientAadharNumber,
      customerPan: clientPanNumber,
      // Guarantor details
      guarantorName: guarantorData.name,
      guarantorPhone: guarantorData.mobile,
      guarantorAddress: guarantorAddress,
      guarantorAadhaar: guarantorData.aadharNumber,
      guarantorRelationship: guarantorData.relation,
      guarantorGender: guarantorData.gender,
      guarantorWorkingAddress: guarantorData.workingAddress,
      referenceName: guarantorData.referenceName,
      referenceNumber: guarantorData.referenceNumber,
      // Product details
      productName,
      productCategory,
      productCompany,
      productPrice: price,
      price,
      serialNumber,
      downPayment,
      fileCharge,
      // Bank details
      bankName,
      accountNumber,
      ifscCode,
      paymentMode,
      // Financial details
      loanAmount: loanAmount || (price - (downPayment || 0)),
      interestRate: interestRate || 0.0375,
      tenure: tenure || 12,
      emiAmount: emiAmount || 0,
      appliedDate,
      emiStartDate: emiStartDate || appliedDate,
      emisRemaining: tenure || 12,
      shopkeeperId: req.user._id,
      customerId,
      status: 'Pending',
      applicationMode: applicationMode || 'max_born_group',
    };

    console.log('Creating loan with validated data:', loanData);

    const loan = await Loan.create(loanData);

    console.log('Loan created successfully:', loan);

    // Create notification
    try {
      await Notification.create({
        type: 'new_loan_application',
        title: 'New Loan Application',
        message: `New loan application from ${clientName} (${loanId}) - Amount: ₹${(loanAmount || 0).toLocaleString()}`,
        severity: 'medium',
        targetRole: 'verifier',
        loanId: loan.loanId,
        clientName,
        loanAmount: loanAmount || 0,
      });
    } catch (notifError) {
      console.error('Failed to create notification:', notifError);
      // Don't fail the loan creation if notification fails
    }

    res.status(201).json({
      message: 'Loan application submitted successfully',
      loan,
    });
  } catch (error) {
    console.error('Error creating loan:', error);
    res.status(500).json({ 
      message: error.message,
      error: error.toString(),
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

export const getAllLoans = async (req, res) => {
  try {
    const { status, kycStatus, page = 1, limit = 50 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (kycStatus) query.kycStatus = kycStatus;

    if (req.user.role === 'shopkeeper') {
      query.shopkeeperId = req.user._id;
    }

    const loans = await Loan.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('shopkeeperId', 'fullName username')
      .populate('customerId', 'fullName phoneNumber');

    const count = await Loan.countDocuments(query);

    res.json({
      loans,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getLoanById = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id)
      .populate('shopkeeperId', 'fullName username phoneNumber')
      .populate('customerId', 'fullName phoneNumber aadharNumber');

    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    if (req.user.role === 'shopkeeper' && loan.shopkeeperId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ loan });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateLoanStatus = async (req, res) => {
  try {
    const { status, comment } = req.body;
    const loan = await Loan.findById(req.params.id);

    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    loan.status = status;
    loan.updatedBy = req.user.role;

    if (status === 'Verified') {
      loan.verifiedDate = new Date().toISOString().split('T')[0];
      if (comment) loan.verifierComment = comment;
    } else if (status === 'Approved') {
      loan.approvedDate = new Date().toISOString().split('T')[0];
      if (comment) loan.adminComment = comment;
    } else if (status === 'Rejected') {
      loan.rejectedDate = new Date().toISOString().split('T')[0];
      loan.rejectionReason = comment;
    }

    if (comment) {
      loan.statusComment = comment;
      loan.commentDate = new Date();
    }

    await loan.save();

    if (status === 'Verified') {
      await Notification.create({
        type: 'info',
        title: 'KYC Verification Required',
        message: `KYC verification needed for ${loan.clientName} (Loan ID: ${loan.loanId})`,
        severity: 'medium',
        targetRole: 'admin',
        loanId: loan.loanId,
        clientId: loan.clientPhone,
      });
    } else if (status === 'Approved') {
      await Notification.create({
        type: 'success',
        title: 'Loan Approved',
        message: `Loan for ${loan.clientName} (ID: ${loan.loanId}) has been approved`,
        severity: 'medium',
        loanId: loan.loanId,
        clientId: loan.clientPhone,
      });
    }

    res.json({
      message: `Loan status updated to ${status}`,
      loan,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateKYCStatus = async (req, res) => {
  try {
    const { kycStatus } = req.body;
    const loan = await Loan.findById(req.params.id);

    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    loan.kycStatus = kycStatus;
    loan.kycVerifiedBy = req.user.role;
    
    if (kycStatus === 'verified') {
      loan.kycVerifiedDate = new Date().toISOString().split('T')[0];
    }

    await loan.save();

    res.json({
      message: `KYC status updated to ${kycStatus}`,
      loan,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const collectPayment = async (req, res) => {
  try {
    const { amount, paymentMode, paymentDate, transactionId, paymentProof } = req.body;
    const loan = await Loan.findById(req.params.id);

    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    if (loan.status !== 'Active' && loan.status !== 'Overdue' && loan.status !== 'Approved') {
      return res.status(400).json({ message: 'Loan is not active for payment collection' });
    }

    const payment = {
      amount,
      paymentMode,
      paymentDate: paymentDate || new Date().toISOString().split('T')[0],
      collectedBy: req.user.fullName,
      transactionId,
      paymentProof,
    };

    loan.payments.push(payment);
    loan.emisPaid = (loan.emisPaid || 0) + 1;
    loan.emisRemaining = (loan.emisRemaining || loan.tenure) - 1;
    loan.lastPaymentDate = payment.paymentDate;

    if (loan.emisRemaining === 0) {
      loan.status = 'Paid';
    } else {
      loan.status = 'Active';
    }

    await loan.save();

    res.json({
      message: 'Payment collected successfully',
      loan,
      payment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const applyPenalty = async (req, res) => {
  try {
    const { amount = 500, reason = 'EMI Overdue' } = req.body;
    const loan = await Loan.findById(req.params.id);

    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    const penalty = {
      amount,
      reason,
      appliedDate: new Date().toISOString().split('T')[0],
    };

    loan.penalties.push(penalty);
    loan.totalPenalty = (loan.totalPenalty || 0) + amount;
    
    if (loan.status === 'Active') {
      loan.status = 'Overdue';
    }

    await loan.save();

    res.json({
      message: 'Penalty applied successfully',
      loan,
      penalty,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteLoan = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);

    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    if (req.user.role !== 'admin' && loan.shopkeeperId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Loan.findByIdAndDelete(req.params.id);

    res.json({ message: 'Loan deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getLoanStatistics = async (req, res) => {
  try {
    const query = req.user.role === 'shopkeeper' ? { shopkeeperId: req.user._id } : {};

    const [
      totalLoans,
      pendingLoans,
      verifiedLoans,
      approvedLoans,
      activeLoans,
      overdueLoans,
      completedLoans,
      rejectedLoans,
    ] = await Promise.all([
      Loan.countDocuments(query),
      Loan.countDocuments({ ...query, status: 'Pending' }),
      Loan.countDocuments({ ...query, status: 'Verified' }),
      Loan.countDocuments({ ...query, status: 'Approved' }),
      Loan.countDocuments({ ...query, status: 'Active' }),
      Loan.countDocuments({ ...query, status: 'Overdue' }),
      Loan.countDocuments({ ...query, status: 'Paid' }),
      Loan.countDocuments({ ...query, status: 'Rejected' }),
    ]);

    const loans = await Loan.find(query);
    const totalPenalties = loans.reduce((sum, loan) => sum + (loan.totalPenalty || 0), 0);

    res.json({
      totalLoans,
      pendingLoans,
      verifiedLoans,
      approvedLoans,
      activeLoans,
      overdueLoans,
      completedLoans,
      rejectedLoans,
      totalPenalties,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const setNextDueDate = async (req, res) => {
  try {
    const { nextDueDate } = req.body;
    const loan = await Loan.findById(req.params.id);

    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    loan.nextDueDate = nextDueDate;
    await loan.save();

    res.json({
      message: 'Next due date updated successfully',
      loan,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
