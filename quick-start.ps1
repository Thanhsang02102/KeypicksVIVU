# KeypicksVIVU Quick Start Script for Windows
Write-Host "🚀 KeypicksVIVU Quick Start Script" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

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

# Check if Docker containers exist
Write-Host "📋 Checking Docker containers..." -ForegroundColor Yellow

$containerExists = docker ps -a --filter "name=keypicksvivu-app-dev" --format "{{.Names}}" 2>$null

if ($containerExists) {
    Write-Host "✓ Docker containers đã tồn tại" -ForegroundColor Green
    Write-Host "ℹ Đang khởi động containers..." -ForegroundColor Blue
    Write-Host ""
    
    # Start existing containers
    docker-compose start
    
    Write-Host ""
    Write-Host "✓ Containers đã được khởi động!" -ForegroundColor Green
    Write-Host ""
    Write-Host "  🌐 Application:  " -NoNewline
    Write-Host "http://localhost:3000" -ForegroundColor Blue
    Write-Host "  🗄️  Mongo Express: " -NoNewline
    Write-Host "http://localhost:8081" -ForegroundColor Blue
    Write-Host ""
    Write-Host "  Xem logs: " -NoNewline
    Write-Host "docker-compose logs -f" -ForegroundColor Green
    Write-Host "  Dừng app: " -NoNewline
    Write-Host "docker-compose stop" -ForegroundColor Green
    Write-Host "  Tắt hẳn:  " -NoNewline
    Write-Host "docker-compose down" -ForegroundColor Green
    Write-Host ""
}
else {
    Write-Host "⚠ Docker containers chưa được tạo" -ForegroundColor Yellow
    Write-Host "ℹ Chạy init script để setup môi trường..." -ForegroundColor Blue
    Write-Host ""
    
    # Check if init script exists
    if (-not (Test-Path ".\init.ps1")) {
        Write-Host "✗ init.ps1 không tìm thấy" -ForegroundColor Red
        exit 1
    }
    
    # Run init script
    & ".\init.ps1"
}

