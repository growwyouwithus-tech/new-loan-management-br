import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const testConnection = async () => {
  console.log('🔍 Testing Database Connection...\n');
  console.log('📋 Configuration:');
  console.log(`   MONGODB_URI: ${process.env.MONGODB_URI || 'NOT SET'}`);
  console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'NOT SET'}\n`);

  try {
    console.log('⏳ Connecting to MongoDB...');
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // 5 second timeout
    });

    console.log('✅ MongoDB Connected Successfully!');
    console.log(`   Host: ${conn.connection.host}`);
    console.log(`   Database: ${conn.connection.name}`);
    console.log(`   Port: ${conn.connection.port}`);
    console.log(`   Connection State: ${conn.connection.readyState === 1 ? 'Connected' : 'Not Connected'}\n`);

    // Test a simple query
    console.log('🧪 Testing database operations...');
    const collections = await conn.connection.db.listCollections().toArray();
    console.log(`   Collections found: ${collections.length}`);
    if (collections.length > 0) {
      console.log('   Collection names:', collections.map(c => c.name).join(', '));
    }

    console.log('\n✅ Database connection test PASSED!\n');
    
    await mongoose.connection.close();
    console.log('🔌 Connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Database connection test FAILED!');
    console.error(`   Error: ${error.message}\n`);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.error('💡 Possible issues:');
      console.error('   1. MongoDB server is not running');
      console.error('   2. Check if MongoDB is installed');
      console.error('   3. Start MongoDB with: mongod\n');
    } else if (error.message.includes('authentication failed')) {
      console.error('💡 Possible issues:');
      console.error('   1. Wrong username or password in MONGODB_URI');
      console.error('   2. Check your .env file\n');
    } else if (error.message.includes('MONGODB_URI')) {
      console.error('💡 Possible issues:');
      console.error('   1. MONGODB_URI not set in .env file');
      console.error('   2. Create .env file from .env.example\n');
    }
    
    process.exit(1);
  }
};

testConnection();
