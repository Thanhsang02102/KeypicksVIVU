# KeypicksVIVU Docker Management Script for PowerShell

param(
    [Parameter(Position=0)]
    [string]$Command = "help"
)

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

function Show-Help {
    Write-Host "KeypicksVIVU - Docker Management Script" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage: .\docker.ps1 [command]"
    Write-Host ""
    Write-Host "Development Commands:" -ForegroundColor Green
    Write-Host "  dev          Khởi động môi trường development"
    Write-Host "  dev-build    Build và khởi động môi trường development"
    Write-Host "  dev-down     Dừng môi trường development"
    Write-Host "  dev-logs     Xem logs của môi trường development"
    Write-Host ""
    Write-Host "Production Commands:" -ForegroundColor Green
    Write-Host "  prod         Khởi động môi trường production"
    Write-Host "  prod-build   Build và khởi động môi trường production"
    Write-Host "  prod-down    Dừng môi trường production"
    Write-Host "  prod-logs    Xem logs của môi trường production"
    Write-Host ""
    Write-Host "Utility Commands:" -ForegroundColor Green
    Write-Host "  clean        Dọn dẹp containers, volumes và images"
    Write-Host "  shell        Truy cập shell của app container"
    Write-Host "  db-shell     Truy cập MongoDB shell"
    Write-Host "  health       Kiểm tra health của ứng dụng"
    Write-Host "  stats        Xem resource usage"
    Write-Host "  help         Hiển thị trợ giúp"
}

function Start-Dev {
    Write-Info "Khởi động môi trường development..."
    docker-compose up
}

function Start-DevBuild {
    Write-Info "Build và khởi động môi trường development..."
    docker-compose up --build
}

function Stop-Dev {
    Write-Info "Dừng môi trường development..."
    docker-compose down
    Write-Success "Đã dừng môi trường development"
}

function Show-DevLogs {
    docker-compose logs -f
}

function Start-Prod {
    Write-Info "Khởi động môi trường production..."
    if (-not (Test-Path .env)) {
        Write-Error-Custom "File .env không tồn tại. Vui lòng tạo từ env.example"
        exit 1
    }
    docker-compose -f docker-compose.prod.yml up -d
    Write-Success "Đã khởi động môi trường production"
}

function Start-ProdBuild {
    Write-Info "Build và khởi động môi trường production..."
    if (-not (Test-Path .env)) {
        Write-Error-Custom "File .env không tồn tại. Vui lòng tạo từ env.example"
        exit 1
    }
    docker-compose -f docker-compose.prod.yml up --build -d
    Write-Success "Đã build và khởi động môi trường production"
}

function Stop-Prod {
    Write-Info "Dừng môi trường production..."
    docker-compose -f docker-compose.prod.yml down
    Write-Success "Đã dừng môi trường production"
}

function Show-ProdLogs {
    docker-compose -f docker-compose.prod.yml logs -f
}

function Clear-Docker {
    Write-Info "Dọn dẹp containers, volumes và images..."
    docker-compose down -v
    docker-compose -f docker-compose.prod.yml down -v
    docker system prune -f
    Write-Success "Đã dọn dẹp xong"
}

function Enter-Shell {
    Write-Info "Truy cập shell của app container..."
    docker-compose exec app sh
}

function Enter-DbShell {
    Write-Info "Truy cập MongoDB shell..."
    docker-compose exec mongodb mongosh -u admin -p admin123
}

function Test-Health {
    Write-Info "Kiểm tra health của ứng dụng..."
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:3000/api/health" -Method Get
        Write-Success "Ứng dụng đang hoạt động"
        $response | ConvertTo-Json
    }
    catch {
        Write-Error-Custom "Không thể kết nối đến ứng dụng"
    }
}

function Show-Stats {
    docker stats --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"
}

# Main execution
switch ($Command.ToLower()) {
    "dev" { Start-Dev }
    "dev-build" { Start-DevBuild }
    "dev-down" { Stop-Dev }
    "dev-logs" { Show-DevLogs }
    "prod" { Start-Prod }
    "prod-build" { Start-ProdBuild }
    "prod-down" { Stop-Prod }
    "prod-logs" { Show-ProdLogs }
    "clean" { Clear-Docker }
    "shell" { Enter-Shell }
    "db-shell" { Enter-DbShell }
    "health" { Test-Health }
    "stats" { Show-Stats }
    "help" { Show-Help }
    default {
        Write-Error-Custom "Lệnh không hợp lệ: $Command"
        Write-Host ""
        Show-Help
        exit 1
    }
}

