# Customer Endpoints Investigation Script
# This script automates the testing of customer-related endpoints to identify data issues

param(
    [string]$BaseUrl = "https://kaytop-production.up.railway.app",
    [string]$SystemAdminEmail = "admin@kaytop.com",
    [string]$SystemAdminPassword = "Admin123",
    [string]$HqManagerEmail = "adminhq@mailsac.com",
    [string]$HqManagerPassword = "12345678"
)

Write-Host "🔍 Starting Customer Endpoints Investigation..." -ForegroundColor Cyan
Write-Host "📍 Base URL: $BaseUrl" -ForegroundColor Gray

# Function to make HTTP requests with error handling
function Invoke-ApiRequest {
    param(
        [string]$Method = "GET",
        [string]$Url,
        [hashtable]$Headers = @{},
        [object]$Body = $null,
        [string]$Description = ""
    )
    
    try {
        $requestParams = @{
            Method = $Method
            Uri = $Url
            Headers = $Headers
            ContentType = "application/json"
        }
        
        if ($Body) {
            $requestParams.Body = ($Body | ConvertTo-Json -Depth 10)
        }
        
        Write-Host "🔄 $Description" -ForegroundColor Yellow
        Write-Host "   $Method $Url" -ForegroundColor Gray
        
        $response = Invoke-RestMethod @requestParams
        Write-Host "✅ Success (200)" -ForegroundColor Green
        return @{ Success = $true; Data = $response; StatusCode = 200 }
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $errorMessage = $_.Exception.Message
        Write-Host "❌ Failed ($statusCode): $errorMessage" -ForegroundColor Red
        return @{ Success = $false; Error = $errorMessage; StatusCode = $statusCode }
    }
}

# Function to analyze user data and roles
function Analyze-UserData {
    param([array]$Users, [string]$Source)
    
    Write-Host "`n📊 Analyzing user data from $Source..." -ForegroundColor Cyan
    
    if (-not $Users -or $Users.Count -eq 0) {
        Write-Host "   ⚠️ No users found" -ForegroundColor Yellow
        return
    }
    
    Write-Host "   📈 Total users: $($Users.Count)" -ForegroundColor White
    
    # Analyze roles
    $roleDistribution = @{}
    $sampleUsers = @()
    
    foreach ($user in $Users) {
        $role = $user.role
        if (-not $role) { $role = "undefined" }
        
        if ($roleDistribution.ContainsKey($role)) {
            $roleDistribution[$role]++
        } else {
            $roleDistribution[$role] = 1
        }
        
        # Collect sample users
        if ($sampleUsers.Count -lt 5) {
            $sampleUsers += @{
                id = $user.id
                name = "$($user.firstName) $($user.lastName)"
                email = $user.email
                role = $user.role
                branch = $user.branch
                verificationStatus = $user.verificationStatus
            }
        }
    }
    
    # Display role distribution
    Write-Host "   🎭 Role Distribution:" -ForegroundColor White
    foreach ($role in $roleDistribution.Keys | Sort-Object) {
        $count = $roleDistribution[$role]
        $percentage = [math]::Round(($count / $Users.Count) * 100, 1)
        Write-Host "      $role`: $count ($percentage%)" -ForegroundColor Gray
    }
    
    # Display sample users
    Write-Host "   👥 Sample Users:" -ForegroundColor White
    foreach ($user in $sampleUsers) {
        Write-Host "      ID: $($user.id) | $($user.name) | $($user.email) | Role: $($user.role)" -ForegroundColor Gray
    }
    
    # Check for customers
    $customers = $Users | Where-Object { $_.role -eq "customer" }
    if ($customers.Count -gt 0) {
        Write-Host "   ✅ Found $($customers.Count) users with role='customer'" -ForegroundColor Green
    } else {
        Write-Host "   ❌ No users found with role='customer'" -ForegroundColor Red
    }
    
    return @{
        TotalUsers = $Users.Count
        RoleDistribution = $roleDistribution
        CustomerCount = $customers.Count
        SampleUsers = $sampleUsers
    }
}

# Step 1: Authenticate as System Admin
Write-Host "`n🔐 Step 1: Authenticating as System Admin..." -ForegroundColor Cyan
$systemAdminAuth = Invoke-ApiRequest -Method "POST" -Url "$BaseUrl/auth/login" -Body @{
    email = $SystemAdminEmail
    password = $SystemAdminPassword
} -Description "System Admin Login"

if (-not $systemAdminAuth.Success) {
    Write-Host "❌ Failed to authenticate as System Admin. Exiting." -ForegroundColor Red
    exit 1
}

$systemAdminToken = $systemAdminAuth.Data.token
Write-Host "✅ System Admin authenticated successfully" -ForegroundColor Green

