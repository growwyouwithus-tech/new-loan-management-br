import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Loan from '../models/Loan.js';
import Customer from '../models/Customer.js';
import Shopkeeper from '../models/Shopkeeper.js';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const seedUsers = async () => {
  try {
    await User.deleteMany();

    const users = [
      {
        username: 'admin',
        email: 'admin@loanmanagement.com',
        password: 'admin123',
        role: 'admin',
        fullName: 'Admin User',
        phoneNumber: '9876543210',
      },
      {
        username: 'verifier',
        email: 'verifier@loanmanagement.com',
        password: 'verifier123',
        role: 'verifier',
        fullName: 'Verifier User',
        phoneNumber: '9876543211',
      },
      {
        username: 'collections',
        email: 'collections@loanmanagement.com',
        password: 'collections123',
        role: 'collections',
        fullName: 'Collections Officer',
        phoneNumber: '9876543212',
      },
      {
        username: 'shopkeeper1',
        email: 'shopkeeper1@example.com',
        password: 'shop123',
        role: 'shopkeeper',
        fullName: 'Rajesh Kumar',
        phoneNumber: '9876543213',
      },
      {
        username: 'shopkeeper2',
        email: 'shopkeeper2@example.com',
        password: 'shop123',
        role: 'shopkeeper',
        fullName: 'Amit Sharma',
        phoneNumber: '9876543214',
      },
    ];

    const createdUsers = await User.insertMany(users);
    console.log('Users seeded successfully');
    return createdUsers;
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
};

const seedCustomers = async () => {
  try {
    await Customer.deleteMany();

    const customers = [
      {
        fullName: 'Suresh Patel',
        fatherName: 'Ramesh Patel',
        phoneNumber: '9123456780',
        email: 'suresh@example.com',
        aadharNumber: '123456789012',
        address: '123 Main Street, Sector 5',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        occupation: 'Business',
        monthlyIncome: 50000,
      },
      {
        fullName: 'Priya Singh',
        fatherName: 'Vijay Singh',
        phoneNumber: '9123456781',
        email: 'priya@example.com',
        aadharNumber: '123456789013',
        address: '456 Park Road, Andheri',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400058',
        occupation: 'Service',
        monthlyIncome: 35000,
      },
      {
        fullName: 'Rahul Verma',
        fatherName: 'Mohan Verma',
        phoneNumber: '9123456782',
        email: 'rahul@example.com',
        aadharNumber: '123456789014',
        address: '789 Lake View, Bandra',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400050',
        occupation: 'Business',
        monthlyIncome: 60000,
      },
    ];

    const createdCustomers = await Customer.insertMany(customers);
    console.log('Customers seeded successfully');
    return createdCustomers;
  } catch (error) {
    console.error('Error seeding customers:', error);
    throw error;
  }
};

const seedShopkeepers = async (users) => {
  try {
    await Shopkeeper.deleteMany();

    const shopkeeperUsers = users.filter(u => u.role === 'shopkeeper');

    const shopkeepers = [
      {
        shopkeeperId: `SK${Date.now().toString().slice(-6)}`,
        userId: shopkeeperUsers[0]._id,
        shopName: 'Kumar Electronics',
        ownerName: 'Rajesh Kumar',
        phoneNumber: '9876543213',
        email: 'shopkeeper1@example.com',
        address: '101 Market Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        aadharNumber: '987654321001',
        kycStatus: 'verified',
        registrationDate: new Date().toISOString().split('T')[0],
      },
      {
        shopkeeperId: `SK${(Date.now() + 1).toString().slice(-6)}`,
        userId: shopkeeperUsers[1]._id,
        shopName: 'Sharma General Store',
        ownerName: 'Amit Sharma',
        phoneNumber: '9876543214',
        email: 'shopkeeper2@example.com',
        address: '202 Shopping Complex',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400002',
        aadharNumber: '987654321002',
        kycStatus: 'pending',
        registrationDate: new Date().toISOString().split('T')[0],
      },
    ];

    const createdShopkeepers = await Shopkeeper.insertMany(shopkeepers);
    console.log('Shopkeepers seeded successfully');
    return createdShopkeepers;
  } catch (error) {
    console.error('Error seeding shopkeepers:', error);
    throw error;
  }
};

const seedLoans = async (shopkeepers, customers) => {
  try {
    await Loan.deleteMany();

    const loans = [
      {
        loanId: customers[0].aadharNumber,
        clientName: customers[0].fullName,
        clientPhone: customers[0].phoneNumber,
        clientAadharNumber: customers[0].aadharNumber,
        clientAddress: customers[0].address,
        loanAmount: 50000,
        interestRate: 12,
        tenure: 12,
        emiAmount: 4442,
        status: 'Pending',
        appliedDate: new Date().toISOString().split('T')[0],
        emiStartDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        emisRemaining: 12,
        shopkeeperId: shopkeepers[0].userId,
        customerId: customers[0]._id,
      },
      {
        loanId: customers[1].aadharNumber,
        clientName: customers[1].fullName,
        clientPhone: customers[1].phoneNumber,
        clientAadharNumber: customers[1].aadharNumber,
        clientAddress: customers[1].address,
        loanAmount: 30000,
        interestRate: 10,
        tenure: 10,
        emiAmount: 3158,
        status: 'Verified',
        kycStatus: 'verified',
        appliedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        emiStartDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        verifiedDate: new Date().toISOString().split('T')[0],
        emisRemaining: 10,
        shopkeeperId: shopkeepers[0].userId,
        customerId: customers[1]._id,
      },
      {
        loanId: customers[2].aadharNumber,
        clientName: customers[2].fullName,
        clientPhone: customers[2].phoneNumber,
        clientAadharNumber: customers[2].aadharNumber,
        clientAddress: customers[2].address,
        loanAmount: 75000,
        interestRate: 15,
        tenure: 15,
        emiAmount: 5583,
        status: 'Approved',
        kycStatus: 'verified',
        appliedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        emiStartDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        verifiedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        approvedDate: new Date().toISOString().split('T')[0],
        emisRemaining: 15,
        shopkeeperId: shopkeepers[1].userId,
        customerId: customers[2]._id,
      },
    ];

    const createdLoans = await Loan.insertMany(loans);
    console.log('Loans seeded successfully');
    return createdLoans;
  } catch (error) {
    console.error('Error seeding loans:', error);
    throw error;
  }
};

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('Starting database seeding...');

    const users = await seedUsers();
    const customers = await seedCustomers();
    const shopkeepers = await seedShopkeepers(users);
    const loans = await seedLoans(shopkeepers, customers);

    console.log('\n=================================');
    console.log('Database seeded successfully!');
    console.log('=================================');
    console.log('\nDefault Users:');
    console.log('Admin: admin@loanmanagement.com / admin123');
    console.log('Verifier: verifier@loanmanagement.com / verifier123');
    console.log('Collections: collections@loanmanagement.com / collections123');
    console.log('Shopkeeper 1: shopkeeper1@example.com / shop123');
    console.log('Shopkeeper 2: shopkeeper2@example.com / shop123');
    console.log('=================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
