import Customer from '../models/Customer.js';

export const createCustomer = async (req, res) => {
  try {
    const customerData = req.body;
    
    const existingCustomer = await Customer.findOne({ 
      aadharNumber: customerData.aadharNumber 
    });
    
    if (existingCustomer) {
      return res.status(400).json({ 
        message: 'Customer with this Aadhar number already exists' 
      });
    }

    const customer = await Customer.create(customerData);

    res.status(201).json({
      message: 'Customer created successfully',
      customer,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllCustomers = async (req, res) => {
  try {
    const { page = 1, limit = 50, search } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } },
        { aadharNumber: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const customers = await Customer.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('loans', 'loanId status loanAmount');

    const count = await Customer.countDocuments(query);

    res.json({
      customers,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id)
      .populate('loans', 'loanId status loanAmount tenure emisPaid emisRemaining')
      .populate('kycVerifiedBy', 'fullName username');

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json({ customer });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json({
      message: 'Customer updated successfully',
      customer,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCustomerKYC = async (req, res) => {
  try {
    const { kycStatus } = req.body;
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    customer.kycStatus = kycStatus;
    customer.kycVerifiedBy = req.user._id;
    
    if (kycStatus === 'verified') {
      customer.kycVerifiedDate = new Date();
    }

    await customer.save();

    res.json({
      message: `Customer KYC status updated to ${kycStatus}`,
      customer,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
