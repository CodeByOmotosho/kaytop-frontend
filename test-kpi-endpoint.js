/**
 * Test script to check what the /dashboard/kpi endpoint returns
 * Run this with: node test-kpi-endpoint.js
 */

const https = require('https');

const API_BASE_URL = 'https://kaytop-production.up.railway.app';
const ENDPOINT = '/dashboard/kpi';

// You need to replace this with a valid token from your .env.local file
const AUTH_TOKEN = process.env.AUTH_TOKEN || 'YOUR_TOKEN_HERE';

function testKPIEndpoint() {
  const options = {
    hostname: 'kaytop-production.up.railway.app',
    path: ENDPOINT,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${AUTH_TOKEN}`,
      'Content-Type': 'application/json'
    }
  };

  console.log('🔍 Testing /dashboard/kpi endpoint...');
  console.log(`📍 URL: ${API_BASE_URL}${ENDPOINT}`);
  console.log('');

  const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log(`📊 Status Code: ${res.statusCode}`);
      console.log('');
      
      if (res.statusCode === 200) {
        try {
          const jsonData = JSON.parse(data);
          console.log('✅ SUCCESS! Response data:');
          console.log(JSON.stringify(jsonData, null, 2));
          console.log('');
          
          // Check for expected fields
          console.log('🔍 Field Analysis:');
          console.log('-------------------');
          console.log(`totalBranches: ${jsonData.totalBranches !== undefined ? '✅ Present' : '❌ Missing'} (value: ${jsonData.totalBranches})`);
          console.log(`totalCreditOfficers: ${jsonData.totalCreditOfficers !== undefined ? '✅ Present' : '❌ Missing'} (value: ${jsonData.totalCreditOfficers})`);
          console.log(`totalCustomers: ${jsonData.totalCustomers !== undefined ? '✅ Present' : '❌ Missing'} (value: ${jsonData.totalCustomers})`);
          console.log(`totalUsers: ${jsonData.totalUsers !== undefined ? '✅ Present' : '❌ Missing'} (value: ${jsonData.totalUsers})`);
          console.log(`totalLoans: ${jsonData.totalLoans !== undefined ? '✅ Present' : '❌ Missing'} (value: ${jsonData.totalLoans})`);
          console.log(`activeLoans: ${jsonData.activeLoans !== undefined ? '✅ Present' : '❌ Missing'} (value: ${jsonData.activeLoans})`);
          console.log('');
          
          // Check for growth fields
          console.log('📈 Growth Fields:');
          console.log('-------------------');
          console.log(`branchesGrowth: ${jsonData.branchesGrowth !== undefined ? '✅ Present' : '❌ Missing'} (value: ${jsonData.branchesGrowth})`);
          console.log(`creditOfficersGrowth: ${jsonData.creditOfficersGrowth !== undefined ? '✅ Present' : '❌ Missing'} (value: ${jsonData.creditOfficersGrowth})`);
          console.log(`customersGrowth: ${jsonData.customersGrowth !== undefined ? '✅ Present' : '❌ Missing'} (value: ${jsonData.customersGrowth})`);
          console.log('');
          
          // List all available fields
          console.log('📋 All Available Fields:');
          console.log('-------------------');
          Object.keys(jsonData).forEach(key => {
            console.log(`  - ${key}: ${typeof jsonData[key]} = ${JSON.stringify(jsonData[key])}`);
          });
          
        } catch (error) {
          console.error('❌ Failed to parse JSON response:', error.message);
          console.log('Raw response:', data);
        }
      } else {
        console.error(`❌ Request failed with status ${res.statusCode}`);
        console.log('Response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Request error:', error.message);
  });

  req.end();
}

// Check if token is provided
if (AUTH_TOKEN === 'YOUR_TOKEN_HERE') {
  console.log('⚠️  Please set AUTH_TOKEN environment variable or edit this file');
  console.log('');
  console.log('Usage:');
  console.log('  AUTH_TOKEN=your_token_here node test-kpi-endpoint.js');
  console.log('');
  console.log('Or get the token from your browser:');
  console.log('  1. Log in to the app');
  console.log('  2. Open DevTools (F12)');
  console.log('  3. Go to Application > Local Storage');
  console.log('  4. Find "token" or "authToken"');
  console.log('  5. Copy the value');
  process.exit(1);
}

testKPIEndpoint();
