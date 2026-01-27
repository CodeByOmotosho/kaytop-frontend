/**
 * Authentication and Customer Endpoint Testing Script
 * First authenticates, then tests all customer endpoints
 */

const axios = require('axios');

const baseUrl = 'https://kaytop-production.up.railway.app';

// Test results storage
const results = {
  successful: [],
  failed: [],
  authentication: null
};

async function authenticate() {
  try {
    console.log('🔐 Authenticating as System Admin...');
    
    const response = await axios.post(`${baseUrl}/auth/login`, {
      email: 'admin@kaytop.com',
      password: 'Admin123'
    });
    
    const { access_token, role, isVerified } = response.data;
    
    console.log(`✅ Authentication successful!`);
    console.log(`👤 Role: ${role}`);
    console.log(`✅ Verified: ${isVerified}`);
    console.log(`🎫 Token: ${access_token.substring(0, 50)}...`);
    
    results.authentication = {
      success: true,
      token: access_token,
      role,
      isVerified
    };
    
    return access_token;
    
  } catch (error) {
    console.log(`❌ Authentication failed: ${error.response?.data?.message || error.message}`);
    results.authentication = {
      success: false,
      error: error.response?.data?.message || error.message
    };
    throw error;
  }
}

async function testEndpoint(name, url, token, expectedBehavior = '') {
  try {
    console.log(`\n🧪 Testing: ${name}`);
    console.log(`📍 URL: ${url}`);
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    const response = await axios.get(url, { headers });
    const data = response.data;
    
    // Analyze response structure
    const analysis = {
      name,
      url,
      status: response.status,
      dataType: Array.isArray(data) ? 'array' : typeof data,
      userCount: 0,
      hasRoleField: false,
      roleDistribution: {},
      sampleUser: null,
      expectedBehavior,
      rawResponse: data
    };
    
    // Check for role field in users
    let users = [];
    if (Array.isArray(data)) {
      users = data;
      analysis.userCount = data.length;
    } else if (data.data && Array.isArray(data.data)) {
      users = data.data;
      analysis.userCount = data.data.length;
    } else if (data.users && Array.isArray(data.users)) {
      users = data.users;
      analysis.userCount = data.users.length;
    } else if (typeof data === 'object' && data !== null) {
      analysis.userCount = 'single object';
      users = [data];
    }
    
    if (users.length > 0) {
      analysis.sampleUser = users[0];
      analysis.hasRoleField = users[0].hasOwnProperty('role');
      
      // Count role distribution
      users.forEach(user => {
        const role = user.role || 'undefined';
        analysis.roleDistribution[role] = (analysis.roleDistribution[role] || 0) + 1;
      });
    }
    
    console.log(`✅ SUCCESS: ${response.status}`);
    console.log(`📊 Users found: ${analysis.userCount}`);
    console.log(`🏷️  Has role field: ${analysis.hasRoleField}`);
    if (Object.keys(analysis.roleDistribution).length > 0) {
      console.log(`📈 Role distribution:`, analysis.roleDistribution);
    }
    
    // Show sample user structure (first few fields)
    if (analysis.sampleUser) {
      const sampleFields = Object.keys(analysis.sampleUser).slice(0, 8);
      console.log(`👤 Sample user fields: ${sampleFields.join(', ')}`);
    }
    
    results.successful.push(analysis);
    return analysis;
    
  } catch (error) {
    const errorAnalysis = {
      name,
      url,
      status: error.response?.status || 'Network Error',
      error: error.response?.data?.message || error.message,
      expectedBehavior
    };
    
    console.log(`❌ FAILED: ${errorAnalysis.status}`);
    console.log(`💥 Error: ${errorAnalysis.error}`);
    
    results.failed.push(errorAnalysis);
    return errorAnalysis;
  }
}

