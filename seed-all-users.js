import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const usersToSeed = [
  {
    username: 'admin',
    email: 'admin@loanmanagement.com',
    password: 'admin123',
    role: 'admin',
    fullName: 'Admin User',
    phoneNumber: '9999999991'
  },
  {
    username: 'verifier',
    email: 'verifier@loanmanagement.com',
    password: '123456', // Simple password for testing
    role: 'verifier',
    fullName: 'Verifier User',
    phoneNumber: '9999999992'
  },
  {
    username: 'collections',
    email: 'collections@loanmanagement.com',
    password: '123456',
    role: 'collections',
    fullName: 'Collections Agent',
    phoneNumber: '9999999993'
  },
  {
    username: 'supporter',
    email: 'supporter@loanmanagement.com',
    password: '123456',
    role: 'supporter',
    fullName: 'Support Staff',
    phoneNumber: '9999999994'
  },
  {
    username: 'credit_manager',
    email: 'creditmanager@loanmanagement.com',
    password: '123456',
    role: 'credit_manager',
    fullName: 'Credit Manager',
    phoneNumber: '9999999995'
  },
  {
    username: 'shopkeeper1',
    email: 'shopkeeper1@example.com',
    password: '123456',
    role: 'shopkeeper',
    fullName: 'Shopkeeper One',
    phoneNumber: '9999999996'
  },
  {
    username: 'shopkeeper2',
    email: 'shopkeeper2@example.com',
    password: '123456',
    role: 'shopkeeper',
    fullName: 'Shopkeeper Two',
    phoneNumber: '9999999997'
  }
];

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
    
    // We will upsert users based on email to avoid duplicates but ensure they exist with known passwords
    for (const userData of usersToSeed) {
      const { email, password, ...otherData } = userData;
      
      // Hash password manually if updating, or reliance on pre-save hook might be tricky with findOneAndUpdate if not careful.
      // Easiest is to find, if exists update, if not create. 
      // Actually, to ensure the password is KNOWN, we should explicitly set it.
      
      let user = await User.findOne({ email });
      
      if (user) {
        console.log(`🔄 Updating existing user: ${email}`);
        user.password = password; // pre-save hook will hash this
        user.role = otherData.role;
        user.username = otherData.username;
        user.fullName = otherData.fullName;
        user.phoneNumber = otherData.phoneNumber;
        await user.save();
      } else {
        console.log(`✨ Creating new user: ${email}`);
        await User.create(userData); // pre-save will hash password
      }
    }

    console.log('\n✅ All test users seeded/updated successfully!');
    console.log('   Default password for non-admin is: 123456');
    console.log('   Admin password is: admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    process.exit(1);
  }
};

seedUsers();
