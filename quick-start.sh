#!/bin/bash

echo "🚀 KeypicksVIVU Quick Start Script"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to compare version numbers
version_ge() {
    # Returns 0 if $1 >= $2
    printf '%s\n%s\n' "$2" "$1" | sort -V -C
}

# Check Node.js version
echo "📋 Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js chưa được cài đặt${NC}"
    echo "Vui lòng cài đặt Node.js 24.x từ: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | sed 's/v//')
NODE_MAJOR=$(echo $NODE_VERSION | cut -d. -f1)

if [ "$NODE_MAJOR" -lt 24 ]; then
    echo -e "${RED}✗ Node.js phiên bản không hợp lệ: v$NODE_VERSION${NC}"
    echo "Yêu cầu Node.js >= 24.0.0"
    echo "Vui lòng cài đặt Node.js 24.x từ: https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✓ Node.js v$NODE_VERSION${NC}"

# Check npm version
echo "📋 Checking npm..."
if ! command -v npm &> /dev/null; then
    echo -e "${RED}✗ npm chưa được cài đặt${NC}"
    exit 1
fi

NPM_VERSION=$(npm -v)
NPM_MAJOR=$(echo $NPM_VERSION | cut -d. -f1)

if [ "$NPM_MAJOR" -lt 10 ]; then
    echo -e "${RED}✗ npm phiên bản không hợp lệ: $NPM_VERSION${NC}"
    echo "Yêu cầu npm >= 10.0.0"
    echo "Chạy lệnh: npm install -g npm@latest"
    exit 1
fi

echo -e "${GREEN}✓ npm $NPM_VERSION${NC}"

# Check if Docker is installed
echo "📋 Checking Docker..."
if ! command -v docker &> /dev/null; then
    echo -e "${RED}✗ Docker chưa được cài đặt${NC}"
    echo "Vui lòng cài đặt Docker từ: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}✗ Docker Compose chưa được cài đặt${NC}"
    echo "Vui lòng cài đặt Docker Compose từ: https://docs.docker.com/compose/install/"
    exit 1
fi

echo -e "${GREEN}✓ Docker is available${NC}"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠ File .env chưa tồn tại${NC}"
    echo -e "${BLUE}ℹ Đang tạo .env từ env.example...${NC}"
    cp env.example .env
    echo -e "${GREEN}✓ Đã tạo file .env${NC}"
    echo ""
fi

# Check and install node_modules
echo "📦 Checking node_modules..."
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠ node_modules chưa tồn tại${NC}"
    echo -e "${BLUE}ℹ Đang cài đặt dependencies...${NC}"
    npm install
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Dependencies đã được cài đặt thành công${NC}"
    else
        echo -e "${RED}✗ Cài đặt dependencies thất bại${NC}"
        exit 1
    fi
    echo ""
else
    echo -e "${GREEN}✓ node_modules đã tồn tại${NC}"
    echo ""
fi

# Check if Docker containers exist
echo "📋 Checking Docker containers..."
CONTAINER_EXISTS=$(docker ps -a --filter "name=keypicksvivu-mongodb-dev" --format "{{.Names}}" 2>/dev/null)

if [ -n "$CONTAINER_EXISTS" ]; then
    echo -e "${GREEN}✓ Docker containers đã tồn tại${NC}"
    echo -e "${BLUE}ℹ Đang khởi động MongoDB và Mongo Express...${NC}"
    echo ""

    # Start only mongodb and mongo-express
    docker-compose start mongodb mongo-express

    if [ $? -ne 0 ]; then
        echo -e "${RED}✗ Khởi động MongoDB và Mongo Express thất bại${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠ Docker containers chưa được tạo${NC}"
    echo -e "${BLUE}ℹ Đang khởi động MongoDB và Mongo Express lần đầu...${NC}"
    echo ""

    # Start only mongodb and mongo-express
    docker-compose up -d mongodb mongo-express

    if [ $? -ne 0 ]; then
        echo -e "${RED}✗ Khởi động MongoDB và Mongo Express thất bại${NC}"
        exit 1
    fi
fi

# Wait for MongoDB to be ready
echo ""
echo -e "${BLUE}ℹ Đợi MongoDB khởi động hoàn tất...${NC}"
sleep 5

# Check if MongoDB is accessible
if docker exec keypicksvivu-mongodb-dev mongosh --eval "db.runCommand({ ping: 1 })" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ MongoDB đã sẵn sàng!${NC}"
else
    echo -e "${YELLOW}⚠ MongoDB đang khởi động, đợi thêm...${NC}"
    sleep 5
fi

echo ""
echo -e "${GREEN}✓ MongoDB và Mongo Express đã được khởi động!${NC}"
echo ""
echo -e "  🗄️  MongoDB:      ${BLUE}mongodb://localhost:27017${NC}"
echo -e "  🗄️  Mongo Express: ${BLUE}http://localhost:8081${NC}"
echo ""

# Ask if user wants to seed database
read -p "$(echo -e ${YELLOW})Bạn có muốn seed dữ liệu mẫu vào database? (Y/n): $(echo -e ${NC})" -n 1 -r
echo
if [[ ! $REPLY =~ ^[Nn]$ ]]; then
    echo -e "${BLUE}ℹ Đang seed database...${NC}"
    npm run seed

    if [ $? -eq 0 ]; then
        echo ""
        echo -e "${GREEN}✓ Database đã được seed thành công!${NC}"
    else
        echo ""
        echo -e "${RED}✗ Seed database thất bại${NC}"
        echo -e "${YELLOW}Bạn có thể seed lại sau bằng lệnh: npm run seed${NC}"
    fi
else
    echo -e "${BLUE}ℹ Bỏ qua seed. Bạn có thể seed sau bằng lệnh: npm run seed${NC}"
fi

echo ""
echo -e "  💡 Bây giờ bạn có thể chạy app locally:"
echo -e "     ${GREEN}npm run dev${NC}"
echo ""
echo -e "  Quản lý Docker:"
echo -e "  - Xem logs: ${GREEN}docker-compose logs -f${NC}"
echo -e "  - Dừng:     ${GREEN}docker-compose stop${NC}"
echo -e "  - Tắt hẳn:  ${GREEN}docker-compose down${NC}"
echo ""

