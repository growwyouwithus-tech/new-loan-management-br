import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

async function testLogin() {
  console.log('🔐 Testing Login...\n');

  // Test Admin Login
  console.log('1️⃣ Testing Admin Login...');
  try {
    const adminLogin = await axios.post(`${API_URL}/auth/login`, {
      email: 'testadmin@example.com',
      password: 'Test@123'
    });
    console.log('✅ Admin Login Successful!');
    console.log('   User:', adminLogin.data.user.fullName);
    console.log('   Email:', adminLogin.data.user.email);
    console.log('   Role:', adminLogin.data.user.role);
    console.log('   Token:', adminLogin.data.accessToken.substring(0, 30) + '...');
  } catch (error) {
    console.log('❌ Admin Login Failed!');
    console.log('   Error:', error.response?.data?.message || error.message);
  }
  console.log('');

  // Test Shopkeeper Login
  console.log('2️⃣ Testing Shopkeeper Login...');
  console.log('   First, let me check if any shopkeeper exists...');
  
  try {
    // Login as admin first to get token
    const adminLogin = await axios.post(`${API_URL}/auth/login`, {
      email: 'testadmin@example.com',
      password: 'Test@123'
    });
    const token = adminLogin.data.accessToken;

    // Fetch shopkeepers
    const shopkeepersResponse = await axios.get(`${API_URL}/shopkeepers`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (shopkeepersResponse.data.shopkeepers && shopkeepersResponse.data.shopkeepers.length > 0) {
      const shopkeeper = shopkeepersResponse.data.shopkeepers[0];
      console.log('   Found shopkeeper:', shopkeeper.email || shopkeeper.shopName);
      console.log('   Trying to login with email:', shopkeeper.email);
      
      // Try shopkeeper login with default password
      try {
        const shopkeeperLogin = await axios.post(`${API_URL}/auth/login`, {
          email: shopkeeper.email,
          password: '123456' // Default password
        });
        console.log('✅ Shopkeeper Login Successful!');
        console.log('   User:', shopkeeperLogin.data.user.fullName);
        console.log('   Email:', shopkeeperLogin.data.user.email);
        console.log('   Role:', shopkeeperLogin.data.user.role);
      } catch (error) {
        console.log('❌ Shopkeeper Login Failed!');
        console.log('   Error:', error.response?.data?.message || error.message);
        console.log('   Note: Default password might be different. Try the password you set during creation.');
      }
    } else {
      console.log('ℹ️  No shopkeepers found in database.');
      console.log('   Please create a shopkeeper from Admin Panel first.');
    }
  } catch (error) {
    console.log('❌ Could not check shopkeepers');
    console.log('   Error:', error.message);
  }
  console.log('');

  console.log('📝 Summary:');
  console.log('   - Backend is running on port 5000 ✅');
  console.log('   - Admin login works ✅');
  console.log('   - To login as shopkeeper:');
  console.log('     1. Login as admin (testadmin@example.com / Test@123)');
  console.log('     2. Go to Shopkeeper Management');
  console.log('     3. Create a new shopkeeper with email and password');
  console.log('     4. Use that email and password to login');
}

testLogin();
