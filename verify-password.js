import mongoose from 'mongoose';
import User from './models/User.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const verifyPasswords = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected\n');
    
    // Get admin user
    const admin = await User.findOne({ email: 'admin@loanmanagement.com' });
    
    if (!admin) {
      console.log('❌ Admin user not found in database!');
      console.log('Run: npm run seed');
      process.exit(1);
    }
    
    console.log('✅ Admin user found:');
    console.log('   Email:', admin.email);
    console.log('   Username:', admin.username);
    console.log('   Role:', admin.role);
    console.log('   Password Hash:', admin.password.substring(0, 30) + '...');
    console.log('');
    
    // Test password comparison
    console.log('🔐 Testing password: "admin123"');
    const isMatch = await admin.comparePassword('admin123');
    
    if (isMatch) {
      console.log('✅ Password matches! Login should work.');
    } else {
      console.log('❌ Password does NOT match!');
      console.log('   This means the password in database is different.');
      console.log('   Need to reset password or re-seed database.');
    }
    
    console.log('');
    console.log('📝 Testing bcrypt directly:');
    const testHash = await bcrypt.hash('admin123', 10);
    console.log('   New hash for "admin123":', testHash.substring(0, 30) + '...');
    const directCompare = await bcrypt.compare('admin123', admin.password);
    console.log('   Direct bcrypt compare result:', directCompare);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

verifyPasswords();
