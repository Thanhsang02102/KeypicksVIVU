# KeypicksVIVU - Initial Setup Script (PowerShell)
# This script will setup everything you need to get started

function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ $Message" -ForegroundColor Yellow
}

function Write-Header {
    param([string]$Message)
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
    Write-Host "  $Message" -ForegroundColor Blue
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
}

# Print welcome message
Clear-Host
Write-Host ""
Write-Header "KeypicksVIVU - Initial Setup"
Write-Host ""
Write-Host "  ✈️  Flight Booking System"
Write-Host "  🐳  Docker-based Development Environment"
Write-Host ""

# Step 1: Check Docker installation
Write-Header "1. Kiểm tra Docker"
try {
    $dockerVersion = docker --version
    Write-Success "Docker đã được cài đặt: $dockerVersion"
}
catch {
    Write-Error-Custom "Docker chưa được cài đặt"
    Write-Host "Vui lòng cài đặt Docker từ: https://docs.docker.com/desktop/install/windows-install/"
    exit 1
}

try {
    $composeVersion = docker-compose --version
    Write-Success "Docker Compose đã được cài đặt: $composeVersion"
}
catch {
    Write-Error-Custom "Docker Compose chưa được cài đặt"
    exit 1
}

# Step 2: Create .env file
Write-Header "2. Cấu hình môi trường"
if (Test-Path .env) {
    Write-Info ".env file đã tồn tại"
    $overwrite = Read-Host "Bạn có muốn ghi đè không? (y/N)"
    if ($overwrite -eq 'y' -or $overwrite -eq 'Y') {
        Copy-Item env.example .env -Force
        Write-Success "Đã tạo .env từ env.example"
    }
    else {
        Write-Info "Giữ nguyên file .env hiện tại"
    }
}
else {
    Copy-Item env.example .env
    Write-Success "Đã tạo .env từ env.example"
}

# Step 3: Pull Docker images (skip if already exists)
Write-Header "3. Pull Docker images"

# Extract image names from docker-compose.yml using PowerShell regex
$mongoImage = (Get-Content docker-compose.yml | Select-String "^\s*image:\s*mongo:" | Select-Object -First 1).Line -replace '^\s*image:\s*', ''
$mongoExpressImage = (Get-Content docker-compose.yml | Select-String "^\s*image:\s*mongo-express:" | Select-Object -First 1).Line -replace '^\s*image:\s*', ''

# Check if MongoDB image exists
try {
    docker image inspect $mongoImage 2>&1 | Out-Null
    Write-Success "MongoDB image ($mongoImage) đã tồn tại, bỏ qua pull"
}
catch {
    Write-Info "Đang pull MongoDB image ($mongoImage)..."
    docker pull $mongoImage
    Write-Success "Đã pull MongoDB image"
}

# Check if Mongo Express image exists
try {
    docker image inspect $mongoExpressImage 2>&1 | Out-Null
    Write-Success "Mongo Express image ($mongoExpressImage) đã tồn tại, bỏ qua pull"
}
catch {
    Write-Info "Đang pull Mongo Express image ($mongoExpressImage)..."
    docker pull $mongoExpressImage
    Write-Success "Đã pull Mongo Express image"
}

# Step 4: Build CSS
Write-Header "4. Build CSS locally"
Write-Info "Đang build Tailwind CSS và setup Font Awesome..."
if (Test-Path "node_modules\.bin\tailwindcss.cmd") {
    npm run build:css
    Write-Success "CSS đã được build thành công"
} else {
    Write-Warning "Tailwind CSS chưa được cài đặt. Cài đặt dependencies..."
    npm install
    npm run build:css
    Write-Success "CSS đã được build thành công"
}

# Step 5: Build application
Write-Header "5. Build ứng dụng Docker"
Write-Info "Đang build ứng dụng..."
docker-compose build

# Success message
Write-Header "✅ Setup hoàn tất!"
Write-Host ""
Write-Host "  Để khởi động ứng dụng:"
Write-Host ""
Write-Host "  Option 1: " -NoNewline -ForegroundColor Green
Write-Host "docker-compose up"
Write-Host "  Option 2: " -NoNewline -ForegroundColor Green
Write-Host ".\docker.ps1 dev"
Write-Host ""
Write-Host "  Sau đó truy cập:"
Write-Host "  - Ứng dụng:      " -NoNewline
Write-Host "http://localhost:3000" -ForegroundColor Blue
Write-Host "  - Mongo Express: " -NoNewline
Write-Host "http://localhost:8081" -ForegroundColor Blue
Write-Host ""
Write-Host "  Để xem thêm lệnh: .\docker.ps1 help"
Write-Host ""

# Ask if user wants to start now
$startNow = Read-Host "Bạn có muốn khởi động ngay bây giờ? (Y/n)"
if ($startNow -ne 'n' -and $startNow -ne 'N') {
    Write-Info "Đang khởi động ứng dụng..."
    docker-compose up -d
    
    # Wait for services to be ready
    Write-Info "Đợi services khởi động (3 giây)..."
    Start-Sleep -Seconds 3
    
    # Ask if user wants to seed database
    Write-Host ""
    $seedNow = Read-Host "Bạn có muốn seed dữ liệu mẫu vào database? (Y/n)"
    if ($seedNow -ne 'n' -and $seedNow -ne 'N') {
        Write-Info "Đang seed database..."
        docker-compose exec -T app npm run seed
        Write-Success "Database đã được seed thành công!"
        Write-Host ""
        Write-Info "Bạn có thể:"
        Write-Host "  - Xem logs: " -NoNewline -ForegroundColor Yellow
        Write-Host "docker-compose logs -f"
        Write-Host "  - Seed lại:  " -NoNewline -ForegroundColor Yellow
        Write-Host "docker-compose exec app npm run seed"
        Write-Host "  - Dừng app: " -NoNewline -ForegroundColor Yellow
        Write-Host "docker-compose down"
    }
    else {
        Write-Info "Bỏ qua seed. Bạn có thể seed sau bằng lệnh: docker-compose exec app npm run seed"
    }
    
    Write-Host ""
    Write-Success "Ứng dụng đang chạy tại: http://localhost:3000"
    Write-Host "  Xem logs: " -NoNewline -ForegroundColor Green
    Write-Host "docker-compose logs -f"
}
else {
    Write-Info "Chạy 'docker-compose up' khi bạn sẵn sàng!"
    Write-Info "Sau đó seed database bằng: docker-compose exec app npm run seed"
}

