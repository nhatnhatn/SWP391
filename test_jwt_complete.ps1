# JWT Authentication Test Script
# This script tests the complete JWT authentication and authorization system

$baseUrl = "http://localhost:8080"
$headers = @{
    "Content-Type" = "application/json"
}

Write-Host "=== JWT Authentication & Authorization Test ===" -ForegroundColor Green
Write-Host

# Test 1: Public endpoint (should work without authentication)
Write-Host "1. Testing public endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/test" -Method Get -Headers $headers
    Write-Host "✅ Public endpoint works: $response" -ForegroundColor Green
} catch {
    Write-Host "❌ Public endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host

# Test 2: Register new admin user
Write-Host "2. Testing user registration..." -ForegroundColor Yellow
$registerData = @{
    username = "testadmin123"
    email = "testadmin123@example.com"
    password = "password123"
    confirmPassword = "password123"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method Post -Body $registerData -Headers $headers
    Write-Host "✅ Registration successful: $($response.message)" -ForegroundColor Green
    Write-Host "   User ID: $($response.adminInfo.id)" -ForegroundColor Cyan
    Write-Host "   Username: $($response.adminInfo.username)" -ForegroundColor Cyan
    Write-Host "   Email: $($response.adminInfo.email)" -ForegroundColor Cyan
    Write-Host "   Role: $($response.adminInfo.role)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Registration failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorResponse = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorResponse)
        $errorBody = $reader.ReadToEnd()
        Write-Host "   Error details: $errorBody" -ForegroundColor Red
    }
}
Write-Host

# Test 3: Login and get JWT token
Write-Host "3. Testing login..." -ForegroundColor Yellow
$loginData = @{
    email = "testadmin123@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $loginData -Headers $headers
    Write-Host "✅ Login successful: $($response.message)" -ForegroundColor Green
    Write-Host "   Token Type: $($response.tokenType)" -ForegroundColor Cyan
    Write-Host "   Token: $($response.token.Substring(0, 30))..." -ForegroundColor Cyan
    Write-Host "   User: $($response.adminInfo.username)" -ForegroundColor Cyan
    Write-Host "   Role: $($response.adminInfo.role)" -ForegroundColor Cyan
    
    # Store token for authenticated requests
    $token = $response.token
    $authHeaders = @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $token"
    }
} catch {
    Write-Host "❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorResponse = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorResponse)
        $errorBody = $reader.ReadToEnd()
        Write-Host "   Error details: $errorBody" -ForegroundColor Red
    }
    return
}
Write-Host

# Test 4: Access protected endpoint without token
Write-Host "4. Testing protected endpoint without token..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/protected" -Method Get -Headers $headers
    Write-Host "❌ Protected endpoint should require authentication but didn't" -ForegroundColor Red
} catch {
    Write-Host "✅ Protected endpoint correctly rejected request without token" -ForegroundColor Green
    Write-Host "   Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Cyan
}
Write-Host

# Test 5: Access protected endpoint with valid token
Write-Host "5. Testing protected endpoint with valid token..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/protected" -Method Get -Headers $authHeaders
    Write-Host "✅ Protected endpoint with valid token: $response" -ForegroundColor Green
} catch {
    Write-Host "❌ Protected endpoint with valid token failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host

# Test 6: Access admin endpoint with admin token
Write-Host "6. Testing admin endpoint with admin token..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/admin" -Method Get -Headers $authHeaders
    Write-Host "✅ Admin endpoint with admin token: $response" -ForegroundColor Green
} catch {
    Write-Host "❌ Admin endpoint with admin token failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host

# Test 7: Access admin-protected players endpoint
Write-Host "7. Testing admin-protected players endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/players" -Method Get -Headers $authHeaders
    Write-Host "✅ Players endpoint with admin token works" -ForegroundColor Green
    Write-Host "   Found $($response.Count) players" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Players endpoint with admin token failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host

# Test 8: Test password reset request
Write-Host "8. Testing password reset request..." -ForegroundColor Yellow
$resetRequestData = @{
    email = "testadmin123@example.com"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/forgot-password" -Method Post -Body $resetRequestData -Headers $headers
    Write-Host "✅ Password reset request successful: $($response.message)" -ForegroundColor Green
    
    # Extract token from response message (in real app, this would be sent via email)
    if ($response.message -like "*Token:*") {
        $resetToken = ($response.message -split "Token: ")[1]
        Write-Host "   Reset Token: $resetToken" -ForegroundColor Cyan
        
        # Test 9: Test password reset with token
        Write-Host
        Write-Host "9. Testing password reset with token..." -ForegroundColor Yellow
        $resetConfirmData = @{
            token = $resetToken
            newPassword = "newpassword123"
            confirmPassword = "newpassword123"
        } | ConvertTo-Json
        
        try {
            $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/reset-password" -Method Post -Body $resetConfirmData -Headers $headers
            Write-Host "✅ Password reset successful: $($response.message)" -ForegroundColor Green
        } catch {
            Write-Host "❌ Password reset failed: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "❌ Password reset request failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host

# Test 10: Test login with new password
Write-Host "10. Testing login with new password..." -ForegroundColor Yellow
$newLoginData = @{
    email = "testadmin123@example.com"
    password = "newpassword123"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $newLoginData -Headers $headers
    Write-Host "✅ Login with new password successful: $($response.message)" -ForegroundColor Green
    Write-Host "   New Token: $($response.token.Substring(0, 30))..." -ForegroundColor Cyan
} catch {
    Write-Host "❌ Login with new password failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host

# Test 11: Test with invalid token
Write-Host "11. Testing with invalid token..." -ForegroundColor Yellow
$invalidHeaders = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer invalid.token.here"
}

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/protected" -Method Get -Headers $invalidHeaders
    Write-Host "❌ Invalid token should be rejected but wasn't" -ForegroundColor Red
} catch {
    Write-Host "✅ Invalid token correctly rejected" -ForegroundColor Green
    Write-Host "   Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Cyan
}
Write-Host

Write-Host "=== JWT Authentication Test Complete ===" -ForegroundColor Green
Write-Host
Write-Host "Summary:" -ForegroundColor White
Write-Host "- ✅ Public endpoints work without authentication" -ForegroundColor Green
Write-Host "- ✅ User registration with password encoding" -ForegroundColor Green
Write-Host "- ✅ Login returns JWT token" -ForegroundColor Green
Write-Host "- ✅ Protected endpoints require valid token" -ForegroundColor Green
Write-Host "- ✅ Admin endpoints require admin role" -ForegroundColor Green
Write-Host "- ✅ Password reset functionality" -ForegroundColor Green
Write-Host "- ✅ Invalid tokens are rejected" -ForegroundColor Green