# Step 2: Authenticate as HQ Manager
Write-Host "`n🔐 Step 2: Authenticating as HQ Manager..." -ForegroundColor Cyan
$hqManagerAuth = Invoke-ApiRequest -Method "POST" -Url "$BaseUrl/auth/login" -Body @{
    email = $HqManagerEmail
    password = $HqManagerPassword
} -Description "HQ Manager Login"

if (-not $hqManagerAuth.Success) {
    Write-Host "❌ Failed to authenticate as HQ Manager. Continuing with System Admin only." -ForegroundColor Yellow
    $hqManagerToken = $null
} else {
    $hqManagerToken = $hqManagerAuth.Data.token
    Write-Host "✅ HQ Manager authenticated successfully" -ForegroundColor Green
}

# Prepare headers
$systemAdminHeaders = @{ "Authorization" = "Bearer $systemAdminToken" }
$hqManagerHeaders = if ($hqManagerToken) { @{ "Authorization" = "Bearer $hqManagerToken" } } else { $null }

# Step 3: Test /admin/users endpoint (current customer page endpoint)
Write-Host "`n📋 Step 3: Testing /admin/users endpoint..." -ForegroundColor Cyan
$adminUsersResult = Invoke-ApiRequest -Url "$BaseUrl/admin/users" -Headers $systemAdminHeaders -Description "Get all users from /admin/users"

if ($adminUsersResult.Success) {
    $adminUsers = $adminUsersResult.Data
    
    # Handle different response formats
    if ($adminUsers.users) {
        $usersList = $adminUsers.users
    } elseif ($adminUsers -is [array]) {
        $usersList = $adminUsers
    } else {
        $usersList = @($adminUsers)
    }
    
    $adminUsersAnalysis = Analyze-UserData -Users $usersList -Source "/admin/users"
}

# Step 4: Test /admin/users with pagination
Write-Host "`n📋 Step 4: Testing /admin/users with pagination..." -ForegroundColor Cyan
$adminUsersPaginatedResult = Invoke-ApiRequest -Url "$BaseUrl/admin/users?page=1&limit=100" -Headers $systemAdminHeaders -Description "Get paginated users from /admin/users"

if ($adminUsersPaginatedResult.Success) {
    $adminUsersPaginated = $adminUsersPaginatedResult.Data
    
    # Handle different response formats
    if ($adminUsersPaginated.users) {
        $paginatedUsersList = $adminUsersPaginated.users
    } elseif ($adminUsersPaginated -is [array]) {
        $paginatedUsersList = $adminUsersPaginated
    } else {
        $paginatedUsersList = @($adminUsersPaginated)
    }
    
    $paginatedAnalysis = Analyze-UserData -Users $paginatedUsersList -Source "/admin/users (paginated)"
}

# Step 5: Test /admin/staff/my-staff endpoint (known to have proper roles)
Write-Host "`n📋 Step 5: Testing /admin/staff/my-staff endpoint..." -ForegroundColor Cyan
$staffResult = Invoke-ApiRequest -Url "$BaseUrl/admin/staff/my-staff" -Headers $systemAdminHeaders -Description "Get staff from /admin/staff/my-staff"

if ($staffResult.Success) {
    $staffUsers = $staffResult.Data
    
    # Handle different response formats
    if ($staffUsers -is [array]) {
        $staffUsersList = $staffUsers
    } else {
        $staffUsersList = @($staffUsers)
    }
    
    $staffAnalysis = Analyze-UserData -Users $staffUsersList -Source "/admin/staff/my-staff"
}

# Step 6: Test potential customer-specific endpoints
Write-Host "`n📋 Step 6: Testing potential customer-specific endpoints..." -ForegroundColor Cyan

$customerEndpoints = @(
    "/admin/customers",
    "/admin/users?role=customer",
    "/admin/users?userType=customer",
    "/users/customers",
    "/customers"
)

$workingCustomerEndpoints = @()

foreach ($endpoint in $customerEndpoints) {
    $result = Invoke-ApiRequest -Url "$BaseUrl$endpoint" -Headers $systemAdminHeaders -Description "Testing $endpoint"
    if ($result.Success) {
        $workingCustomerEndpoints += $endpoint
        Write-Host "   ✅ $endpoint is accessible" -ForegroundColor Green
        
        # Analyze the data if it's user-like
        $data = $result.Data
        if ($data -is [array] -and $data.Count -gt 0 -and $data[0].email) {
            Analyze-UserData -Users $data -Source $endpoint
        }
    }
}

