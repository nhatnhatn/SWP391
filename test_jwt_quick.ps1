# Test with a different username to avoid conflicts
$baseUrl = "http://localhost:8080"
$headers = @{
    "Content-Type" = "application/json"
}

Write-Host "=== Testing with new unique username ===" -ForegroundColor Green
Write-Host

# Generate unique username
$timestamp = (Get-Date).ToString("yyyyMMddHHmmss")
$uniqueUsername = "admin$timestamp"
$uniqueEmail = "admin$timestamp@example.com"

Write-Host "Testing with username: $uniqueUsername" -ForegroundColor Cyan
Write-Host "Testing with email: $uniqueEmail" -ForegroundColor Cyan
Write-Host

# Test registration with unique user
Write-Host "1. Testing user registration with unique username..." -ForegroundColor Yellow
$registerData = @{
    username = $uniqueUsername
    email = $uniqueEmail
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
    return
}
Write-Host

# Test login with the new user
Write-Host "2. Testing login with new user..." -ForegroundColor Yellow
$loginData = @{
    email = $uniqueEmail
    password = "password123"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $loginData -Headers $headers
    Write-Host "✅ Login successful: $($response.message)" -ForegroundColor Green
    Write-Host "   Token Type: $($response.tokenType)" -ForegroundColor Cyan
    Write-Host "   Token: $($response.token.Substring(0, 50))..." -ForegroundColor Cyan
    Write-Host "   User: $($response.adminInfo.username)" -ForegroundColor Cyan
    Write-Host "   Role: $($response.adminInfo.role)" -ForegroundColor Cyan
    
    # Store token for authenticated requests
    $token = $response.token
    $authHeaders = @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $token"
    }
    
    Write-Host
    Write-Host "3. Testing protected endpoint with valid token..." -ForegroundColor Yellow
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/protected" -Method Get -Headers $authHeaders
        Write-Host "✅ Protected endpoint with valid token: $response" -ForegroundColor Green
    } catch {
        Write-Host "❌ Protected endpoint with valid token failed: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $errorResponse = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorResponse)
            $errorBody = $reader.ReadToEnd()
            Write-Host "   Error details: $errorBody" -ForegroundColor Red
        }
    }
    
} catch {
    Write-Host "❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorResponse = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorResponse)
        $errorBody = $reader.ReadToEnd()
        Write-Host "   Error details: $errorBody" -ForegroundColor Red
    }
}
Write-Host
