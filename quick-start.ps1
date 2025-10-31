# KeypicksVIVU Quick Start Script for Windows
Write-Host "🚀 KeypicksVIVU Quick Start Script" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js version
Write-Host "📋 Checking Node.js..." -ForegroundColor Yellow

try {
    $nodeVersion = node -v 2>$null
    $nodeVersionNum = $nodeVersion -replace 'v', ''
    $nodeMajor = [int]($nodeVersionNum -split '\.')[0]

    if ($nodeMajor -lt 24) {
        Write-Host "✗ Node.js phiên bản không hợp lệ: $nodeVersion" -ForegroundColor Red
        Write-Host "Yêu cầu Node.js >= 24.0.0" -ForegroundColor Yellow
        Write-Host "Vui lòng cài đặt Node.js 24.x từ: https://nodejs.org/" -ForegroundColor Yellow
        exit 1
    }

    Write-Host "✓ Node.js $nodeVersion" -ForegroundColor Green
}
catch {
    Write-Host "✗ Node.js chưa được cài đặt" -ForegroundColor Red
    Write-Host "Vui lòng cài đặt Node.js 24.x từ: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check npm version
Write-Host "📋 Checking npm..." -ForegroundColor Yellow

try {
    $npmVersion = npm -v 2>$null
    $npmMajor = [int]($npmVersion -split '\.')[0]

    if ($npmMajor -lt 10) {
        Write-Host "✗ npm phiên bản không hợp lệ: $npmVersion" -ForegroundColor Red
        Write-Host "Yêu cầu npm >= 10.0.0" -ForegroundColor Yellow
        Write-Host "Chạy lệnh: npm install -g npm@latest" -ForegroundColor Yellow
        exit 1
    }

    Write-Host "✓ npm $npmVersion" -ForegroundColor Green
}
catch {
    Write-Host "✗ npm chưa được cài đặt" -ForegroundColor Red
    exit 1
}

# Check if Docker is installed
Write-Host "📋 Checking Docker..." -ForegroundColor Yellow

try {
    $null = docker --version 2>$null
    $null = docker-compose --version 2>$null
    Write-Host "✓ Docker is available" -ForegroundColor Green
}
catch {
    Write-Host "✗ Docker hoặc Docker Compose chưa được cài đặt" -ForegroundColor Red
    Write-Host "Vui lòng cài đặt Docker từ: https://docs.docker.com/desktop/install/windows-install/" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Check if .env file exists
if (-not (Test-Path .env)) {
    Write-Host "⚠ File .env chưa tồn tại" -ForegroundColor Yellow
    Write-Host "ℹ Đang tạo .env từ env.example..." -ForegroundColor Blue
    Copy-Item env.example .env
    Write-Host "✓ Đã tạo file .env" -ForegroundColor Green
    Write-Host ""
}

# Check and install node_modules
Write-Host "📦 Checking node_modules..." -ForegroundColor Yellow
if (-not (Test-Path node_modules)) {
    Write-Host "⚠ node_modules chưa tồn tại" -ForegroundColor Yellow
    Write-Host "ℹ Đang cài đặt dependencies..." -ForegroundColor Blue
    npm install

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Dependencies đã được cài đặt thành công" -ForegroundColor Green
    } else {
        Write-Host "✗ Cài đặt dependencies thất bại" -ForegroundColor Red
        exit 1
    }
    Write-Host ""
} else {
    Write-Host "✓ node_modules đã tồn tại" -ForegroundColor Green
    Write-Host ""
}

Write-Host ""

# Check if Docker containers exist
Write-Host "📋 Checking Docker containers..." -ForegroundColor Yellow

$containerExists = docker ps -a --filter "name=keypicksvivu-mongodb-dev" --format "{{.Names}}" 2>$null

if ($containerExists) {
    Write-Host "✓ Docker containers đã tồn tại" -ForegroundColor Green
    Write-Host "ℹ Đang khởi động MongoDB và Mongo Express..." -ForegroundColor Blue
    Write-Host ""

    # Start only mongodb and mongo-express
    docker-compose start mongodb mongo-express

    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Khởi động MongoDB và Mongo Express thất bại" -ForegroundColor Red
        exit 1
    }
}
else {
    Write-Host "⚠ Docker containers chưa được tạo" -ForegroundColor Yellow
    Write-Host "ℹ Đang khởi động MongoDB và Mongo Express lần đầu..." -ForegroundColor Blue
    Write-Host ""

    # Start only mongodb and mongo-express
    docker-compose up -d mongodb mongo-express

    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Khởi động MongoDB và Mongo Express thất bại" -ForegroundColor Red
        exit 1
    }
}

# Wait for MongoDB to be ready
Write-Host ""
Write-Host "ℹ Đợi MongoDB khởi động hoàn tất..." -ForegroundColor Blue
Start-Sleep -Seconds 5

# Check if MongoDB is accessible
try {
    docker exec keypicksvivu-mongodb-dev mongosh --eval "db.runCommand({ ping: 1 })" 2>$null | Out-Null
    Write-Host "✓ MongoDB đã sẵn sàng!" -ForegroundColor Green
}
catch {
    Write-Host "⚠ MongoDB đang khởi động, đợi thêm..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
}

Write-Host ""
Write-Host "✓ MongoDB và Mongo Express đã được khởi động!" -ForegroundColor Green
Write-Host ""
Write-Host "  🗄️  MongoDB:      " -NoNewline
Write-Host "mongodb://localhost:27017" -ForegroundColor Blue
Write-Host "  🗄️  Mongo Express: " -NoNewline
Write-Host "http://localhost:8081" -ForegroundColor Blue
Write-Host ""

# Ask if user wants to seed database
$seedResponse = Read-Host "Bạn có muốn seed dữ liệu mẫu vào database? (Y/n)"
if ($seedResponse -ne 'n' -and $seedResponse -ne 'N') {
    Write-Host "ℹ Đang seed database..." -ForegroundColor Blue
    npm run seed

    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✓ Database đã được seed thành công!" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "✗ Seed database thất bại" -ForegroundColor Red
        Write-Host "Bạn có thể seed lại sau bằng lệnh: npm run seed" -ForegroundColor Yellow
    }
} else {
    Write-Host "ℹ Bỏ qua seed. Bạn có thể seed sau bằng lệnh: npm run seed" -ForegroundColor Blue
}

Write-Host ""
Write-Host "  💡 Bây giờ bạn có thể chạy app locally:" -ForegroundColor Yellow
Write-Host "     " -NoNewline
Write-Host "npm run dev" -ForegroundColor Green
Write-Host ""
Write-Host "  Quản lý Docker:"
Write-Host "  - Xem logs: " -NoNewline
Write-Host "docker-compose logs -f" -ForegroundColor Green
Write-Host "  - Dừng:     " -NoNewline
Write-Host "docker-compose stop" -ForegroundColor Green
Write-Host "  - Tắt hẳn:  " -NoNewline
Write-Host "docker-compose down" -ForegroundColor Green
Write-Host ""

