import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Loan from '../models/Loan.js';
import Customer from '../models/Customer.js';
import Shopkeeper from '../models/Shopkeeper.js';
import Notification from '../models/Notification.js';
import Payment from '../models/Payment.js';

dotenv.config();

const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    console.log('URI:', process.env.MONGODB_URI ? 'Found' : 'Not found');
    
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log('✓ MongoDB Connected Successfully');
    console.log('Database:', mongoose.connection.name);
    console.log('Host:', mongoose.connection.host);
    return true;
  } catch (error) {
    console.error('✗ MongoDB Connection Error:', error.message);
    return false;
  }
};

const checkCollections = async () => {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n=== Existing Collections ===');
    collections.forEach(col => {
      console.log(`- ${col.name}`);
    });
    return collections;
  } catch (error) {
    console.error('Error listing collections:', error.message);
    return [];
  }
};

const createIndexes = async () => {
  try {
    console.log('\n=== Creating Indexes ===');
    
    // User indexes
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ username: 1 }, { unique: true });
    console.log('✓ User indexes created');
    
    // Loan indexes
    await Loan.collection.createIndex({ loanId: 1 }, { unique: true });
    await Loan.collection.createIndex({ status: 1 });
    await Loan.collection.createIndex({ clientAadharNumber: 1 });
    await Loan.collection.createIndex({ shopkeeperId: 1 });
    console.log('✓ Loan indexes created');
    
    // Customer indexes
    await Customer.collection.createIndex({ aadharNumber: 1 }, { unique: true });
    await Customer.collection.createIndex({ phoneNumber: 1 });
    console.log('✓ Customer indexes created');
    
    // Shopkeeper indexes
    await Shopkeeper.collection.createIndex({ shopkeeperId: 1 }, { unique: true });
    await Shopkeeper.collection.createIndex({ userId: 1 });
    console.log('✓ Shopkeeper indexes created');
    
    // Payment indexes
    await Payment.collection.createIndex({ loanId: 1 });
    await Payment.collection.createIndex({ paymentDate: 1 });
    console.log('✓ Payment indexes created');
    
    // Notification indexes
    await Notification.collection.createIndex({ targetRole: 1, read: 1 });
    await Notification.collection.createIndex({ createdAt: -1 });
    console.log('✓ Notification indexes created');
    
    return true;
  } catch (error) {
    console.error('Error creating indexes:', error.message);
    return false;
  }
};

const seedDefaultUsers = async () => {
  try {
    console.log('\n=== Seeding Default Users ===');
    
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      console.log(`Found ${existingUsers} existing users. Skipping user seeding.`);
      return await User.find();
    }
    
    const defaultUsers = [
      {
        username: 'admin',
        email: 'admin@loanmanagement.com',
        password: 'admin123',
        role: 'admin',
        fullName: 'Admin User',
        phoneNumber: '9876543210',
        isActive: true,
      },
      {
        username: 'verifier',
        email: 'verifier@loanmanagement.com',
        password: 'verifier123',
        role: 'verifier',
        fullName: 'Verifier User',
        phoneNumber: '9876543211',
        isActive: true,
      },
      {
        username: 'collections',
        email: 'collections@loanmanagement.com',
        password: 'collections123',
        role: 'collections',
        fullName: 'Collections Officer',
        phoneNumber: '9876543212',
        isActive: true,
      },
      {
        username: 'supporter',
        email: 'supporter@loanmanagement.com',
        password: 'supporter123',
        role: 'supporter',
        fullName: 'Support Officer',
        phoneNumber: '9876543215',
        isActive: true,
      },
      {
        username: 'credit_manager',
        email: 'creditmanager@loanmanagement.com',
        password: 'credit123',
        role: 'credit_manager',
        fullName: 'Credit Manager',
        phoneNumber: '9876543216',
        isActive: true,
      },
      {
        username: 'shopkeeper1',
        email: 'shopkeeper1@example.com',
        password: 'shop123',
        role: 'shopkeeper',
        fullName: 'Rajesh Kumar',
        phoneNumber: '9876543213',
        isActive: true,
      },
      {
        username: 'shopkeeper2',
        email: 'shopkeeper2@example.com',
        password: 'shop123',
        role: 'shopkeeper',
        fullName: 'Amit Sharma',
        phoneNumber: '9876543214',
        isActive: true,
      },
    ];
    
    const createdUsers = [];
    for (const userData of defaultUsers) {
      const user = await User.create(userData);
      createdUsers.push(user);
      console.log(`✓ Created user: ${user.username} (${user.role})`);
    }
    
    return createdUsers;
  } catch (error) {
    console.error('Error seeding users:', error.message);
    throw error;
  }
};

