# Customer Endpoint Analysis & Investigation

## 🔍 **Key Findings from Customer Dashboard & Auth Investigation**

### **1. Customer Authentication & Profile Endpoints**

**Customer Login Flow:**
- **Endpoint**: `POST /auth/login`
- **Response**: Includes `role` field that determines user type
- **Customer Role**: `'customer'` (confirmed in login redirect logic)

**Customer Profile Endpoint:**
- **Endpoint**: `GET /users/profile` 
- **Service**: `SettingsService.getMyProfile()`
- **Usage**: Customer dashboard uses this for authenticated customer profile data
- **Authentication**: Uses customer JWT token

**Customer-Specific Endpoints Found:**
```typescript
// Customer Loans
GET /customer/loans/my-loans
GET /customer/loans/active-loan

// Customer Profile  
GET /users/profile
PATCH /users/me
PATCH /users/me/profile-picture

// Customer Savings
// (Used via SavingsService and LoanService)
```

### **2. Admin vs Customer Endpoint Separation**

**The Issue with `/admin/users`:**
- This endpoint is designed for **admin management** of users
- It **does NOT include role information** in responses (confirmed in investigation)
- It returns ALL users (staff + customers) without role distinction
- **Not intended for customer identification**

**Proper Customer Data Access:**
```typescript
// ❌ WRONG - Admin endpoint without role info
GET /admin/users  // Returns all users, no role field

// ✅ CORRECT - Customer-specific endpoints  
GET /admin/users?role=customer  // Role filtering (needs testing)
GET /admin/customers           // Dedicated customer endpoint (needs testing)
GET /users/profile            // Individual customer profile (authenticated)
```

### **3. Role-Based Filtering Investigation**

**From Comprehensive Endpoint Test:**
The investigation shows that role-based filtering **might be supported**:

```http
# These endpoints need testing:
GET /admin/users?role=customer
GET /admin/users?role=credit_officer  # Postman docs suggest this works
GET /admin/customers
GET /users/customers
```

**Evidence from Postman Documentation:**
- Postman docs mention `/admin/users?role=credit_officer` works
- This suggests role filtering **IS supported** but wasn't tested correctly

### **4. Customer Identification Strategy**

**Current Problem:**
```typescript
// This fails because /admin/users has no role field
const customerUsers = usersResponse.data.filter(user => {
  const isCustomer = user.role === 'customer';  // Always undefined
  return isCustomer;
});
```

**Solution Options:**

**Option A: Use Role Filtering (Recommended)**
```typescript
// Test if role filtering works
const response = await apiClient.get('/admin/users?role=customer');
```

**Option B: Use Dedicated Customer Endpoint**
```typescript
// Test if dedicated endpoint exists
const response = await apiClient.get('/admin/customers');
```

**Option C: Alternative Customer Identification**
```typescript
// Use other fields to identify customers
const customerUsers = users.filter(user => {
  // Customers typically have:
  return user.accountStatus === 'fully_verified' && 
         user.verificationStatus === 'verified' &&
         !user.email?.includes('@kaytop.com') &&  // Not staff email
         !user.branch;  // Staff have branch assignments
});
```

### **5. Authentication Context Analysis**

**Customer Authentication Flow:**
1. Customer logs in via `/auth/login`
2. Backend returns JWT with `role: 'customer'`
3. Customer dashboard uses customer-specific endpoints
4. Profile data comes from `/users/profile` (authenticated)

**Admin Authentication Flow:**
1. Admin logs in via `/auth/login` 
2. Backend returns JWT with admin role (`system_admin`, `hq_manager`, etc.)
3. Admin dashboards use `/admin/*` endpoints
4. Admin can access user management via `/admin/users`

### **6. Recommended Investigation Steps**

**Immediate Testing Needed:**
```http
# Test 1: Role filtering (CRITICAL)
GET /admin/users?role=customer
Authorization: Bearer {{adminToken}}

# Test 2: Dedicated customer endpoint
GET /admin/customers  
Authorization: Bearer {{adminToken}}

# Test 3: Verify role field exists with role filtering
GET /admin/users?role=credit_officer
Authorization: Bearer {{adminToken}}
```

**Expected Results:**
- If role filtering works: Customer pages should use `?role=customer`
- If dedicated endpoint exists: Use `/admin/customers` instead
- If neither works: Implement alternative identification logic

### **7. Customer Dashboard Insights**

**Customer Dashboard Uses:**
- **Profile**: `/users/profile` (works - authenticated customer)
- **Loans**: `/customer/loans/my-loans` (customer-specific)
- **Savings**: Customer-specific savings endpoints
- **Authentication**: Standard `/auth/login` with role-based routing

**Key Insight:**
The customer dashboard works perfectly because it uses **customer-specific endpoints** that are designed for authenticated customers. The admin customer management pages fail because they're trying to use **admin endpoints** that lack role information.

### **8. Recommended Solution**

**Step 1: Test Role Filtering**
```typescript
// Update customer pages to test role filtering
const response = await apiClient.get('/admin/users?role=customer');
```

**Step 2: If Role Filtering Works**
```typescript
// Remove client-side filtering, use server-side filtering
const getCustomers = async (params?: UserFilterParams) => {
  return userService.getAllUsers({ ...params, role: 'customer' });
};
```

**Step 3: If Dedicated Endpoint Exists**
```typescript
// Create dedicated customer service
export class CustomerManagementService {
  static async getCustomers(params?: PaginationParams) {
    return apiClient.get('/admin/customers', { params });
  }
}
```

## 🎯 **Next Actions**

1. **Test the comprehensive endpoint list** in `.kiro/docs/comprehensive-endpoint-test.http`
2. **Focus on role filtering**: `/admin/users?role=customer`
3. **Test dedicated customer endpoint**: `/admin/customers`
4. **Update customer management pages** based on test results
5. **Document the correct endpoint usage** for future development

The investigation shows that the customer dashboard architecture is correct - it uses proper customer-specific endpoints. The issue is with admin customer management pages using the wrong endpoints without role information.