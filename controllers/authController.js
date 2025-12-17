import User from '../models/User.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';

export const register = async (req, res) => {
  try {
    const { username, email, password, role, fullName, phoneNumber } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ 
        message: 'User with this email or username already exists' 
      });
    }

    const user = await User.create({
      username,
      email,
      password,
      role: role || 'shopkeeper',
      fullName,
      phoneNumber,
    });

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({
      message: 'User registered successfully',
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password, aadharNumber, loanApplyDate, shopkeeperId, username } = req.body;

    // Customer login with Aadhar number and loan apply date
    if (aadharNumber && loanApplyDate) {
      return await customerLogin(req, res);
    }

    // Login with email (works for both admin and shopkeeper)
    // Also support username for backward compatibility
    let user;
    
    if (email) {
      // Try to find user by email OR username (since shopkeeper username is their email)
      user = await User.findOne({ 
        $or: [
          { email: email },
          { username: email }
        ]
      });
    } else if (shopkeeperId || username) {
      // Login with shopkeeper ID or username
      user = await User.findOne({ username: shopkeeperId || username });
    }
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is inactive' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();

    res.json({
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Customer login with Aadhar number and loan apply date
export const customerLogin = async (req, res) => {
  try {
    const { aadharNumber, loanApplyDate } = req.body;

    // Import Loan model
    const Loan = (await import('../models/Loan.js')).default;

    // Find loan with matching Aadhar number and apply date
    const loan = await Loan.findOne({
      $or: [
        { clientAadharNumber: aadharNumber },
        { 'customer.aadharNumber': aadharNumber }
      ]
    });

    if (!loan) {
      return res.status(401).json({ message: 'Invalid Aadhar number or loan not found' });
    }

    // Verify loan apply date
    const loanDate = new Date(loan.appliedDate || loan.emiStartDate || loan.createdAt);
    const inputDate = new Date(loanApplyDate);
    
    if (loanDate.toISOString().split('T')[0] !== inputDate.toISOString().split('T')[0]) {
      return res.status(401).json({ message: 'Invalid loan apply date' });
    }

    // Generate tokens for customer
    const accessToken = generateAccessToken(loan._id, 'customer');
    const refreshToken = generateRefreshToken(loan._id);

    res.json({
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: {
        id: loan._id,
        name: loan.clientName || loan.customer?.fullName,
        mobile: loan.clientPhone || loan.customer?.phoneNumber,
        email: loan.customer?.email || '',
        aadharNumber: aadharNumber,
        role: 'customer',
        loanId: loan.loanId || loan._id,
      },
    });
  } catch (error) {
    console.error('Customer login error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token required' });
    }

    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.userId);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const newAccessToken = generateAccessToken(user._id, user.role);

    res.json({
      accessToken: newAccessToken,
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
};

export const logout = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.refreshToken = null;
      await user.save();
    }

    res.json({ message: 'Logout successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -refreshToken');
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { fullName, phoneNumber } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (fullName) user.fullName = fullName;
    if (phoneNumber) user.phoneNumber = phoneNumber;

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