const verifySchema = async () => {
  try {
    console.log('\n=== Verifying Schema ===');
    
    const userCount = await User.countDocuments();
    const loanCount = await Loan.countDocuments();
    const customerCount = await Customer.countDocuments();
    const shopkeeperCount = await Shopkeeper.countDocuments();
    const notificationCount = await Notification.countDocuments();
    const paymentCount = await Payment.countDocuments();
    
    console.log(`Users: ${userCount}`);
    console.log(`Loans: ${loanCount}`);
    console.log(`Customers: ${customerCount}`);
    console.log(`Shopkeepers: ${shopkeeperCount}`);
    console.log(`Notifications: ${notificationCount}`);
    console.log(`Payments: ${paymentCount}`);
    
    return true;
  } catch (error) {
    console.error('Error verifying schema:', error.message);
    return false;
  }
};

const testConnection = async () => {
  try {
    console.log('\n=== Testing Database Operations ===');
    
    // Test read
    const users = await User.find().limit(1);
    console.log('✓ Read operation successful');
    
    // Test write (create a test notification)
    const testNotification = await Notification.create({
      type: 'info',
      title: 'Database Initialized',
      message: 'Database schema has been successfully initialized',
      severity: 'low',
      targetRole: 'admin',
    });
    console.log('✓ Write operation successful');
    
    // Test delete
    await Notification.findByIdAndDelete(testNotification._id);
    console.log('✓ Delete operation successful');
    
    return true;
  } catch (error) {
    console.error('Error testing operations:', error.message);
    return false;
  }
};

const initializeDatabase = async () => {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║  Database Initialization Script       ║');
  console.log('╚════════════════════════════════════════╝\n');
  
  try {
    // Step 1: Connect to database
    const connected = await connectDB();
    if (!connected) {
      console.error('\n✗ Failed to connect to database');
      process.exit(1);
    }
    
    // Step 2: Check existing collections
    await checkCollections();
    
    // Step 3: Create indexes
    const indexesCreated = await createIndexes();
    if (!indexesCreated) {
      console.warn('\n⚠ Warning: Some indexes may not have been created');
    }
    
    // Step 4: Seed default users
    const users = await seedDefaultUsers();
    
    // Step 5: Verify schema
    await verifySchema();
    
    // Step 6: Test operations
    const testsPassed = await testConnection();
    if (!testsPassed) {
      console.warn('\n⚠ Warning: Some tests failed');
    }
    
    // Success summary
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║  Database Initialized Successfully!   ║');
    console.log('╚════════════════════════════════════════╝\n');
    
    console.log('Default Login Credentials:');
    console.log('─────────────────────────────────────────');
    console.log('Admin:          admin@loanmanagement.com / admin123');
    console.log('Verifier:       verifier@loanmanagement.com / verifier123');
    console.log('Collections:    collections@loanmanagement.com / collections123');
    console.log('Supporter:      supporter@loanmanagement.com / supporter123');
    console.log('Credit Manager: creditmanager@loanmanagement.com / credit123');
    console.log('Shopkeeper 1:   shopkeeper1@example.com / shop123');
    console.log('Shopkeeper 2:   shopkeeper2@example.com / shop123');
    console.log('─────────────────────────────────────────\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n✗ Database initialization failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
};

// Run initialization
initializeDatabase();
