# KeypicksVIVU Quick Start Script for Windows
Write-Host "🚀 KeypicksVIVU Quick Start Script" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check MongoDB
Write-Host "📋 Step 1: Checking MongoDB..." -ForegroundColor Yellow

$mongoRunning = $false
try {
    $null = mongosh --eval "db.version()" 2>$null
    $mongoRunning = $true
} catch {
    $mongoRunning = $false
}

if ($mongoRunning) {
    Write-Host "✓ MongoDB is running" -ForegroundColor Green
} else {
    Write-Host "⚠ MongoDB is not running" -ForegroundColor Yellow
    Write-Host "Attempting to start MongoDB with Docker..." -ForegroundColor Yellow
    
    docker run -d -p 27017:27017 --name mongodb mongo:latest
    Start-Sleep -Seconds 3
    
    try {
        $null = mongosh --eval "db.version()" 2>$null
        Write-Host "✓ MongoDB started successfully" -ForegroundColor Green
    } catch {
        Write-Host "✗ Failed to start MongoDB" -ForegroundColor Red
        Write-Host "Please start MongoDB manually:" -ForegroundColor Yellow
        Write-Host "  - Start MongoDB service: net start MongoDB" -ForegroundColor Yellow
        Write-Host "  - Or use Docker: docker run -d -p 27017:27017 --name mongodb mongo:latest" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Then run this script again." -ForegroundColor Yellow
        exit 1
    }
}
Write-Host ""

# Step 2: Check .env file
Write-Host "📋 Step 2: Checking .env file..." -ForegroundColor Yellow

if (Test-Path .env) {
    Write-Host "✓ .env file exists" -ForegroundColor Green
} else {
    Write-Host "⚠ .env file not found" -ForegroundColor Yellow
    Write-Host "Creating .env from env.example..." -ForegroundColor Yellow
    Copy-Item env.example .env
    Write-Host "✓ .env file created" -ForegroundColor Green
    Write-Host "⚠ Please review .env and update MONGODB_URI if needed" -ForegroundColor Yellow
}
Write-Host ""

# Step 3: Install dependencies
Write-Host "📋 Step 3: Checking dependencies..." -ForegroundColor Yellow

if (Test-Path node_modules) {
    Write-Host "✓ node_modules exists" -ForegroundColor Green
} else {
    Write-Host "Installing npm packages..." -ForegroundColor Yellow
    npm install
    Write-Host "✓ Dependencies installed" -ForegroundColor Green
}
Write-Host ""

# Step 4: Seed database
Write-Host "📋 Step 4: Seeding database..." -ForegroundColor Yellow
npm run seed
Write-Host ""

# Step 5: Start server
Write-Host "📋 Step 5: Starting server..." -ForegroundColor Yellow
Write-Host "✓ All setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Starting development server..." -ForegroundColor Cyan
Write-Host "Access the application at: http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

npm run dev

