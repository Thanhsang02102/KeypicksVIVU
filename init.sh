#!/bin/bash

# KeypicksVIVU - Initial Setup Script
# This script will setup everything you need to get started

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

print_header() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Print welcome message
clear
echo ""
print_header "KeypicksVIVU - Initial Setup"
echo ""
echo "  ✈️  Flight Booking System"
echo "  🐳  Docker-based Development Environment"
echo ""

# Step 1: Check Docker installation
print_header "1. Kiểm tra Docker"
if command -v docker &> /dev/null; then
    docker_version=$(docker --version)
    print_success "Docker đã được cài đặt: $docker_version"
else
    print_error "Docker chưa được cài đặt"
    echo "Vui lòng cài đặt Docker từ: https://docs.docker.com/get-docker/"
    exit 1
fi

if command -v docker-compose &> /dev/null; then
    compose_version=$(docker-compose --version)
    print_success "Docker Compose đã được cài đặt: $compose_version"
else
    print_error "Docker Compose chưa được cài đặt"
    echo "Vui lòng cài đặt Docker Compose từ: https://docs.docker.com/compose/install/"
    exit 1
fi

# Step 2: Create .env file
print_header "2. Cấu hình môi trường"
if [ -f .env ]; then
    print_info ".env file đã tồn tại"
    read -p "Bạn có muốn ghi đè không? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cp env.example .env
        print_success "Đã tạo .env từ env.example"
    else
        print_info "Giữ nguyên file .env hiện tại"
    fi
else
    cp env.example .env
    print_success "Đã tạo .env từ env.example"
fi

# Step 3: Make scripts executable
print_header "3. Cấp quyền thực thi cho scripts"
chmod +x docker.sh
print_success "Đã cấp quyền cho docker.sh"

# Step 4: Pull Docker images (skip if already exists)
print_header "4. Pull Docker images"

# Extract image names from docker-compose.yml using sed
MONGO_IMAGE=$(grep -E "^\s*image:\s*mongo:" docker-compose.yml | head -1 | sed 's/.*image:\s*\(.*\)/\1/')
MONGO_EXPRESS_IMAGE=$(grep -E "^\s*image:\s*mongo-express:" docker-compose.yml | head -1 | sed 's/.*image:\s*\(.*\)/\1/')

# Check if MongoDB image exists
if docker image inspect "$MONGO_IMAGE" &> /dev/null; then
    print_success "MongoDB image ($MONGO_IMAGE) đã tồn tại, bỏ qua pull"
else
    print_info "Đang pull MongoDB image ($MONGO_IMAGE)..."
    docker pull "$MONGO_IMAGE"
    print_success "Đã pull MongoDB image"
fi

# Check if Mongo Express image exists
if docker image inspect "$MONGO_EXPRESS_IMAGE" &> /dev/null; then
    print_success "Mongo Express image ($MONGO_EXPRESS_IMAGE) đã tồn tại, bỏ qua pull"
else
    print_info "Đang pull Mongo Express image ($MONGO_EXPRESS_IMAGE)..."
    docker pull "$MONGO_EXPRESS_IMAGE"
    print_success "Đã pull Mongo Express image"
fi

# Step 5: Build CSS
print_header "5. Build CSS locally"
print_info "Đang build Tailwind CSS và setup Font Awesome..."
if [ -f "node_modules/.bin/tailwindcss.cmd" ] || [ -f "node_modules/.bin/tailwindcss" ]; then
    npm run build:css
    print_success "CSS đã được build thành công"
else
    print_warning "Tailwind CSS chưa được cài đặt. Cài đặt dependencies..."
    npm install
    npm run build:css
    print_success "CSS đã được build thành công"
fi

# Step 6: Build application
print_header "6. Build ứng dụng Docker"
print_info "Đang build ứng dụng..."
docker-compose build

# Success message
print_header "✅ Setup hoàn tất!"
echo ""
echo "  Để khởi động ứng dụng:"
echo ""
echo -e "  ${GREEN}Option 1:${NC} docker-compose up"
echo -e "  ${GREEN}Option 2:${NC} ./docker.sh dev"
echo -e "  ${GREEN}Option 3:${NC} make dev"
echo ""
echo "  Sau đó truy cập (từ host machine):"
echo -e "  - Ứng dụng:     ${BLUE}http://localhost:3000${NC}"
echo -e "  - Mongo Express: ${BLUE}http://localhost:8081${NC}"
echo ""
echo -e "  ${YELLOW}⚠️  Lưu ý về Docker Environment:${NC}"
echo "  - Tất cả services chạy trong containers với timezone UTC"
echo "  - Kết nối giữa containers: sử dụng service names (mongodb, app)"
echo "  - Không sử dụng localhost để kết nối giữa containers"
echo "  - Seed data: Vietnam time (UTC+7) tự động convert sang UTC"
echo ""
echo "  Để xem thêm lệnh: ./docker.sh help hoặc make help"
echo ""

# Ask if user wants to start now
read -p "Bạn có muốn khởi động ngay bây giờ? (Y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Nn]$ ]]; then
    print_info "Đang khởi động ứng dụng..."
    docker-compose up -d
    
    # Wait for services to be ready
    print_info "Đợi services khởi động (3 giây)..."
    sleep 3
    
    # Ask if user wants to seed database
    echo ""
    read -p "Bạn có muốn seed dữ liệu mẫu vào database? (Y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        print_info "Đang seed database..."
        docker-compose exec -T app npm run seed
        print_success "Database đã được seed thành công!"
        echo ""
        print_info "Bạn có thể:"
        echo -e "  - Xem logs: ${GREEN}docker-compose logs -f${NC}"
        echo -e "  - Seed lại:  ${GREEN}make seed${NC}"
        echo -e "  - Dừng app: ${GREEN}docker-compose down${NC}"
    else
        print_info "Bỏ qua seed. Bạn có thể seed sau bằng lệnh: ${GREEN}make seed${NC}"
    fi
    
    echo ""
    print_success "Ứng dụng đang chạy tại: ${BLUE}http://localhost:3000${NC}"
    print_info "Timezone: Tất cả containers chạy ở UTC"
    print_info "Seed data: Tự động convert từ Asia/Ho_Chi_Minh sang UTC"
    echo ""
    echo -e "  Xem logs: ${GREEN}docker-compose logs -f${NC}"
    echo -e "  Check timezone: ${GREEN}docker-compose exec app date${NC}"
else
    print_info "Chạy 'docker-compose up' khi bạn sẵn sàng!"
    print_info "Sau đó seed database bằng: ${GREEN}make seed${NC}"
    echo ""
    print_info "Lưu ý: Môi trường development chạy hoàn toàn trong Docker"
    print_info "       - MongoDB: service name 'mongodb' (không dùng localhost)"
    print_info "       - Timezone: UTC trong tất cả containers"
    print_info "       - Seed data: Vietnam time tự động convert sang UTC"
fi

