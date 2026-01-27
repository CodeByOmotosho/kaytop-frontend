/**
 * Test Role Mapping Functionality
 * 
 * This script tests the role mapping function to ensure Credit Officers
 * and other roles are mapped correctly to display proper badges.
 */

// Simulate the role mapping function
function mapBackendToFrontendRole(backendRole, email, name) {
    console.log('🔍 Role mapping input:', { backendRole, email, name });
    
    // Enhanced backend role matching with case-insensitive and variant support
    if (backendRole && backendRole !== 'undefined' && backendRole !== 'null') {
        const normalizedRole = backendRole.toLowerCase().trim();
        
        if (normalizedRole === 'branch_manager' || normalizedRole === 'bm') return 'BM';
        if (normalizedRole === 'account_manager' || normalizedRole === 'am') return 'HQ';
        if (normalizedRole === 'credit_officer' || normalizedRole === 'co') return 'CO';
        if (normalizedRole === 'hq_manager' || normalizedRole === 'hq') return 'HQ';
        if (normalizedRole === 'system_admin' || normalizedRole === 'admin') return 'ADMIN';
        
        console.warn('⚠️ Unrecognized backend role:', backendRole);
    }
    
    // Enhanced email pattern matching
    if (email) {
        const emailLower = email.toLowerCase();
        const nameLower = name?.toLowerCase() || '';
        
        // System Admin patterns
        if (emailLower.includes('admin@kaytop.com') || emailLower.includes('system') || nameLower.includes('system administrator')) {
            console.log('🔍 Mapped to ADMIN via email pattern');
            return 'ADMIN';
        }
        
        // Branch Manager patterns
        if (emailLower.includes('bm@') || emailLower.includes('branch') || emailLower.includes('bmadmin') || 
            emailLower.includes('_branch@') || nameLower.includes('branch manager')) {
            console.log('🔍 Mapped to BM via email pattern');
            return 'BM';
        }
        
        // HQ Manager patterns
        if (emailLower.includes('hq') || emailLower.includes('adminhq') || nameLower.includes('hq manager')) {
            console.log('🔍 Mapped to HQ via email pattern');
            return 'HQ';
        }
        
        // Credit Officer patterns (check last to avoid conflicts)
        if (emailLower.includes('credit') || emailLower.includes('officer') || nameLower.includes('credit officer')) {
            console.log('🔍 Mapped to CO via email pattern');
            return 'CO';
        }
    }
    
    // Warning when falling back to default
    console.warn('⚠️ Role mapping fell back to default HQ for:', { backendRole, email, name });
    return 'HQ';
}

// Test cases
console.log('🧪 Testing Role Mapping Function\n');

const testCases = [
    // Credit Officer test cases
    { backendRole: 'credit_officer', email: 'john.doe@kaytop.com', name: 'John Doe', expected: 'CO' },
    { backendRole: 'CO', email: 'jane.smith@kaytop.com', name: 'Jane Smith', expected: 'CO' },
    { backendRole: 'co', email: 'mike.wilson@kaytop.com', name: 'Mike Wilson', expected: 'CO' },
    { backendRole: null, email: 'credit.officer@kaytop.com', name: 'Credit Officer', expected: 'CO' },
    
    // Branch Manager test cases
    { backendRole: 'branch_manager', email: 'bm@kaytop.com', name: 'Branch Manager', expected: 'BM' },
    { backendRole: 'BM', email: 'branch.admin@kaytop.com', name: 'Branch Admin', expected: 'BM' },
    
    // HQ Manager test cases
    { backendRole: 'hq_manager', email: 'hq@kaytop.com', name: 'HQ Manager', expected: 'HQ' },
    { backendRole: 'account_manager', email: 'am@kaytop.com', name: 'Account Manager', expected: 'HQ' },
    
    // System Admin test cases
    { backendRole: 'system_admin', email: 'admin@kaytop.com', name: 'System Admin', expected: 'ADMIN' },
    { backendRole: 'ADMIN', email: 'system@kaytop.com', name: 'System Administrator', expected: 'ADMIN' },
    
    // Edge cases
    { backendRole: 'undefined', email: 'test@kaytop.com', name: 'Test User', expected: 'HQ' },
    { backendRole: '', email: 'unknown@kaytop.com', name: 'Unknown User', expected: 'HQ' },
];

let passedTests = 0;
let totalTests = testCases.length;

testCases.forEach((testCase, index) => {
    console.log(`\n--- Test Case ${index + 1} ---`);
    const result = mapBackendToFrontendRole(testCase.backendRole, testCase.email, testCase.name);
    const passed = result === testCase.expected;
    
    console.log(`Expected: ${testCase.expected}`);
    console.log(`Got: ${result}`);
    console.log(`Status: ${passed ? '✅ PASS' : '❌ FAIL'}`);
    
    if (passed) {
        passedTests++;
    } else {
        console.log(`❌ FAILED: Expected ${testCase.expected} but got ${result}`);
    }
});

console.log(`\n🏆 Test Results: ${passedTests}/${totalTests} tests passed`);

if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Role mapping is working correctly.');
} else {
    console.log('⚠️ Some tests failed. Role mapping needs attention.');
}

// Badge color mapping test
console.log('\n🎨 Testing Badge Colors:');
const roleColors = {
    'HQ': { bg: '#FBEFF8', text: '#AB659C', label: 'HQ Manager' },
    'BM': { bg: '#E0F2FE', text: '#0369A1', label: 'Branch Manager' },
    'CO': { bg: '#DEDAF3', text: '#462ACD', label: 'Credit Officer' },
    'ADMIN': { bg: '#FEF2F2', text: '#DC2626', label: 'System Administrator' }
};

Object.entries(roleColors).forEach(([role, colors]) => {
    console.log(`${role}: ${colors.label} - Background: ${colors.bg}, Text: ${colors.text}`);
});

console.log('\n✅ Role mapping test completed!');