/**
 * Thorough Customer Endpoint Testing Script
 * Tests all possible customer data access methods
 */

const axios = require('axios');

const baseUrl = 'https://kaytop-production.up.railway.app';
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluQGtheXRvcC5jb20iLCJzdWIiOjEsInJvbGUiOiJzeXN0ZW1fYWRtaW4iLCJpYXQiOjE3Mzc2MzE4NzV9.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};

// Test results storage
const results = {
  successful: [],
  failed: [],
  summary: {}
};

async function testEndpoint(name, url, expectedBehavior = '') {
  try {
    console.log(`\n🧪 Testing: ${name}`);
    console.log(`📍 URL: ${url}`);
    
    const response = await axios.get(url, { headers });
    const data = response.data;
    
    // Analyze response structure
    const analysis = {
      name,
      url,
      status: response.status,
      dataType: Array.isArray(data) ? 'array' : typeof data,
      userCount: Array.isArray(data) ? data.length : (data.data && Array.isArray(data.data) ? data.data.length : 'unknown'),
      hasRoleField: false,
      roleDistribution: {},
      sampleUser: null,
      expectedBehavior
    };
    
    // Check for role field in users
    let users = [];
    if (Array.isArray(data)) {
      users = data;
    } else if (data.data && Array.isArray(data.data)) {
      users = data.data;
    } else if (data.users && Array.isArray(data.users)) {
      users = data.users;
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
    console.log(`📈 Role distribution:`, analysis.roleDistribution);
    
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
  
  // Critical Tests - Role Filtering
  await testEndpoint(
    'Customer Role Filtering (CRITICAL)', 
    `${baseUrl}/admin/users?role=customer`,
    'Should return only users with role=customer'
  );
  
  await testEndpoint(
    'Credit Officer Role Filtering (Postman Confirmed)', 
    `${baseUrl}/admin/users?role=credit_officer`,
    'Should return credit officers - Postman docs suggest this works'
  );
  
  await testEndpoint(
    'System Admin Role Filtering', 
    `${baseUrl}/admin/users?role=system_admin`,
    'Should return system admins'
  );
  
  // Dedicated Customer Endpoints
  await testEndpoint(
    'Dedicated Customers Endpoint', 
    `${baseUrl}/admin/customers`,
    'Should return customer-specific data structure'
  );
  
  await testEndpoint(
    'Alternative Customers Endpoint', 
    `${baseUrl}/customers`,
    'Alternative customer endpoint'
  );
  
  await testEndpoint(
    'Users/Customers Endpoint', 
    `${baseUrl}/users/customers`,
    'Another alternative customer endpoint'
  );
  
  // Alternative Filtering Methods
  await testEndpoint(
    'UserType Parameter', 
    `${baseUrl}/admin/users?userType=customer`,
    'Alternative filtering using userType parameter'
  );
  
  await testEndpoint(
    'Type Parameter', 
    `${baseUrl}/admin/users?type=customer`,
    'Alternative filtering using type parameter'
  );
  
  // Staff vs Customer Separation
  await testEndpoint(
    'Staff Endpoint', 
    `${baseUrl}/admin/staff`,
    'Should return only staff members'
  );
  
  await testEndpoint(
    'My Staff Endpoint', 
    `${baseUrl}/admin/staff/my-staff`,
    'Should return staff with role information'
  );
  
  // Branch-based Filtering
  await testEndpoint(
    'Users by Branch', 
    `${baseUrl}/admin/users/branch/Lagos Island`,
    'Should return users from Lagos Island branch'
  );
  
  await testEndpoint(
    'Customers by Branch', 
    `${baseUrl}/admin/users/branch/Lagos Island?role=customer`,
    'Should return customers from Lagos Island branch'
  );
  
  // Baseline Test (Known to work but no role field)
  await testEndpoint(
    'Baseline Admin Users (No Role Field)', 
    `${baseUrl}/admin/users?limit=5`,
    'Known to work but missing role field - baseline comparison'
  );
  
  // Export Endpoints
  await testEndpoint(
    'Export Users', 
    `${baseUrl}/admin/users/export`,
    'Should export user data'
  );
  
  await testEndpoint(
    'Export Customers', 
    `${baseUrl}/admin/users/export?role=customer`,
    'Should export only customers'
  );
  
  // Generate Summary Report
  generateSummaryReport();
}

function generateSummaryReport() {
  console.log('\n' + '='.repeat(60));
  console.log('📋 COMPREHENSIVE TEST RESULTS SUMMARY');
  console.log('='.repeat(60));
  
  console.log(`\n✅ Successful Tests: ${results.successful.length}`);
  console.log(`❌ Failed Tests: ${results.failed.length}`);
  console.log(`📊 Total Tests: ${results.successful.length + results.failed.length}`);
  
  // Analyze successful tests for role field presence
  const testsWithRoleField = results.successful.filter(test => test.hasRoleField);
  const testsWithoutRoleField = results.successful.filter(test => !test.hasRoleField);
  
  console.log(`\n🏷️  Tests with Role Field: ${testsWithRoleField.length}`);
  console.log(`🚫 Tests without Role Field: ${testsWithoutRoleField.length}`);
  
  // Critical findings
  console.log('\n🎯 CRITICAL FINDINGS:');
  
  const customerRoleTest = results.successful.find(test => test.name.includes('Customer Role Filtering'));
  if (customerRoleTest) {
    console.log(`✅ Customer role filtering: WORKS! Found ${customerRoleTest.userCount} users`);
    console.log(`   Role distribution:`, customerRoleTest.roleDistribution);
  } else {
    console.log(`❌ Customer role filtering: FAILED`);
  }
  
  const creditOfficerTest = results.successful.find(test => test.name.includes('Credit Officer Role'));
  if (creditOfficerTest) {
    console.log(`✅ Credit officer role filtering: WORKS! (Confirms role filtering is supported)`);
  } else {
    console.log(`❌ Credit officer role filtering: FAILED`);
  }
  
  const dedicatedCustomerTest = results.successful.find(test => test.name.includes('Dedicated Customers'));
  if (dedicatedCustomerTest) {
    console.log(`✅ Dedicated customer endpoint: EXISTS! Found ${dedicatedCustomerTest.userCount} customers`);
  } else {
    console.log(`❌ Dedicated customer endpoint: NOT FOUND`);
  }
  
  const staffTest = results.successful.find(test => test.name.includes('My Staff'));
  if (staffTest && staffTest.hasRoleField) {
    console.log(`✅ Staff endpoint has role field: CONFIRMED`);
  }
  
  // Recommendations
  console.log('\n💡 RECOMMENDATIONS:');
  
  if (customerRoleTest && customerRoleTest.hasRoleField) {
    console.log('🎯 SOLUTION FOUND: Use /admin/users?role=customer for customer filtering');
    console.log('   Update frontend to remove client-side filtering and use server-side role filtering');
  } else if (dedicatedCustomerTest) {
    console.log('🎯 SOLUTION FOUND: Use /admin/customers dedicated endpoint');
    console.log('   Update frontend to use dedicated customer endpoint instead of admin/users');
  } else if (testsWithRoleField.length > 0) {
    console.log('🎯 PARTIAL SOLUTION: Some endpoints have role field');
    console.log('   Consider using alternative endpoints that provide role information');
  } else {
    console.log('🎯 FALLBACK SOLUTION: Implement alternative customer identification logic');
    console.log('   Use accountStatus, verificationStatus, and other fields to identify customers');
  }
  
  // Detailed successful tests
  if (results.successful.length > 0) {
    console.log('\n📈 SUCCESSFUL ENDPOINTS:');
    results.successful.forEach(test => {
      console.log(`   ✅ ${test.name}: ${test.userCount} users, Role field: ${test.hasRoleField}`);
    });
  }
  
  // Failed tests summary
  if (results.failed.length > 0) {
    console.log('\n💥 FAILED ENDPOINTS:');
    results.failed.forEach(test => {
      console.log(`   ❌ ${test.name}: ${test.status} - ${test.error}`);
    });
  }
  
  console.log('\n🎉 Testing Complete! Check results above for next steps.');
}

// Run the comprehensive test
runComprehensiveTest().catch(console.error);