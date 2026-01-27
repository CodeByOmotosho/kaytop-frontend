/**
 * Test script to check what the /users/states API actually returns
 */

const axios = require('axios');

const baseUrl = 'https://kaytop-production.up.railway.app';

async function testStatesAPI() {
  try {
    console.log('🔍 Testing /users/states API endpoint...\n');
    
    // First login to get token
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post(`${baseUrl}/auth/login`, {
      email: 'admin@kaytop.com',
      password: 'Admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful\n');
    
    // Test states endpoint
    console.log('2. Fetching states from /users/states...');
    const statesResponse = await axios.get(`${baseUrl}/users/states`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ States API Response:');
    console.log('📊 Response Status:', statesResponse.status);
    console.log('📊 Response Data Type:', typeof statesResponse.data);
    console.log('📊 Is Array:', Array.isArray(statesResponse.data));
    console.log('📊 States Count:', Array.isArray(statesResponse.data) ? statesResponse.data.length : 'N/A');
    console.log('📊 States Data:', JSON.stringify(statesResponse.data, null, 2));
    
    // Test branches endpoint for comparison
    console.log('\n3. Fetching branches from /users/branches for comparison...');
    const branchesResponse = await axios.get(`${baseUrl}/users/branches`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Branches API Response:');
    console.log('📊 Response Status:', branchesResponse.status);
    console.log('📊 Response Data Type:', typeof branchesResponse.data);
    console.log('📊 Is Array:', Array.isArray(branchesResponse.data));
    console.log('📊 Branches Count:', Array.isArray(branchesResponse.data) ? branchesResponse.data.length : 'N/A');
    console.log('📊 Branches Data:', JSON.stringify(branchesResponse.data, null, 2));
    
    // Expected Nigerian states for comparison
    const expectedNigerianStates = [
      'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
      'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'Gombe', 'Imo',
      'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos',
      'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers',
      'Sokoto', 'Taraba', 'Yobe', 'Zamfara', 'FCT'
    ];
    
    console.log('\n4. Analysis:');
    console.log('📊 Expected Nigerian States Count:', expectedNigerianStates.length);
    console.log('📊 API Returned States Count:', Array.isArray(statesResponse.data) ? statesResponse.data.length : 0);
    
    if (Array.isArray(statesResponse.data)) {
      const missingStates = expectedNigerianStates.filter(state => 
        !statesResponse.data.some(apiState => 
          apiState.toLowerCase().includes(state.toLowerCase()) || 
          state.toLowerCase().includes(apiState.toLowerCase())
        )
      );
      
      console.log('📊 Missing States:', missingStates.length > 0 ? missingStates : 'None');
      
      const extraStates = statesResponse.data.filter(apiState => 
        !expectedNigerianStates.some(expectedState => 
          apiState.toLowerCase().includes(expectedState.toLowerCase()) || 
          expectedState.toLowerCase().includes(apiState.toLowerCase())
        )
      );
      
      console.log('📊 Extra/Unexpected States:', extraStates.length > 0 ? extraStates : 'None');
    }
    
  } catch (error) {
    console.error('❌ Error testing states API:', error.response?.status, error.response?.data || error.message);
  }
}

testStatesAPI();