import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

async function testAPI() {
  console.log('🧪 Testing API Endpoints...\n');

  try {
    // Test 1: Check API is running
    console.log('1️⃣ Testing API health...');
    const health = await axios.get('http://localhost:5000');
    console.log('✅ API is running:', health.data.message);
    console.log('');

    // Test 2: Register a test user (admin)
    console.log('2️⃣ Testing user registration...');
    try {
      const registerData = {
        username: 'testadmin',
        email: 'testadmin@example.com',
        password: 'Test@123',
        role: 'admin',
        fullName: 'Test Admin',
        phoneNumber: '9876543210'
      };
      
      const registerResponse = await axios.post(`${API_URL}/auth/register`, registerData);
      console.log('✅ User registered:', registerResponse.data.user.username);
      console.log('   Token:', registerResponse.data.accessToken.substring(0, 20) + '...');
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
        console.log('ℹ️  User already exists, skipping registration');
      } else {
        throw error;
      }
    }
    console.log('');

    // Test 3: Login
    console.log('3️⃣ Testing login...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'testadmin@example.com',
      password: 'Test@123'
    });
    console.log('✅ Login successful');
    const token = loginResponse.data.accessToken;
    console.log('   User:', loginResponse.data.user.fullName);
    console.log('   Role:', loginResponse.data.user.role);
    console.log('');

    // Test 4: Create a customer
    console.log('4️⃣ Testing customer creation...');
    let customerId;
    try {
      const customerData = {
        fullName: 'Test Customer',
        fatherName: 'Test Father',
        phoneNumber: '9876543211',
        email: 'testcustomer@example.com',
        aadharNumber: '123456789012',
        address: 'Test Address',
        city: 'Test City',
        state: 'Test State',
        pincode: '123456',
        kycStatus: 'pending'
      };
      
      const customerResponse = await axios.post(`${API_URL}/customers`, customerData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Customer created:', customerResponse.data.customer.fullName);
      console.log('   Customer ID:', customerResponse.data.customer._id);
      customerId = customerResponse.data.customer._id;
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
        console.log('ℹ️  Customer already exists, fetching existing customer...');
        const customersResponse = await axios.get(`${API_URL}/customers`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const existingCustomer = customersResponse.data.customers.find(c => c.aadharNumber === '123456789012');
        customerId = existingCustomer._id;
        console.log('✅ Using existing customer:', existingCustomer.fullName);
        console.log('   Customer ID:', customerId);
      } else {
        throw error;
      }
    }
    console.log('');

    // Test 5: Create a loan
    console.log('5️⃣ Testing loan creation...');
    const loanData = {
      customerId: customerId,
      clientName: 'Test Customer',
      clientPhone: '9876543211',
      clientAadharNumber: '123456789012',
      clientAddress: 'Test Address, Test City, Test State - 123456',
      loanAmount: 50000,
      tenure: 12,
      interestRate: 12,
      emiAmount: 4442,
      purpose: 'Business',
      status: 'Pending',
      appliedDate: new Date().toISOString().split('T')[0]
    };
    
    const loanResponse = await axios.post(`${API_URL}/loans`, loanData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Loan created:', loanResponse.data.loan.clientName);
    console.log('   Loan ID:', loanResponse.data.loan._id);
    console.log('   Amount:', loanResponse.data.loan.loanAmount);
    console.log('   Status:', loanResponse.data.loan.status);
    console.log('');

    // Test 6: Fetch all loans
    console.log('6️⃣ Testing loan fetch...');
    const loansResponse = await axios.get(`${API_URL}/loans`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Loans fetched:', loansResponse.data.loans.length, 'loans found');
    console.log('');

    // Test 7: Fetch all customers
    console.log('7️⃣ Testing customer fetch...');
    const customersResponse = await axios.get(`${API_URL}/customers`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Customers fetched:', customersResponse.data.customers.length, 'customers found');
    console.log('');

    console.log('🎉 All API tests passed!\n');
    console.log('✅ Database is working correctly!');
    console.log('✅ Data is being saved to MongoDB!');
    
  } catch (error) {
    console.error('\n❌ API Test Failed!');
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    process.exit(1);
  }
}

testAPI();
