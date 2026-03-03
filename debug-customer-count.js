const axios = require('axios');
const fs = require('fs');

// Read .env.local manually
let SYSTEM_ADMIN_EMAIL = '';
let SYSTEM_ADMIN_PASSWORD = '';
try {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const emailMatch = envContent.match(/SYSTEM_ADMIN_EMAIL=(.+)/);
  const passwordMatch = envContent.match(/SYSTEM_ADMIN_PASSWORD=(.+)/);
  if (emailMatch) SYSTEM_ADMIN_EMAIL = emailMatch[1].trim();
  if (passwordMatch) SYSTEM_ADMIN_PASSWORD = passwordMatch[1].trim();
} catch (error) {
  console.error('❌ Could not read .env.local');
}

const API_BASE_URL = 'https://kaytop-production.up.railway.app';

if (!SYSTEM_ADMIN_EMAIL || !SYSTEM_ADMIN_PASSWORD) {
  console.error('❌ Admin credentials not found in .env.local');
  process.exit(1);
}

async function getAuthToken() {
  try {
    console.log('🔐 Logging in as system admin...');
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: SYSTEM_ADMIN_EMAIL,
      password: SYSTEM_ADMIN_PASSWORD
    });
    
    const token = response.data?.access_token;
    if (!token) {
      throw new Error('No token in response');
    }
    
    console.log('✅ Login successful\n');
    return token;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

async function debugCustomerCount() {
  const token = await getAuthToken();
  
  const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  console.log('🔍 DEBUGGING CUSTOMER COUNT DISCREPANCY\n');
  console.log('=' .repeat(80));
  
  const allUsers = new Map();
  
  // 1. Fetch staff
  console.log('\n📋 STEP 1: Fetching /admin/staff/my-staff...');
  try {
    const staffResponse = await apiClient.get('/admin/staff/my-staff');
    const staff = Array.isArray(staffResponse.data) ? staffResponse.data : [];
    
    console.log(`✅ Got ${staff.length} staff members\n`);
    
    staff.forEach(user => {
      allUsers.set(user.id, {
        ...user,
        source: 'staff',
        role: user.role
      });
    });
    
    // Show staff breakdown
    const staffByRole = {};
    staff.forEach(user => {
      const role = user.role || 'undefined';
      staffByRole[role] = (staffByRole[role] || 0) + 1;
    });
    console.log('Staff by role:', staffByRole);
    
    // List all staff
    console.log('\nAll staff members:');
    staff.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.firstName} ${user.lastName} (${user.role}) - ID: ${user.id} - Branch: ${user.branch || 'N/A'}`);
    });
    
  } catch (error) {
    console.error('❌ Failed to fetch staff:', error.message);
  }
  
  // 2. Fetch branches
  console.log('\n' + '='.repeat(80));
  console.log('\n🏢 STEP 2: Fetching branches...');
  try {
    const branchesResponse = await apiClient.get('/users/branches');
    const branches = Array.isArray(branchesResponse.data) ? branchesResponse.data : [];
    
    console.log(`✅ Found ${branches.length} branches: ${branches.join(', ')}\n`);
    
    // 3. Fetch users from each branch
    for (const branch of branches) {
      console.log(`\n📍 Fetching users from branch: ${branch}`);
      console.log('-'.repeat(80));
      
      try {
        const branchResponse = await apiClient.get(`/admin/users/branch/${branch}`);
        
        let branchUsers = [];
        if (branchResponse.data && Array.isArray(branchResponse.data.users)) {
          branchUsers = branchResponse.data.users;
        } else if (Array.isArray(branchResponse.data)) {
          branchUsers = branchResponse.data;
        }
        
        console.log(`✅ Got ${branchUsers.length} users from ${branch}`);
        
        // Categorize users
        const newUsers = [];
        const duplicates = [];
        
        branchUsers.forEach(user => {
          if (allUsers.has(user.id)) {
            duplicates.push(user);
          } else {
            newUsers.push(user);
            allUsers.set(user.id, {
              ...user,
              source: `branch:${branch}`,
              role: user.role
            });
          }
        });
        
        console.log(`  - New users: ${newUsers.length}`);
        console.log(`  - Duplicates (already in staff): ${duplicates.length}`);
        
        if (newUsers.length > 0) {
          console.log('\n  New users from this branch:');
          newUsers.forEach((user, index) => {
            console.log(`    ${index + 1}. ${user.firstName} ${user.lastName} (${user.role}) - ID: ${user.id}`);
          });
        }
        
        if (duplicates.length > 0 && duplicates.length <= 5) {
          console.log('\n  Duplicate users (already processed):');
          duplicates.forEach((user, index) => {
            console.log(`    ${index + 1}. ${user.firstName} ${user.lastName} (${user.role}) - ID: ${user.id}`);
          });
        }
        
      } catch (error) {
        console.error(`❌ Failed to fetch users from ${branch}:`, error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Failed to fetch branches:', error.message);
  }
  
  // 4. Final analysis
  console.log('\n' + '='.repeat(80));
  console.log('\n📊 FINAL ANALYSIS\n');
  
  const allUsersArray = Array.from(allUsers.values());
  console.log(`Total unique users: ${allUsersArray.length}\n`);
  
  // Count by role
  const byRole = {};
  allUsersArray.forEach(user => {
    const role = user.role || 'undefined';
    byRole[role] = (byRole[role] || 0) + 1;
  });
  
  console.log('Users by role:');
  Object.entries(byRole).forEach(([role, count]) => {
    console.log(`  - ${role}: ${count}`);
  });
  
  // Count customers specifically
  const customers = allUsersArray.filter(user => {
    const role = user.role || '';
    return role === 'user' || role === 'customer' || role === 'client';
  });
  
  console.log(`\n🎯 CUSTOMERS: ${customers.length}`);
  
  if (customers.length > 0) {
    console.log('\nAll customers:');
    customers.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.firstName} ${user.lastName} (${user.role}) - ID: ${user.id} - Source: ${user.source}`);
    });
  }
  
  // Count credit officers
  const creditOfficers = allUsersArray.filter(user => {
    const role = (user.role || '').toLowerCase();
    return role.includes('credit');
  });
  
  console.log(`\n👮 CREDIT OFFICERS: ${creditOfficers.length}`);
  
  if (creditOfficers.length > 0) {
    console.log('\nAll credit officers:');
    creditOfficers.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.firstName} ${user.lastName} (${user.role}) - ID: ${user.id} - Branch: ${user.branch || 'N/A'} - Source: ${user.source}`);
    });
  }
  
  // Show users by source
  console.log('\n📍 Users by source:');
  const bySource = {};
  allUsersArray.forEach(user => {
    bySource[user.source] = (bySource[user.source] || 0) + 1;
  });
  Object.entries(bySource).forEach(([source, count]) => {
    console.log(`  - ${source}: ${count}`);
  });
  
  console.log('\n' + '='.repeat(80));
}

debugCustomerCount().catch(error => {
  console.error('❌ Script error:', error);
  process.exit(1);
});
