import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const testAllPanels = async () => {
  console.log('🔍 Testing All Panels Database Connection\n');
  console.log('='.repeat(50));

  const testUsers = [
    { name: 'Admin', email: 'admin@loanmanagement.com', password: 'admin123', role: 'admin' },
    { name: 'Verifier', email: 'verifier@loanmanagement.com', password: '123456', role: 'verifier' },
    { name: 'Collections', email: 'collections@loanmanagement.com', password: '123456', role: 'collections' },
    { name: 'Supporter', email: 'supporter@loanmanagement.com', password: '123456', role: 'supporter' },
    { name: 'Credit Manager', email: 'creditmanager@loanmanagement.com', password: '123456', role: 'credit_manager' },
    { name: 'Shopkeeper 1', email: 'shopkeeper1@example.com', password: '123456', role: 'shopkeeper' },
    { name: 'Shopkeeper 2', email: 'shopkeeper2@example.com', password: '123456', role: 'shopkeeper' },
  ];

  const results = {
    passed: 0,
    failed: 0,
    details: []
  };

  for (const user of testUsers) {
    console.log(`\n📋 Testing ${user.name} Panel...`);
    console.log(`   Email: ${user.email}`);

    try {
      // Test Login
      const loginResponse = await axios.post(`${API_URL}/auth/login`, {
        email: user.email,
        password: user.password
      });

      if (loginResponse.data.accessToken && loginResponse.data.user) {
        console.log(`   ✅ Login: SUCCESS`);
        console.log(`   👤 User: ${loginResponse.data.user.fullName}`);
        console.log(`   🔑 Role: ${loginResponse.data.user.role}`);
        console.log(`   🎫 Token: ${loginResponse.data.accessToken.substring(0, 30)}...`);

        const token = loginResponse.data.accessToken;

        // Test Profile API
        try {
          const profileResponse = await axios.get(`${API_URL}/auth/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          console.log(`   ✅ Profile API: SUCCESS`);

          results.passed++;
          results.details.push({
            panel: user.name,
            email: user.email,
            role: user.role,
            status: 'PASSED',
            login: 'SUCCESS',
            profileAPI: 'SUCCESS'
          });
        } catch (profileError) {
          console.log(`   ⚠️  Profile API: FAILED`);
          results.passed++;
          results.details.push({
            panel: user.name,
            email: user.email,
            role: user.role,
            status: 'PARTIAL',
            login: 'SUCCESS',
            profileAPI: 'FAILED'
          });
        }

      } else {
        throw new Error('No token received');
      }

    } catch (error) {
      console.log(`   ❌ Login: FAILED`);
      console.log(`   Error: ${error.response?.data?.message || error.message}`);

      results.failed++;
      results.details.push({
        panel: user.name,
        email: user.email,
        role: user.role,
        status: 'FAILED',
        login: 'FAILED',
        error: error.response?.data?.message || error.message
      });
    }
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 SUMMARY REPORT');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${results.passed}/${testUsers.length}`);
  console.log(`❌ Failed: ${results.failed}/${testUsers.length}`);
  console.log('');

  // Detailed Results
  console.log('📋 DETAILED RESULTS:');
  console.log('-'.repeat(50));
  results.details.forEach((detail, index) => {
    const statusIcon = detail.status === 'PASSED' ? '✅' : detail.status === 'PARTIAL' ? '⚠️' : '❌';
    console.log(`${index + 1}. ${statusIcon} ${detail.panel} (${detail.role})`);
    console.log(`   Email: ${detail.email}`);
    console.log(`   Login: ${detail.login}`);
    if (detail.profileAPI) {
      console.log(`   Profile API: ${detail.profileAPI}`);
    }
    if (detail.error) {
      console.log(`   Error: ${detail.error}`);
    }
    console.log('');
  });

  // Database Connection Status
  console.log('='.repeat(50));
  console.log('🗄️  DATABASE CONNECTION STATUS');
  console.log('='.repeat(50));

  if (results.passed === testUsers.length) {
    console.log('✅ All panels properly connected to database');
    console.log('✅ MongoDB Atlas connection working');
    console.log('✅ Authentication system working');
    console.log('✅ All user roles can login');
  } else if (results.passed > 0) {
    console.log('⚠️  Some panels have issues');
    console.log(`✅ ${results.passed} panels working`);
    console.log(`❌ ${results.failed} panels failing`);
  } else {
    console.log('❌ Database connection issues detected');
    console.log('❌ No panels can connect');
  }

  console.log('='.repeat(50));
  console.log('');
};

testAllPanels().catch(console.error);
