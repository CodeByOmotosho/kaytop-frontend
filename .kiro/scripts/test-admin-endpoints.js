/**
 * Test Admin Endpoints for Role Badge Fix
 * 
 * This script tests different admin endpoints to find the correct one
 * for fetching admin users with proper role information.
 */

const https = require('https');

const BASE_URL = 'https://kaytop-production.up.railway.app';
const SYSTEM_ADMIN_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluQGtheXRvcC5jb20iLCJzdWIiOjEsInJvbGUiOiJzeXN0ZW1fYWRtaW4iLCJpYXQiOjE3Mzc2MzE4NzV9.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

function makeRequest(endpoint, description) {
    return new Promise((resolve, reject) => {
        const url = `${BASE_URL}${endpoint}`;
        console.log(`\n🔍 Testing: ${description}`);
        console.log(`📡 URL: ${url}`);
        
        const options = {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${SYSTEM_ADMIN_TOKEN}`,
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(url, options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    console.log(`✅ Status: ${res.statusCode}`);
                    
                    if (Array.isArray(jsonData)) {
                        console.log(`📊 Results: ${jsonData.length} users found`);
                        
                        // Show first few users with their roles
                        jsonData.slice(0, 3).forEach((user, index) => {
                            console.log(`   User ${index + 1}: ${user.firstName} ${user.lastName} (${user.email}) - Role: ${user.role || 'NO ROLE'}`);
                        });
                        
                        // Count users by role
                        const roleCounts = {};
                        jsonData.forEach(user => {
                            const role = user.role || 'NO ROLE';
                            roleCounts[role] = (roleCounts[role] || 0) + 1;
                        });
                        
                        console.log(`📈 Role Distribution:`, roleCounts);
                    } else if (jsonData.data && Array.isArray(jsonData.data)) {
                        console.log(`📊 Results: ${jsonData.data.length} users found (paginated)`);
                        console.log(`📄 Pagination:`, jsonData.pagination || 'No pagination info');
                        
                        // Show first few users with their roles
                        jsonData.data.slice(0, 3).forEach((user, index) => {
                            console.log(`   User ${index + 1}: ${user.firstName} ${user.lastName} (${user.email}) - Role: ${user.role || 'NO ROLE'}`);
                        });
                    } else {
                        console.log(`📄 Response:`, JSON.stringify(jsonData, null, 2));
                    }
                    
                    resolve({ status: res.statusCode, data: jsonData });
                } catch (error) {
                    console.log(`📄 Raw Response:`, data);
                    resolve({ status: res.statusCode, data: data });
                }
            });
        });

        req.on('error', (error) => {
            console.log(`❌ Error: ${error.message}`);
            reject(error);
        });

        req.setTimeout(10000, () => {
            console.log(`⏰ Request timeout`);
            req.destroy();
            reject(new Error('Request timeout'));
        });

        req.end();
    });
}

async function testAdminEndpoints() {
    console.log('🧪 Testing Admin Endpoints for Role Badge Fix\n');
    console.log('🎯 Goal: Find the correct endpoint to get admin users with proper roles\n');

    const tests = [
        // Test current endpoint (all users)
        { endpoint: '/admin/users', description: 'Current endpoint - All users' },
        { endpoint: '/admin/users?page=1&limit=10', description: 'Current endpoint with pagination' },
        
        // Test role filtering for admin roles
        { endpoint: '/admin/users?role=system_admin', description: 'System Admin users only' },
        { endpoint: '/admin/users?role=hq_manager', description: 'HQ Manager users only' },
        { endpoint: '/admin/users?role=branch_manager', description: 'Branch Manager users only' },
        { endpoint: '/admin/users?role=credit_officer', description: 'Credit Officer users only' },
        { endpoint: '/admin/users?role=account_manager', description: 'Account Manager users only' },
        
        // Test staff endpoint
        { endpoint: '/admin/staff/my-staff', description: 'My Staff endpoint' },
        
        // Test profile endpoints
        { endpoint: '/admin/profile', description: 'Admin profile endpoint' },
        { endpoint: '/users/me', description: 'Current user profile' },
    ];

    const results = [];
    
    for (const test of tests) {
        try {
            const result = await makeRequest(test.endpoint, test.description);
            results.push({ ...test, result });
            
            // Add delay between requests to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
            console.log(`❌ Failed: ${error.message}`);
            results.push({ ...test, result: { error: error.message } });
        }
    }

    console.log('\n🏆 Test Results Summary:');
    console.log('=' .repeat(50));
    
    results.forEach((test, index) => {
        console.log(`\n${index + 1}. ${test.description}`);
        console.log(`   Endpoint: ${test.endpoint}`);
        
        if (test.result.error) {
            console.log(`   Status: ❌ Error - ${test.result.error}`);
        } else {
            console.log(`   Status: ✅ ${test.result.status}`);
            
            if (test.result.data) {
                const data = test.result.data;
                if (Array.isArray(data)) {
                    console.log(`   Users: ${data.length} found`);
                } else if (data.data && Array.isArray(data.data)) {
                    console.log(`   Users: ${data.data.length} found (paginated)`);
                } else if (data.firstName || data.email) {
                    console.log(`   User: ${data.firstName} ${data.lastName} (${data.email}) - Role: ${data.role || 'NO ROLE'}`);
                }
            }
        }
    });

    console.log('\n💡 Recommendations:');
    console.log('=' .repeat(50));
    
    // Find the best endpoint for admin users
    const adminRoleTests = results.filter(r => 
        r.endpoint.includes('role=') && 
        !r.result.error && 
        r.result.status === 200
    );
    
    if (adminRoleTests.length > 0) {
        console.log('✅ Role filtering is supported! Use these endpoints:');
        adminRoleTests.forEach(test => {
            console.log(`   - ${test.endpoint} for ${test.description}`);
        });
        
        console.log('\n🔧 Implementation Fix:');
        console.log('   1. Create separate queries for each admin role');
        console.log('   2. Combine results from multiple role endpoints');
        console.log('   3. Or create a composite query that fetches admin roles only');
    } else {
        console.log('⚠️ Role filtering may not be supported');
        console.log('   Consider using /admin/users and filtering client-side');
    }

    console.log('\n✅ Admin endpoint testing completed!');
}

// Run the tests
testAdminEndpoints().catch(console.error);