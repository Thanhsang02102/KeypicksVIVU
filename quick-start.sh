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

# Check if Docker containers exist
echo "📋 Checking Docker containers..."
CONTAINER_EXISTS=$(docker ps -a --filter "name=keypicksvivu-app-dev" --format "{{.Names}}" 2>/dev/null)

if [ -n "$CONTAINER_EXISTS" ]; then
    echo -e "${GREEN}✓ Docker containers đã tồn tại${NC}"
    echo -e "${BLUE}ℹ Đang khởi động containers...${NC}"
    echo ""
    
    # Start existing containers
    docker-compose start
    
    echo ""
    echo -e "${GREEN}✓ Containers đã được khởi động!${NC}"
    echo ""
    echo -e "  🌐 Application:  ${BLUE}http://localhost:3000${NC}"
    echo -e "  🗄️  Mongo Express: ${BLUE}http://localhost:8081${NC}"
    echo ""
    echo -e "  Xem logs: ${GREEN}docker-compose logs -f${NC}"
    echo -e "  Dừng app: ${GREEN}docker-compose stop${NC}"
    echo -e "  Tắt hẳn:  ${GREEN}docker-compose down${NC}"
    echo ""
else
    echo -e "${YELLOW}⚠ Docker containers chưa được tạo${NC}"
    echo -e "${BLUE}ℹ Chạy init script để setup môi trường...${NC}"
    echo ""
    
    # Check if init script exists and is executable
    if [ ! -f "./init.sh" ]; then
        echo -e "${RED}✗ init.sh không tìm thấy${NC}"
        exit 1
    fi
    
    # Make init script executable if not already
    chmod +x ./init.sh
    
    # Run init script
    ./init.sh
fi

