#!/bin/bash

# KeypicksVIVU Docker Management Script

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

show_help() {
    echo "KeypicksVIVU - Docker Management Script"
    echo ""
    echo "Usage: ./docker.sh [command]"
    echo ""
    echo "Development Commands:"
    echo "  dev          Khởi động môi trường development"
    echo "  dev-build    Build và khởi động môi trường development"
    echo "  dev-down     Dừng môi trường development"
    echo "  dev-logs     Xem logs của môi trường development"
    echo ""
    echo "Production Commands:"
    echo "  prod         Khởi động môi trường production"
    echo "  prod-build   Build và khởi động môi trường production"
    echo "  prod-down    Dừng môi trường production"
    echo "  prod-logs    Xem logs của môi trường production"
    echo ""
    echo "Utility Commands:"
    echo "  clean        Dọn dẹp containers, volumes và images"
    echo "  shell        Truy cập shell của app container"
    echo "  db-shell     Truy cập MongoDB shell (trong container)"
    echo "  health       Kiểm tra health của ứng dụng"
    echo "  stats        Xem resource usage"
    echo "  seed         Seed database với Vietnam timezone data"
    echo "  help         Hiển thị trợ giúp"
    echo ""
    echo "📝 Lưu ý về Docker Environment:"
    echo "  - Tất cả services chạy trong containers với timezone UTC"
    echo "  - MongoDB connection: sử dụng 'mongodb' (service name)"
    echo "  - Seed data: tự động convert từ Asia/Ho_Chi_Minh sang UTC"
}

dev() {
    print_info "Khởi động môi trường development..."
    print_info "Timezone: UTC trong tất cả containers"
    docker-compose up
}

dev_build() {
    print_info "Build và khởi động môi trường development..."
    docker-compose up --build
}

dev_down() {
    print_info "Dừng môi trường development..."
    docker-compose down
    print_success "Đã dừng môi trường development"
}

dev_logs() {
    docker-compose logs -f
}

prod() {
    print_info "Khởi động môi trường production..."
    if [ ! -f .env ]; then
        print_error "File .env không tồn tại. Vui lòng tạo từ env.example"
        exit 1
    fi
    docker-compose -f docker-compose.prod.yml up -d
    print_success "Đã khởi động môi trường production"
}

prod_build() {
    print_info "Build và khởi động môi trường production..."
    if [ ! -f .env ]; then
        print_error "File .env không tồn tại. Vui lòng tạo từ env.example"
        exit 1
    fi
    docker-compose -f docker-compose.prod.yml up --build -d
    print_success "Đã build và khởi động môi trường production"
}

prod_down() {
    print_info "Dừng môi trường production..."
    docker-compose -f docker-compose.prod.yml down
    print_success "Đã dừng môi trường production"
}

prod_logs() {
    docker-compose -f docker-compose.prod.yml logs -f
}

clean() {
    print_info "Dọn dẹp containers, volumes và images..."
    docker-compose down -v
    docker-compose -f docker-compose.prod.yml down -v
    docker system prune -f
    print_success "Đã dọn dẹp xong"
}

shell_access() {
    print_info "Truy cập shell của app container..."
    docker-compose exec app sh
}

db_shell() {
    print_info "Truy cập MongoDB shell (trong Docker container)..."
    print_info "Timezone: UTC - Tất cả timestamps trong DB là UTC"
    docker-compose exec mongodb mongosh -u admin -p admin123 --authenticationDatabase admin
}

health_check() {
    print_info "Kiểm tra health của ứng dụng..."
    response=$(curl -s http://localhost:3000/api/health)
    if [ $? -eq 0 ]; then
        print_success "Ứng dụng đang hoạt động"
        echo "$response" | jq . 2>/dev/null || echo "$response"
    else
        print_error "Không thể kết nối đến ứng dụng"
    fi
}

stats() {
    docker stats --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"
}

seed() {
    print_info "Seed database với Vietnam timezone data..."
    print_info "Data sẽ được convert từ Asia/Ho_Chi_Minh sang UTC"
    docker-compose exec -T app npm run seed
    print_success "Seed hoàn tất!"
}

check_timezone() {
    print_info "Kiểm tra timezone trong containers..."
    echo ""
    echo "App Container:"
    docker-compose exec app sh -c "echo 'TZ='$TZ && date"
    echo ""
    echo "MongoDB Container:"
    docker-compose exec mongodb sh -c "echo 'TZ='$TZ && date"
}

# Main
case "$1" in
    dev)
        dev
        ;;
    dev-build)
        dev_build
        ;;
    dev-down)
        dev_down
        ;;
    dev-logs)
        dev_logs
        ;;
    prod)
        prod
        ;;
    prod-build)
        prod_build
        ;;
    prod-down)
        prod_down
        ;;
    prod-logs)
        prod_logs
        ;;
    clean)
        clean
        ;;
    shell)
        shell_access
        ;;
    db-shell)
        db_shell
        ;;
    health)
        health_check
        ;;
    stats)
        stats
        ;;
    seed)
        seed
        ;;
    timezone|tz)
        check_timezone
        ;;
    help|"")
        show_help
        ;;
    *)
        print_error "Lệnh không hợp lệ: $1"
        echo ""
        show_help
        exit 1
        ;;
esac