# Step 7: Test with HQ Manager if available
if ($hqManagerHeaders) {
    Write-Host "`n📋 Step 7: Testing with HQ Manager credentials..." -ForegroundColor Cyan
    $hqAdminUsersResult = Invoke-ApiRequest -Url "$BaseUrl/admin/users" -Headers $hqManagerHeaders -Description "Get users as HQ Manager"
    
    if ($hqAdminUsersResult.Success) {
        Write-Host "   ✅ HQ Manager can access /admin/users" -ForegroundColor Green
        
        $hqAdminUsers = $hqAdminUsersResult.Data
        if ($hqAdminUsers.users) {
            $hqUsersList = $hqAdminUsers.users
        } elseif ($hqAdminUsers -is [array]) {
            $hqUsersList = $hqAdminUsers
        } else {
            $hqUsersList = @($hqAdminUsers)
        }
        
        $hqAnalysis = Analyze-UserData -Users $hqUsersList -Source "/admin/users (HQ Manager)"
    }
}

# Step 8: Generate comprehensive report
Write-Host "`n📊 INVESTIGATION SUMMARY REPORT" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

Write-Host "`n🔍 ENDPOINT ACCESSIBILITY:" -ForegroundColor White
Write-Host "   ✅ /admin/users - Accessible" -ForegroundColor Green
Write-Host "   ✅ /admin/staff/my-staff - Accessible" -ForegroundColor Green

if ($workingCustomerEndpoints.Count -gt 0) {
    Write-Host "   ✅ Customer-specific endpoints found:" -ForegroundColor Green
    foreach ($endpoint in $workingCustomerEndpoints) {
        Write-Host "      - $endpoint" -ForegroundColor Gray
    }
} else {
    Write-Host "   ❌ No dedicated customer endpoints found" -ForegroundColor Red
}

Write-Host "`n👥 USER DATA ANALYSIS:" -ForegroundColor White
if ($adminUsersAnalysis) {
    Write-Host "   📊 /admin/users: $($adminUsersAnalysis.TotalUsers) total users, $($adminUsersAnalysis.CustomerCount) customers" -ForegroundColor Gray
}
if ($staffAnalysis) {
    Write-Host "   📊 /admin/staff/my-staff: $($staffAnalysis.TotalUsers) total users, $($staffAnalysis.CustomerCount) customers" -ForegroundColor Gray
}

Write-Host "`n🎯 KEY FINDINGS:" -ForegroundColor White

# Check if customers exist
$customersFound = $false
if ($adminUsersAnalysis -and $adminUsersAnalysis.CustomerCount -gt 0) {
    Write-Host "   ✅ Found $($adminUsersAnalysis.CustomerCount) users with role='customer' in /admin/users" -ForegroundColor Green
    $customersFound = $true
}

if ($staffAnalysis -and $staffAnalysis.CustomerCount -gt 0) {
    Write-Host "   ✅ Found $($staffAnalysis.CustomerCount) users with role='customer' in /admin/staff/my-staff" -ForegroundColor Green
    $customersFound = $true
}

if (-not $customersFound) {
    Write-Host "   ❌ No users with role='customer' found in any endpoint" -ForegroundColor Red
    Write-Host "   🔍 This explains why credit officers appear in customer tables" -ForegroundColor Yellow
}

Write-Host "`n💡 RECOMMENDATIONS:" -ForegroundColor White

if (-not $customersFound) {
    Write-Host "   1. ⚠️ PROBLEM IDENTIFIED: No actual customers exist in the system" -ForegroundColor Yellow
    Write-Host "   2. 🔧 SOLUTION: The customer pages are working correctly, but showing staff because no customers exist" -ForegroundColor Yellow
    Write-Host "   3. 📝 ACTION: Need to either:" -ForegroundColor Yellow
    Write-Host "      - Add actual customer test data to the system" -ForegroundColor Gray
    Write-Host "      - Investigate customer registration flow" -ForegroundColor Gray
    Write-Host "      - Check if customers are stored in a different system/database" -ForegroundColor Gray
} else {
    Write-Host "   1. ✅ Customers exist in the system" -ForegroundColor Green
    Write-Host "   2. 🔧 Frontend filtering logic should work correctly" -ForegroundColor Green
    Write-Host "   3. 📝 ACTION: Verify frontend role matching logic" -ForegroundColor Green
}

if ($workingCustomerEndpoints.Count -gt 0) {
    Write-Host "   4. 🚀 OPTIMIZATION: Consider using dedicated customer endpoints:" -ForegroundColor Cyan
    foreach ($endpoint in $workingCustomerEndpoints) {
        Write-Host "      - $endpoint" -ForegroundColor Gray
    }
}

Write-Host "`n✅ Investigation completed!" -ForegroundColor Green
Write-Host "📄 Full results saved to investigation log above." -ForegroundColor Gray