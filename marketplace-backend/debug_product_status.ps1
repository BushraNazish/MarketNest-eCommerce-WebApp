# debug_product_status.ps1
$ErrorActionPreference = "Stop"

# 1. Login
$loginBody = @{
    email = "front_seller@example.com"
    password = "password"
} | ConvertTo-Json
$loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/login" -Method Post -ContentType "application/json" -Body $loginBody
$token = $loginResponse.accessToken
$headers = @{ Authorization = "Bearer $token" }

# 2. Get All Vendor Products (includes DRAFT)
Write-Host "Fetching Vendor Products..."
$products = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/products/vendor/my-products" -Method Get -Headers $headers

$products.content | Format-Table id, name, status, categoryName, description, salePrice

# 3. Check Public Search for 'Mouse'
Write-Host "`nPublic Search for 'Mouse'..."
$search = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/products/search?q=Mouse" -Method Get
if ($search.content) {
    $search.content | Format-Table id, name, status
} else {
    Write-Host "No products found for 'Mouse'."
}

# 4. Check Public Search for 'electronics'
Write-Host "`nPublic Search for 'electronics'..."
$searchElec = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/products/search?q=electronics" -Method Get
if ($searchElec.content) {
    $searchElec.content | Format-Table id, name, status
} else {
    Write-Host "No products found for 'electronics'."
}