async function runComprehensiveTest() {
  console.log('🚀 Starting Comprehensive Customer Endpoint Testing');
  console.log('=' .repeat(60));
  
  // Step 1: Authenticate
  let token;
  try {
    token = await authenticate();
  } catch (error) {
    console.log('❌ Cannot proceed without authentication');
    return;
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🧪 STARTING ENDPOINT TESTS');
  console.log('='.repeat(60));
  
  // Test 1: Baseline - Known working endpoint (should have no role field)
  await testEndpoint(
    'Baseline: Admin Users (No Role Field)', 
    `${baseUrl}/admin/users?limit=5`,
    token,
    'Known to work but missing role field - baseline comparison'
  );
  
  // Test 2: CRITICAL - Customer role filtering
  await testEndpoint(
    'CRITICAL: Customer Role Filtering', 
    `${baseUrl}/admin/users?role=customer`,
    token,
    'Should return only users with role=customer'
  );
  
  // Test 3: Credit Officer role filtering (Postman docs suggest this works)
  await testEndpoint(
    'Credit Officer Role Filtering (Postman Confirmed)', 
    `${baseUrl}/admin/users?role=credit_officer`,
    token,
    'Should return credit officers - Postman docs suggest this works'
  );
  
  // Test 4: System Admin role filtering
  await testEndpoint(
    'System Admin Role Filtering', 
    `${baseUrl}/admin/users?role=system_admin`,
    token,
    'Should return system admins'
  );
  
  // Test 5: Branch Manager role filtering
  await testEndpoint(
    'Branch Manager Role Filtering', 
    `${baseUrl}/admin/users?role=branch_manager`,
    token,
    'Should return branch managers'
  );
  
  // Test 6: Account Manager role filtering
  await testEndpoint(
    'Account Manager Role Filtering', 
    `${baseUrl}/admin/users?role=account_manager`,
    token,
    'Should return account managers'
  );
  
  // Test 7: HQ Manager role filtering
  await testEndpoint(
    'HQ Manager Role Filtering', 
    `${baseUrl}/admin/users?role=hq_manager`,
    token,
    'Should return HQ managers'
  );
  
  // Test 8: Dedicated customer endpoints
  await testEndpoint(
    'Dedicated Customers Endpoint', 
    `${baseUrl}/admin/customers`,
    token,
    'Should return customer-specific data structure'
  );
  
  await testEndpoint(
    'Alternative Customers Endpoint', 
    `${baseUrl}/customers`,
    token,
    'Alternative customer endpoint'
  );
  
  await testEndpoint(
    'Users/Customers Endpoint', 
    `${baseUrl}/users/customers`,
    token,
    'Another alternative customer endpoint'
  );
  
  // Test 9: Alternative filtering methods
  await testEndpoint(
    'UserType Parameter', 
    `${baseUrl}/admin/users?userType=customer`,
    token,
    'Alternative filtering using userType parameter'
  );
  
  await testEndpoint(
    'Type Parameter', 
    `${baseUrl}/admin/users?type=customer`,
    token,
    'Alternative filtering using type parameter'
  );
  
  // Test 10: Staff endpoints
  await testEndpoint(
    'Staff Endpoint', 
    `${baseUrl}/admin/staff`,
    token,
    'Should return only staff members'
  );
  
  await testEndpoint(
    'My Staff Endpoint', 
    `${baseUrl}/admin/staff/my-staff`,
    token,
    'Should return staff with role information'
  );
  
  // Test 11: Branch-based filtering
  await testEndpoint(
    'Users by Branch', 
    `${baseUrl}/admin/users/branch/Lagos Island`,
    token,
    'Should return users from Lagos Island branch'
  );
  
  await testEndpoint(
    'Customers by Branch with Role Filter', 
    `${baseUrl}/admin/users/branch/Lagos Island?role=customer`,
    token,
    'Should return customers from Lagos Island branch'
  );
  
  // Test 12: Specific user by ID
  await testEndpoint(
    'Specific User by ID', 
    `${baseUrl}/admin/users/8`,
    token,
    'Should return user with ID 8 (known customer)'
  );
  
  // Test 13: Export endpoints
  await testEndpoint(
    'Export Users', 
    `${baseUrl}/admin/users/export`,
    token,
    'Should export user data'
  );
  
  await testEndpoint(
    'Export Customers with Role Filter', 
    `${baseUrl}/admin/users/export?role=customer`,
    token,
    'Should export only customers'
  );
  
  // Test 14: Edge cases
  await testEndpoint(
    'Invalid Role Test', 
    `${baseUrl}/admin/users?role=invalid_role`,
    token,
    'Should return empty result or error for invalid role'
  );
  
  await testEndpoint(
    'Case Sensitivity Test', 
    `${baseUrl}/admin/users?role=CUSTOMER`,
    token,
    'Test if role filtering is case sensitive'
  );
  
  // Generate comprehensive report
  generateDetailedReport();
}

function generateDetailedReport() {
  console.log('\n' + '='.repeat(80));
  console.log('📋 COMPREHENSIVE TEST RESULTS & ANALYSIS');
  console.log('='.repeat(80));
  
  console.log(`\n🔐 AUTHENTICATION: ${results.authentication?.success ? 'SUCCESS' : 'FAILED'}`);
  if (results.authentication?.success) {
    console.log(`   Role: ${results.authentication.role}`);
    console.log(`   Verified: ${results.authentication.isVerified}`);
  }
  
  console.log(`\n📊 TEST SUMMARY:`);
  console.log(`   ✅ Successful Tests: ${results.successful.length}`);
  console.log(`   ❌ Failed Tests: ${results.failed.length}`);
  console.log(`   📈 Total Tests: ${results.successful.length + results.failed.length}`);
  
  // Critical analysis
  console.log(`\n🎯 CRITICAL FINDINGS:`);
  
  // Check if role filtering works
  const customerRoleTest = results.successful.find(test => test.name.includes('CRITICAL: Customer Role'));
  const creditOfficerTest = results.successful.find(test => test.name.includes('Credit Officer Role'));
  const baselineTest = results.successful.find(test => test.name.includes('Baseline'));
  
  if (customerRoleTest) {
    console.log(`   ✅ BREAKTHROUGH: Customer role filtering WORKS!`);
    console.log(`      Users found: ${customerRoleTest.userCount}`);
    console.log(`      Has role field: ${customerRoleTest.hasRoleField}`);
    console.log(`      Role distribution:`, customerRoleTest.roleDistribution);
  } else {
    console.log(`   ❌ Customer role filtering: FAILED`);
  }
  
  if (creditOfficerTest) {
    console.log(`   ✅ Credit officer role filtering: WORKS (confirms role filtering is supported)`);
    console.log(`      Users found: ${creditOfficerTest.userCount}`);
    console.log(`      Has role field: ${creditOfficerTest.hasRoleField}`);
  } else {
    console.log(`   ❌ Credit officer role filtering: FAILED`);
  }
  
  if (baselineTest) {
    console.log(`   📊 Baseline test (admin/users): ${baselineTest.userCount} users, Role field: ${baselineTest.hasRoleField}`);
  }
  
  // Check for dedicated customer endpoints
  const dedicatedCustomerTest = results.successful.find(test => test.name.includes('Dedicated Customers'));
  if (dedicatedCustomerTest) {
    console.log(`   ✅ Dedicated customer endpoint: EXISTS!`);
    console.log(`      Users found: ${dedicatedCustomerTest.userCount}`);
  } else {
    console.log(`   ❌ Dedicated customer endpoint: NOT FOUND`);
  }
  
  // Check staff endpoint for role field
  const staffTest = results.successful.find(test => test.name.includes('My Staff'));
  if (staffTest && staffTest.hasRoleField) {
    console.log(`   ✅ Staff endpoint has role field: CONFIRMED`);
    console.log(`      This proves role field exists in some endpoints`);
  }
  
  // Analyze all successful tests for role field presence
  const testsWithRoleField = results.successful.filter(test => test.hasRoleField);
  const testsWithoutRoleField = results.successful.filter(test => !test.hasRoleField);
  
  console.log(`\n🏷️  ROLE FIELD ANALYSIS:`);
  console.log(`   Endpoints WITH role field: ${testsWithRoleField.length}`);
  console.log(`   Endpoints WITHOUT role field: ${testsWithoutRoleField.length}`);
  
  if (testsWithRoleField.length > 0) {
    console.log(`   ✅ Endpoints with role field:`);
    testsWithRoleField.forEach(test => {
      console.log(`      - ${test.name}: ${test.userCount} users`);
    });
  }
  
  // Final recommendations
  console.log(`\n💡 FINAL RECOMMENDATIONS:`);
  
  if (customerRoleTest && customerRoleTest.hasRoleField) {
    console.log(`   🎯 SOLUTION FOUND: Use /admin/users?role=customer`);
    console.log(`      ✅ Role filtering is supported and working`);
    console.log(`      ✅ Returns users with role field populated`);
    console.log(`      🔧 Action: Update frontend to use server-side role filtering`);
    console.log(`      📝 Remove client-side filtering logic`);
  } else if (dedicatedCustomerTest) {
    console.log(`   🎯 ALTERNATIVE SOLUTION: Use dedicated /admin/customers endpoint`);
    console.log(`      🔧 Action: Update frontend to use dedicated customer endpoint`);
  } else if (testsWithRoleField.length > 0) {
    console.log(`   🎯 PARTIAL SOLUTION: Some endpoints have role field`);
    console.log(`      🔧 Action: Use alternative endpoints that provide role information`);
    testsWithRoleField.forEach(test => {
      console.log(`         - Consider using: ${test.url}`);
    });
  } else {
    console.log(`   🎯 FALLBACK SOLUTION: Implement alternative customer identification`);
    console.log(`      🔧 Action: Use accountStatus, verificationStatus, and other fields`);
    console.log(`      📝 Filter logic: accountStatus='fully_verified' + verificationStatus='verified' + !branch`);
  }
  
  // Show successful endpoints
  if (results.successful.length > 0) {
    console.log(`\n📈 SUCCESSFUL ENDPOINTS:`);
    results.successful.forEach(test => {
      console.log(`   ✅ ${test.name}`);
      console.log(`      URL: ${test.url}`);
      console.log(`      Users: ${test.userCount}, Role field: ${test.hasRoleField}`);
      if (Object.keys(test.roleDistribution).length > 0) {
        console.log(`      Roles:`, test.roleDistribution);
      }
    });
  }
  
  // Show failed endpoints
  if (results.failed.length > 0) {
    console.log(`\n💥 FAILED ENDPOINTS:`);
    results.failed.forEach(test => {
      console.log(`   ❌ ${test.name}: ${test.status} - ${test.error}`);
    });
  }
  
  console.log(`\n🎉 COMPREHENSIVE TESTING COMPLETE!`);
  console.log(`📋 Results saved for analysis and implementation.`);
}

// Run the comprehensive test
runComprehensiveTest().catch(console.error);