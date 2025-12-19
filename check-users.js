import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const checkUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
    
    const users = await User.find().select('email username role fullName');
    
    console.log('\n=================================');
    console.log('Real Database Users');
    console.log('=================================\n');
    
    users.forEach(user => {
      console.log(`Email: ${user.email}`);
      console.log(`Username: ${user.username}`);
      console.log(`Role: ${user.role}`);
      console.log(`Name: ${user.fullName}`);
      console.log('---');
    });
    
    console.log(`\nTotal Users: ${users.length}`);
    console.log('=================================\n');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

checkUsers();
