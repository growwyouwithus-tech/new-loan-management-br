import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const fixShopkeeper2 = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected\n');
    
    // Find and update shopkeeper2
    const shopkeeper2 = await User.findOne({ email: 'shopkeeper2@example.com' });
    
    if (!shopkeeper2) {
      console.log('❌ Shopkeeper 2 not found. Creating new user...');
      
      const newShopkeeper = await User.create({
        username: 'shopkeeper2',
        email: 'shopkeeper2@example.com',
        password: 'shop123',
        role: 'shopkeeper',
        fullName: 'Amit Sharma',
        phoneNumber: '9876543214',
      });
      
      console.log('✅ Shopkeeper 2 created successfully');
      console.log('   Email:', newShopkeeper.email);
      console.log('   Password: shop123');
    } else {
      console.log('✅ Shopkeeper 2 found. Updating password...');
      
      shopkeeper2.password = 'shop123';
      await shopkeeper2.save();
      
      console.log('✅ Password updated successfully');
      console.log('   Email:', shopkeeper2.email);
      console.log('   Password: shop123');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

fixShopkeeper2();
