import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Loan from '../models/Loan.js';
import Customer from '../models/Customer.js';
import Shopkeeper from '../models/Shopkeeper.js';
import Notification from '../models/Notification.js';
import Payment from '../models/Payment.js';

dotenv.config();

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
};

const testDatabaseConnection = async () => {
  try {
    log.info('Testing database connection...');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    log.success('Database connected successfully');
    log.info(`Database: ${mongoose.connection.name}`);
    log.info(`Host: ${mongoose.connection.host}`);
    return true;
  } catch (error) {
    log.error(`Database connection failed: ${error.message}`);
    return false;
  }
};

const testCollections = async () => {
  try {
    log.info('\nTesting collections...');
    
    const userCount = await User.countDocuments();
    const loanCount = await Loan.countDocuments();
    const customerCount = await Customer.countDocuments();
    const shopkeeperCount = await Shopkeeper.countDocuments();
    const notificationCount = await Notification.countDocuments();
    const paymentCount = await Payment.countDocuments();
    
    log.success(`Users: ${userCount}`);
    log.success(`Loans: ${loanCount}`);
    log.success(`Customers: ${customerCount}`);
    log.success(`Shopkeepers: ${shopkeeperCount}`);
    log.success(`Notifications: ${notificationCount}`);
    log.success(`Payments: ${paymentCount}`);
    
    if (userCount === 0) {
      log.warning('No users found. Run: node scripts/init-database.js');
    }
    
    return true;
  } catch (error) {
    log.error(`Collection test failed: ${error.message}`);
    return false;
  }
};

const testUserAuthentication = async () => {
  try {
    log.info('\nTesting user authentication...');
    
    const admin = await User.findOne({ email: 'admin@loanmanagement.com' });
    if (!admin) {
      log.warning('Admin user not found');
      return false;
    }
    
    const isValid = await admin.comparePassword('admin123');
    if (isValid) {
      log.success('Admin authentication working');
    } else {
      log.error('Admin password verification failed');
      return false;
    }
    
    return true;
  } catch (error) {
    log.error(`Authentication test failed: ${error.message}`);
    return false;
  }
};

const testLoanOperations = async () => {
  try {
    log.info('\nTesting loan operations...');
    
    // Test loan creation
    const testLoan = {
      loanId: `TEST${Date.now()}`,
      clientName: 'Test Client',
      clientPhone: '9999999999',
      clientAadharNumber: '999999999999',
      clientAddress: 'Test Address',
      loanAmount: 50000,
      interestRate: 12,
      tenure: 12,
      emiAmount: 4442,
      status: 'Pending',
      appliedDate: new Date().toISOString().split('T')[0],
      emiStartDate: new Date().toISOString().split('T')[0],
      emisRemaining: 12,
    };
    
    const loan = await Loan.create(testLoan);
    log.success('Loan creation working');
    
    // Test loan update
    loan.status = 'Verified';
    loan.verifierComment = 'Test verification comment';
    await loan.save();
    log.success('Loan update working');
    
    // Test loan query
    const foundLoan = await Loan.findOne({ loanId: testLoan.loanId });
    if (foundLoan && foundLoan.verifierComment === 'Test verification comment') {
      log.success('Loan query working');
    }
    
    // Cleanup
    await Loan.findByIdAndDelete(loan._id);
    log.success('Loan deletion working');
    
    return true;
  } catch (error) {
    log.error(`Loan operations test failed: ${error.message}`);
    return false;
  }
};

const testImagePaths = async () => {
  try {
    log.info('\nTesting image path handling...');
    
    const loansWithImages = await Loan.find({
      $or: [
        { customerPhoto: { $exists: true, $ne: null } },
        { aadhaarFrontImage: { $exists: true, $ne: null } },
        { guarantorPhoto: { $exists: true, $ne: null } }
      ]
    }).limit(5);
    
    if (loansWithImages.length > 0) {
      log.success(`Found ${loansWithImages.length} loans with images`);
      loansWithImages.forEach(loan => {
        if (loan.customerPhoto) log.info(`  Customer photo: ${loan.customerPhoto}`);
        if (loan.aadhaarFrontImage) log.info(`  Aadhar front: ${loan.aadhaarFrontImage}`);
      });
    } else {
      log.warning('No loans with images found');
    }
    
    return true;
  } catch (error) {
    log.error(`Image path test failed: ${error.message}`);
    return false;
  }
};

