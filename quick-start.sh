#!/bin/bash

echo "🚀 KeypicksVIVU Quick Start Script"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if MongoDB is running
echo "📋 Step 1: Checking MongoDB..."
if mongosh --eval "db.version()" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ MongoDB is running${NC}"
else
    echo -e "${YELLOW}⚠ MongoDB is not running${NC}"
    echo "Starting MongoDB with Docker..."
    docker run -d -p 27017:27017 --name mongodb mongo:latest
    sleep 3
    if mongosh --eval "db.version()" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ MongoDB started successfully${NC}"
    else
        echo -e "${RED}✗ Failed to start MongoDB${NC}"
        echo "Please start MongoDB manually and run this script again"
        exit 1
    fi
fi
echo ""

# Check if .env exists
echo "📋 Step 2: Checking .env file..."
if [ -f .env ]; then
    echo -e "${GREEN}✓ .env file exists${NC}"
else
    echo -e "${YELLOW}⚠ .env file not found${NC}"
    echo "Creating .env from env.example..."
    cp env.example .env
    echo -e "${GREEN}✓ .env file created${NC}"
    echo -e "${YELLOW}⚠ Please review .env and update if needed${NC}"
fi
echo ""

# Install dependencies
echo "📋 Step 3: Installing dependencies..."
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓ node_modules exists${NC}"
else
    echo "Installing npm packages..."
    npm install
    echo -e "${GREEN}✓ Dependencies installed${NC}"
fi
echo ""

# Seed database
echo "📋 Step 4: Seeding database..."
npm run seed
echo ""

# Start server
echo "📋 Step 5: Starting server..."
echo -e "${GREEN}✓ All setup complete!${NC}"
echo ""
echo "Starting development server..."
echo "Access the application at: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm run dev

