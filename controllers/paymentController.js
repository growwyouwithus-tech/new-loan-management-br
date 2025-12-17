import Payment from '../models/Payment.js';
import Loan from '../models/Loan.js';

export const createPayment = async (req, res) => {
  try {
    const {
      loanId,
      amount,
      paymentMode,
      paymentDate,
      transactionId,
      emiNumber,
      paymentProof,
      remarks,
    } = req.body;

    const loan = await Loan.findById(loanId);
    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    const paymentId = `PAY${Date.now()}`;

    const payment = await Payment.create({
      paymentId,
      loanId,
      amount,
      paymentMode,
      paymentDate: paymentDate || new Date().toISOString().split('T')[0],
      collectedBy: req.user._id,
      transactionId,
      emiNumber,
      paymentProof,
      remarks,
    });

    res.status(201).json({
      message: 'Payment recorded successfully',
      payment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllPayments = async (req, res) => {
  try {
    const { page = 1, limit = 50, loanId, status } = req.query;
    const query = {};

    if (loanId) query.loanId = loanId;
    if (status) query.status = status;

    const payments = await Payment.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('loanId', 'loanId clientName clientPhone loanAmount')
      .populate('collectedBy', 'fullName username');

    const count = await Payment.countDocuments(query);

    res.json({
      payments,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('loanId', 'loanId clientName clientPhone loanAmount tenure')
      .populate('collectedBy', 'fullName username phoneNumber');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.json({ payment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPaymentsByLoan = async (req, res) => {
  try {
    const payments = await Payment.find({ loanId: req.params.loanId })
      .sort({ paymentDate: -1 })
      .populate('collectedBy', 'fullName username');

    res.json({ payments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.json({
      message: 'Payment updated successfully',
      payment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPaymentStatistics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = {};

    if (startDate && endDate) {
      query.paymentDate = {
        $gte: startDate,
        $lte: endDate,
      };
    }

    const payments = await Payment.find(query);
    
    const totalPayments = payments.length;
    const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
    
    const paymentsByMode = payments.reduce((acc, payment) => {
      acc[payment.paymentMode] = (acc[payment.paymentMode] || 0) + 1;
      return acc;
    }, {});

    res.json({
      totalPayments,
      totalAmount,
      paymentsByMode,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