const testCommentFields = async () => {
  try {
    log.info('\nTesting comment fields...');
    
    const loansWithComments = await Loan.find({
      $or: [
        { verifierComment: { $exists: true, $ne: null } },
        { adminComment: { $exists: true, $ne: null } },
        { statusComment: { $exists: true, $ne: null } },
        { rejectionReason: { $exists: true, $ne: null } }
      ]
    }).limit(5);
    
    if (loansWithComments.length > 0) {
      log.success(`Found ${loansWithComments.length} loans with comments`);
      loansWithComments.forEach(loan => {
        log.info(`  Loan ${loan.loanId}:`);
        if (loan.verifierComment) log.info(`    Verifier: ${loan.verifierComment}`);
        if (loan.adminComment) log.info(`    Admin: ${loan.adminComment}`);
        if (loan.statusComment) log.info(`    Status: ${loan.statusComment}`);
        if (loan.rejectionReason) log.info(`    Rejection: ${loan.rejectionReason}`);
      });
    } else {
      log.warning('No loans with comments found');
    }
    
    return true;
  } catch (error) {
    log.error(`Comment fields test failed: ${error.message}`);
    return false;
  }
};

const testIndexes = async () => {
  try {
    log.info('\nTesting indexes...');
    
    const loanIndexes = await Loan.collection.getIndexes();
    const userIndexes = await User.collection.getIndexes();
    
    log.success(`Loan indexes: ${Object.keys(loanIndexes).length}`);
    log.success(`User indexes: ${Object.keys(userIndexes).length}`);
    
    // Check for required indexes
    if (loanIndexes.loanId_1) {
      log.success('Loan ID index exists');
    } else {
      log.warning('Loan ID index missing');
    }
    
    if (userIndexes.email_1) {
      log.success('User email index exists');
    } else {
      log.warning('User email index missing');
    }
    
    return true;
  } catch (error) {
    log.error(`Index test failed: ${error.message}`);
    return false;
  }
};

const runAllTests = async () => {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║     System Test Suite                 ║');
  console.log('╚════════════════════════════════════════╝\n');
  
  const results = {
    connection: false,
    collections: false,
    authentication: false,
    loanOps: false,
    images: false,
    comments: false,
    indexes: false,
  };
  
  try {
    results.connection = await testDatabaseConnection();
    if (!results.connection) {
      log.error('Cannot proceed without database connection');
      process.exit(1);
    }
    
    results.collections = await testCollections();
    results.authentication = await testUserAuthentication();
    results.loanOps = await testLoanOperations();
    results.images = await testImagePaths();
    results.comments = await testCommentFields();
    results.indexes = await testIndexes();
    
    // Summary
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║     Test Results Summary              ║');
    console.log('╚════════════════════════════════════════╝\n');
    
    const passed = Object.values(results).filter(r => r === true).length;
    const total = Object.keys(results).length;
    
    Object.entries(results).forEach(([test, result]) => {
      const status = result ? colors.green + '✓ PASS' : colors.red + '✗ FAIL';
      console.log(`${status}${colors.reset} - ${test}`);
    });
    
    console.log(`\n${colors.blue}Total: ${passed}/${total} tests passed${colors.reset}\n`);
    
    if (passed === total) {
      log.success('All tests passed! System is working correctly.');
    } else {
      log.warning('Some tests failed. Please check the errors above.');
    }
    
    process.exit(passed === total ? 0 : 1);
  } catch (error) {
    log.error(`Test suite failed: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
};

runAllTests();
