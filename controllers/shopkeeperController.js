import Shopkeeper from '../models/Shopkeeper.js';
import User from '../models/User.js';
import Loan from '../models/Loan.js';

export const createShopkeeper = async (req, res) => {
  try {
    const { password, ...shopkeeperInfo } = req.body;

    // Generate unique shopkeeper ID
    const shopkeeperId = `SK${Date.now().toString().slice(-6)}`;

    // Check if shopkeeper with same Aadhar already exists
    const existingShopkeeper = await Shopkeeper.findOne({
      aadharNumber: shopkeeperInfo.aadharNumber
    });

    if (existingShopkeeper) {
      return res.status(400).json({
        message: 'Shopkeeper with this Aadhar number already exists'
      });
    }

    // Check if user with same email already exists
    if (shopkeeperInfo.email) {
      const existingUser = await User.findOne({ email: shopkeeperInfo.email });
      if (existingUser) {
        return res.status(400).json({
          message: 'User with this email already exists'
        });
      }
    }

    // Create User account for shopkeeper login
    const actualPassword = password || 'Shop@123';
    const user = await User.create({
      username: shopkeeperInfo.email, // Use email as username for login
      email: shopkeeperInfo.email,
      password: actualPassword, // Default password if not provided
      role: 'shopkeeper',
      fullName: shopkeeperInfo.ownerName,
      phoneNumber: shopkeeperInfo.phoneNumber,
    });

    // Create Shopkeeper record
    const shopkeeperData = {
      ...shopkeeperInfo,
      shopkeeperId,
      userId: user._id,
      password: actualPassword, // Store password for display
      registrationDate: new Date().toISOString().split('T')[0],
    };

    const shopkeeper = await Shopkeeper.create(shopkeeperData);

    res.status(201).json({
      message: 'Shopkeeper registered successfully',
      shopkeeper: {
        ...shopkeeper.toObject(),
        password: actualPassword, // Return password for admin to see
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllShopkeepers = async (req, res) => {
  try {
    const { page = 1, limit = 50, kycStatus } = req.query;
    const query = {};

    // If user is a shopkeeper, only return their own record
    if (req.user.role === 'shopkeeper') {
      query.userId = req.user._id;
    }

    if (kycStatus) {
      query.kycStatus = kycStatus;
    }

    const shopkeepers = await Shopkeeper.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('userId')
      .populate('verifiedBy', 'fullName username')
      .populate('loans');

    const count = await Shopkeeper.countDocuments(query);

    // Format shopkeepers data with active loans count and password
    const formattedShopkeepers = await Promise.all(shopkeepers.map(async (shopkeeper) => {
      const activeLoansCount = await Loan.countDocuments({
        shopkeeper: shopkeeper._id,
        status: { $in: ['active', 'approved', 'disbursed'] }
      });

      // Password is stored in shopkeeper document for display purposes
      let displayPassword = shopkeeper.password || 'Shop@123';

      return {
        id: shopkeeper._id,
        _id: shopkeeper._id,
        shopkeeperId: shopkeeper.shopkeeperId,
        shopName: shopkeeper.shopName,
        fullName: shopkeeper.ownerName,
        owner: shopkeeper.ownerName,
        ownerName: shopkeeper.ownerName,
        email: shopkeeper.email,
        mobileNumber: shopkeeper.phoneNumber,
        phoneNumber: shopkeeper.phoneNumber,
        phone: shopkeeper.phoneNumber,
        aadharNumber: shopkeeper.aadharNumber,
        address: shopkeeper.address,
        city: shopkeeper.city,
        kycStatus: shopkeeper.kycStatus,
        state: shopkeeper.state,
        pincode: shopkeeper.pincode,
        gstNumber: shopkeeper.gstNumber,
        panNumber: shopkeeper.panNumber,
        ownerPhoto: shopkeeper.ownerPhoto,
        shopImage: shopkeeper.shopImage,
        tokenBalance: shopkeeper.tokenBalance || 0,


        status: shopkeeper.userId?.isActive ? 'active' : 'inactive',
        activeLoans: activeLoansCount,
        totalLoans: shopkeeper.loans?.length || 0,
        registrationDate: shopkeeper.registrationDate,
        password: displayPassword, // Return actual stored password
        createdAt: shopkeeper.createdAt,
        updatedAt: shopkeeper.updatedAt,
      };
    }));

    res.json({
      shopkeepers: formattedShopkeepers,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getShopkeeperById = async (req, res) => {
  try {
    const shopkeeper = await Shopkeeper.findById(req.params.id)
      .populate('userId', 'fullName username email phoneNumber')
      .populate('verifiedBy', 'fullName username')
      .populate('loans', 'loanId status loanAmount');

    if (!shopkeeper) {
      return res.status(404).json({ message: 'Shopkeeper not found' });
    }

    res.json({ shopkeeper });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateShopkeeper = async (req, res) => {
  try {
    const shopkeeper = await Shopkeeper.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!shopkeeper) {
      return res.status(404).json({ message: 'Shopkeeper not found' });
    }

    res.json({
      message: 'Shopkeeper updated successfully',
      shopkeeper,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteShopkeeper = async (req, res) => {
  try {
    const shopkeeper = await Shopkeeper.findByIdAndDelete(req.params.id);

    if (!shopkeeper) {
      return res.status(404).json({ message: 'Shopkeeper not found' });
    }

    res.json({ message: 'Shopkeeper deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateShopkeeperKYC = async (req, res) => {
  try {
    const { kycStatus, rejectionReason } = req.body;
    const shopkeeper = await Shopkeeper.findById(req.params.id);

    if (!shopkeeper) {
      return res.status(404).json({ message: 'Shopkeeper not found' });
    }

    shopkeeper.kycStatus = kycStatus;
    shopkeeper.verifiedBy = req.user._id;

    if (kycStatus === 'verified') {
      shopkeeper.verifiedDate = new Date();
    } else if (kycStatus === 'rejected') {
      shopkeeper.rejectedDate = new Date();
      shopkeeper.rejectionReason = rejectionReason;
    }

    await shopkeeper.save();

    res.json({
      message: `Shopkeeper KYC status updated to ${kycStatus}`,
      shopkeeper,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getShopkeeperStatistics = async (req, res) => {
  try {
    const [totalShopkeepers, pendingKYC, verifiedKYC, rejectedKYC] = await Promise.all([
      Shopkeeper.countDocuments(),
      Shopkeeper.countDocuments({ kycStatus: 'pending' }),
      Shopkeeper.countDocuments({ kycStatus: 'verified' }),
      Shopkeeper.countDocuments({ kycStatus: 'rejected' }),
    ]);

    res.json({
      totalShopkeepers,
      pendingKYC,
      verifiedKYC,
      rejectedKYC,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
