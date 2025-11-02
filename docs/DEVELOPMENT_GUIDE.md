# 🛠️ Development Guide - KeypicksVIVU

## 🚀 Quick Start

### Setup Lần Đầu

**Chạy Quick Start Script**
```bash
# Linux/macOS
chmod +x quick-start.sh
./quick-start.sh

# Windows
.\quick-start.ps1
```

Script thông minh sẽ tự động:
1. ✅ Kiểm tra Node.js 24+, npm 10+, Docker
2. ✅ Tạo file `.env` từ `env.example` (nếu chưa có)
3. ✅ Cài đặt dependencies (nếu chưa có)
4. ✅ Pull MongoDB và Mongo Express Docker images
5. ✅ Khởi động MongoDB và Mongo Express containers
6. ✅ Build Tailwind CSS

> **💡 Pro Tip**: Nếu bạn dùng VS Code, xem section **[🐳 DevContainer Development](#-devcontainer-development)** để setup môi trường development tự động với tất cả extensions và MongoDB tools được cài sẵn!

### Workflow Phát Triển

```bash
# 1. Khởi động MongoDB và Mongo Express (nếu chưa chạy)
./quick-start.sh
# hoặc
make dev

# 2. Chạy app locally
npm run dev

# 3. (Optional) Seed database
npm run seed

# 4. Làm việc với code... (nodemon sẽ tự động restart khi có thay đổi)

# 5. Dừng MongoDB khi xong (optional)
docker-compose down
```

## 🏗️ Kiến Trúc Development

### Services

| Service        | Chạy ở đâu | Port  | Credentials     | Mục đích           |
| -------------- | ---------- | ----- | --------------- | ------------------ |
| MongoDB        | Docker     | 27017 | admin/admin123  | Database           |
| Mongo Express  | Docker     | 8081  | admin/admin123  | Database Admin UI  |
| Express App    | Local      | 3000  | -               | Backend API        |

### Connection

```
┌─────────────────────┐
│   Your Machine      │
│                     │
│  ┌──────────────┐   │     ┌──────────────────┐
│  │ Express App  │   │────→│ MongoDB          │
│  │ (localhost)  │   │     │ (Docker)         │
│  │ Port 3000    │   │     │ Port 27017       │
│  └──────────────┘   │     └──────────────────┘
│                     │
│                     │     ┌──────────────────┐
│   Browser           │────→│ Mongo Express    │
│                     │     │ (Docker)         │
│                     │     │ Port 8081        │
└─────────────────────┘     └──────────────────┘
```

**Connection String:**
```
mongodb://admin:admin123@localhost:27017/keypicksvivu?authSource=admin
```

## 🐳 DevContainer Development

### Giới thiệu

DevContainer cho phép bạn phát triển trong một môi trường Docker được cấu hình sẵn với tất cả tools và extensions cần thiết. Điều này đảm bảo:
- ✅ Môi trường phát triển nhất quán giữa các developers
- ✅ Setup nhanh chóng (chỉ cần VS Code + Docker)
- ✅ Tự động cài đặt extensions và tools
- ✅ Không làm "bẩn" máy local với các dependencies

### Prerequisites

1. **Docker Desktop** - phải đang chạy
2. **VS Code** với extension:
   - Dev Containers (ms-vscode-remote.remote-containers)

### Setup DevContainer

**Bước 1: Tạo thư mục `.devcontainer`**

```bash
mkdir .devcontainer
```

**Bước 2: Tạo file `.devcontainer/devcontainer.json`**

```json
{
  "name": "KeypicksVIVU Development",
  "dockerComposeFile": "../docker-compose.yml",
  "service": "app",
  "workspaceFolder": "/workspace",

  "customizations": {
    "vscode": {
      "extensions": [
        // MongoDB
        "mongodb.mongodb-vscode",

        // JavaScript/Node.js
        "dbaeumer.vscode-eslint",
        "esbenp.prettier-vscode",

        // Docker
        "ms-azuretools.vscode-docker",

        // Git
        "eamodio.gitlens",

        // Utilities
        "christian-kohler.path-intellisense",
        "formulahendry.auto-rename-tag",
        "bradlc.vscode-tailwindcss"
      ],
      "settings": {
        "editor.formatOnSave": true,
        "editor.defaultFormatter": "esbenp.prettier-vscode",
        "editor.tabSize": 2,
        "files.eol": "\n"
      }
    }
  },

  "forwardPorts": [3000, 8081, 27017],
  "portsAttributes": {
    "3000": {
      "label": "Express App",
      "onAutoForward": "notify"
    },
    "8081": {
      "label": "Mongo Express",
      "onAutoForward": "silent"
    },
    "27017": {
      "label": "MongoDB",
      "onAutoForward": "silent"
    }
  },

  "postCreateCommand": "npm install && npm run build:css",

  "remoteUser": "node"
}
```

**Bước 3: Update `docker-compose.yml` để support DevContainer**

Thêm service `app` vào `docker-compose.yml`:

```yaml
services:
  # Existing MongoDB service...
  mongodb:
    # ... existing config ...

  # Existing Mongo Express service...
  mongo-express:
    # ... existing config ...

  # DevContainer service
  app:
    build:
      context: .
      dockerfile: .devcontainer/Dockerfile
    volumes:
      - .:/workspace:cached
      - node_modules:/workspace/node_modules
    command: sleep infinity
    environment:
      - NODE_ENV=development
      - MONGODB_URI=mongodb://admin:admin123@mongodb:27017/keypicksvivu?authSource=admin
    depends_on:
      - mongodb
    networks:
      - keypicks-network

volumes:
  mongodb_data:
  node_modules:

networks:
  keypicks-network:
    driver: bridge
```

**Bước 4: Tạo `./Dockerfile.dev`**

```dockerfile
FROM node:24-alpine

# Install basic tools
RUN apk add --no-cache \
    git \
    openssh-client \
    bash \
    curl

# Install global npm packages
RUN npm install -g nodemon

# Set working directory
WORKDIR /workspace

# Create node user (if not exists)
RUN addgroup -g 1000 node || true && \
    adduser -u 1000 -G node -s /bin/bash -D node || true

USER node
```

### Mở Project trong DevContainer

1. **Mở VS Code tại thư mục project**
2. **Press** `F1` hoặc `Ctrl+Shift+P`
3. **Chọn**: "Dev Containers: Reopen in Container"
4. **Đợi** container build và setup (lần đầu có thể mất vài phút)

VS Code sẽ:
- Build DevContainer image
- Install tất cả extensions
- Chạy `postCreateCommand` (npm install + build CSS)
- Mount workspace vào container

### Sử dụng MongoDB Extension trong DevContainer

**MongoDB for VS Code Extension** được tự động cài trong DevContainer.

#### Kết nối MongoDB

1. **Mở MongoDB Extension** (biểu tượng leaf ở sidebar)

2. **Click "Add Connection"**

3. **Nhập connection string:**
   ```
   mongodb://admin:admin123@mongodb:27017/?authSource=admin
   ```

   ⚠️ **Lưu ý**: Trong DevContainer, dùng hostname `mongodb` thay vì `localhost`

4. **Save Connection** với tên: "KeypicksVIVU Local"

#### Thao tác với Database

**1. Browse Collections:**
- Expand connection → databases → `keypicksvivu`
- Xem các collections: airports, airlines, flights, bookings, users

**2. Query trong VS Code:**
- Right-click collection → "View Documents"
- Hoặc tạo file `.mongodb` để viết queries:

```javascript
// queries.mongodb
use('keypicksvivu');

// Find all airports
db.airports.find();

// Find flights from SGN to HAN
db.flights.find({
  "departure.airport": "SGN",
  "arrival.airport": "HAN"
});

// Count total bookings
db.bookings.countDocuments();

// Find user by email
db.users.findOne({ email: "test@example.com" });
```

**3. Execute Queries:**
- Click "Play" button ở đầu mỗi query
- Hoặc `Ctrl+Alt+E` (execute)
- Results hiện trong Output panel

**4. Create/Update/Delete:**
- Right-click document → Edit Document
- Sửa JSON trực tiếp trong editor
- Save để update

**5. Export Data:**
- Right-click collection → Export to JSON/CSV

### Workflow với DevContainer

#### Daily Development

```bash
# 1. Mở VS Code
code .

# 2. Reopen in Container (nếu chưa mở)
# F1 → "Dev Containers: Reopen in Container"

# 3. Trong container terminal, start app
npm run dev

# 4. Mở MongoDB extension để xem/query database

# 5. Code... (hot reload tự động)

# 6. Xong việc, đóng VS Code (container tự stop)
```

#### Seed Database

```bash
# Trong DevContainer terminal
npm run seed

# Refresh MongoDB extension để thấy data mới
```

#### View Database GUI

- **Option 1**: MongoDB Extension trong VS Code (recommended)
- **Option 2**: Mongo Express tại http://localhost:8081

### DevContainer Commands

```bash
# Rebuild container (nếu thay đổi devcontainer.json)
# F1 → "Dev Containers: Rebuild Container"

# Reopen in local (thoát container)
# F1 → "Dev Containers: Reopen Folder Locally"

# View container logs
# F1 → "Dev Containers: Show Container Log"

# Attach shell to container
# F1 → "Dev Containers: Attach Shell"
```

### Cấu hình MongoDB Extension

**Settings trong DevContainer** (`.devcontainer/devcontainer.json`):

```json
{
  "customizations": {
    "vscode": {
      "settings": {
        // MongoDB Extension
        "mongodb.defaultLimit": 50,
        "mongodb.showMongoDBStatusBar": true,
        "mongodb.connectionSaving": "workspaceState",

        // Auto-format MongoDB queries
        "[mongodb]": {
          "editor.formatOnSave": true
        }
      }
    }
  }
}
```

### Lợi ích của DevContainer

| Feature | Local Development | DevContainer |
| ------- | ----------------- | ------------ |
| Setup time | 15-30 phút | 3-5 phút (auto) |
| Node.js version | Phải cài manual | Auto (v24) |
| Extensions | Cài từng người | Auto sync |
| MongoDB tools | Cài riêng | Đã có sẵn |
| Consistency | Khác nhau giữa devs | Giống hệt nhau |
| Clean machine | Dependencies trên máy | Trong container |

### Troubleshooting DevContainer

**Container không start:**
```bash
# Check Docker Desktop đang chạy
docker ps

# View container logs
# F1 → "Dev Containers: Show Container Log"

# Rebuild from scratch
# F1 → "Dev Containers: Rebuild Container Without Cache"
```

**MongoDB Extension không kết nối:**
```bash
# Verify MongoDB container đang chạy
docker ps | grep mongodb

# Check connection string sử dụng hostname 'mongodb'
# (KHÔNG phải 'localhost' trong DevContainer)
mongodb://admin:admin123@mongodb:27017/?authSource=admin

# Restart MongoDB container
docker-compose restart mongodb
```

**npm install fails:**
```bash
# Clear node_modules volume
docker-compose down -v
docker volume rm keypicksvivu_node_modules

# Rebuild container
# F1 → "Dev Containers: Rebuild Container"
```

**Port already in use:**
```bash
# Stop local services trước khi mở DevContainer
docker-compose down

# Hoặc change ports trong docker-compose.yml
```

## 📦 Quản Lý Docker Services

### Khởi động MongoDB

```bash
# Option 1: Quick start script
./quick-start.sh

# Option 2: Makefile
make dev

# Option 3: Docker Compose trực tiếp
docker-compose up -d mongodb mongo-express
```

### Kiểm tra Status

```bash
# Xem containers đang chạy
docker ps

# Hoặc dùng docker-compose
docker-compose ps
```

### Xem Logs

```bash
# Tất cả services
docker-compose logs -f

# Chỉ MongoDB
docker-compose logs -f mongodb

# Chỉ Mongo Express
docker-compose logs -f mongo-express
```

### Dừng Services

```bash
# Dừng nhưng giữ data
docker-compose stop

# Dừng và xóa containers (data vẫn còn trong volumes)
docker-compose down

# Dừng và xóa TOÀN BỘ (bao gồm data)
docker-compose down -v
```

### Restart Services

```bash
# Restart MongoDB
docker-compose restart mongodb

# Restart Mongo Express
docker-compose restart mongo-express
```

## 🗄️ Database Operations

### Seed Database

```bash
# Seed dữ liệu mẫu
npm run seed
```

Import vào database:
- 10 airports (sân bay Việt Nam)
- 4 airlines (hãng bay)
- Sample flights

### Clear Database

```bash
# Xóa toàn bộ dữ liệu
npm run seed:clear
```

⚠️ **Cảnh báo**: Không thể undo!

### MongoDB Shell

```bash
# Access MongoDB shell
make db-shell

# Hoặc
docker-compose exec mongodb mongosh -u admin -p admin123 --authenticationDatabase admin
```

**Example queries:**
```javascript
// Select database
use keypicksvivu

// Show collections
show collections

// Count documents
db.airports.countDocuments()
db.flights.countDocuments()

// Find all airports
db.airports.find().pretty()

// Find flights from SGN to HAN
db.flights.find({
  "departure.airport": "SGN",
  "arrival.airport": "HAN"
}).pretty()

// Find one flight
db.flights.findOne({ flightNumber: "VN210" })
```

### Backup & Restore

```bash
# Backup database
make db-backup
# Tạo file: backups/keypicksvivu_YYYYMMDD_HHMMSS.dump

# Restore database
make db-restore FILE=backups/keypicksvivu_20251025_143022.dump
```

## 🎨 Frontend Development

### CSS (Tailwind + Font Awesome)

Website sử dụng Tailwind CSS và Font Awesome được host locally (không dùng CDN).

```bash
# Build CSS một lần
npm run build:css

# Watch mode (auto-rebuild khi có thay đổi)
npm run watch:css
```

**Khi nào cần build CSS:**
- Sau khi thay đổi HTML classes (Tailwind)
- Sau khi update `tailwind.config.js`
- Sau khi update `ui/css/tailwind-input.css`

Xem chi tiết: [CSS_BUILD_GUIDE.md](./CSS_BUILD_GUIDE.md)

### JavaScript

Frontend JavaScript files trong `ui/js/`:
- `api.js` - API client
- `search.js` - Flight search
- `booking.js` - Booking flow
- `utils.js` - Utility functions

## 🧪 Testing API

### Using curl

```bash
# Health check
curl http://localhost:3000/api/health

# Get airports
curl http://localhost:3000/api/flights/airports/list

# Get airlines
curl http://localhost:3000/api/flights/airlines/list

# Search flights
curl "http://localhost:3000/api/flights/search?departure=SGN&arrival=HAN&date=2025-01-15"

# Get flight details
curl http://localhost:3000/api/flights/FLIGHT_ID
```

### Using Browser

- Frontend: http://localhost:3000
- Mongo Express: http://localhost:8081 (admin/admin123)
- API Health: http://localhost:3000/api/health

## 📝 Environment Variables

File `.env` được tạo tự động từ `env.example`:

```env
# Application
NODE_ENV=development
PORT=3000

# Database - Kết nối qua localhost
MONGODB_URI=mongodb://admin:admin123@localhost:27017/keypicksvivu?authSource=admin

# JWT
JWT_SECRET=your-dev-jwt-secret-key-change-in-production
JWT_EXPIRE=7d

# API
API_BASE_URL=http://localhost:3000/api
```

**⚠️ Lưu ý:**
- App chạy locally, kết nối MongoDB qua `localhost:27017`
- Credentials chỉ dùng cho development
- **Datetime: BẮT BUỘC sử dụng ISO8601 format** (xem [DATETIME_GUIDE.md](./DATETIME_GUIDE.md))

## 🔄 Typical Workflows

### First Time Setup

```bash
# 1. Clone và install
git clone <repo-url>
cd KeypicksVIVU

# 2. Run quick-start script (auto install, setup, start)
chmod +x quick-start.sh
./quick-start.sh

# 3. Start app
npm run dev

# Note: Script đã tự động cài dependencies và seed database
npm run seed

# 5. Open browser
open http://localhost:3000
```

### Daily Development

```bash
# 1. Khởi động MongoDB (nếu chưa chạy)
./quick-start.sh

# 2. Chạy app
npm run dev

# 3. Code...

# 4. Dừng app (Ctrl+C)

# 5. (Optional) Dừng MongoDB
docker-compose down
```

### Database Testing

```bash
# 1. Seed fresh data
npm run seed

# 2. Test app...

# 3. Nếu cần reset
npm run seed:clear
npm run seed
```

### CSS Changes

```bash
# 1. Start CSS watch mode (terminal 1)
npm run watch:css

# 2. Start app (terminal 2)
npm run dev

# 3. Edit HTML/CSS...
# CSS sẽ tự động rebuild
```

## 🐛 Common Issues

### MongoDB không kết nối được

```bash
# Check MongoDB is running
docker ps

# View logs
docker-compose logs mongodb

# Restart MongoDB
docker-compose restart mongodb

# Verify connection string in .env
# Phải là: mongodb://admin:admin123@localhost:27017/...
```

### Port 3000 đã được sử dụng

```bash
# Tìm process đang dùng port
# Windows
netstat -ano | findstr :3000
# Linux/Mac
lsof -i :3000

# Kill process hoặc đổi PORT trong .env
PORT=3001
```

### Database trống sau khi seed

```bash
# Check seed logs
npm run seed

# Kiểm tra MongoDB đang chạy
docker ps

# Verify trong Mongo Express
open http://localhost:8081
```

### CSS không update

```bash
# Rebuild CSS
npm run build:css

# Hoặc dùng watch mode
npm run watch:css

# Clear browser cache (Ctrl+F5)
```

### Hot reload không hoạt động

Nodemon đang watch các files:
- `*.js`
- `routes/**`
- `models/**`
- `middleware/**`

Nếu không hoạt động:
```bash
# Restart app manually
# Ctrl+C rồi npm run dev lại
```

## 📚 Project Structure

```
KeypicksVIVU/
├── config/                    # Configuration files
├── middleware/                # Express middleware
├── models/                    # MongoDB models
│   ├── Airport.js
│   ├── Airline.js
│   ├── Flight.js
│   ├── Booking.js
│   └── User.js
├── routes/                    # API routes
│   ├── flights.js
│   ├── bookings.js
│   ├── auth.js
│   └── users.js
├── scripts/                   # Utility scripts
│   ├── seed.js               # Database seeding
│   └── data/                 # JSON sample data
├── ui/                        # Frontend files
│   ├── css/
│   ├── js/
│   └── pages/
├── server.js                  # Main server file
├── docker-compose.yml         # MongoDB containers
├── docker-compose.prod.yml    # Production setup
├── Dockerfile                 # Production image
├── quick-start.sh             # Quick start script (Linux/Mac)
└── quick-start.ps1            # Quick start script (Windows)
```

## 📖 Useful Commands Cheat Sheet

### DevContainer

| Command | Description |
| ------- | ----------- |
| `F1 → "Reopen in Container"` | Mở project trong DevContainer |
| `F1 → "Rebuild Container"` | Rebuild DevContainer |
| `F1 → "Reopen Folder Locally"` | Thoát DevContainer |

### MongoDB Services

| Command | Description |
| ------- | ----------- |
| `./quick-start.sh` | Khởi động MongoDB & Mongo Express |
| `make dev` | Khởi động MongoDB & Mongo Express (Makefile) |
| `docker-compose down` | Dừng services |
| `docker-compose logs -f` | Xem logs |
| `make db-shell` | MongoDB shell |

### App

| Command | Description |
| ------- | ----------- |
| `npm run dev` | Chạy app (development với hot reload) |
| `npm start` | Chạy app (production mode) |
| `npm run seed` | Seed database |
| `npm run seed:clear` | Xóa database |

### CSS

| Command | Description |
| ------- | ----------- |
| `npm run build:css` | Build Tailwind CSS |
| `npm run watch:css` | Watch mode (auto-rebuild) |

### Database

| Command | Description |
| ------- | ----------- |
| `make db-backup` | Backup database |
| `make db-restore FILE=...` | Restore database |
| `make db-shell` | MongoDB shell |

## 🔒 Security Notes

### Development

- MongoDB: `admin` / `admin123`
- Mongo Express: `admin` / `admin123`

⚠️ **CHỈ dùng cho development!**

### Production

Thay đổi trong `.env`:
```env
MONGO_ROOT_USERNAME=secure_username
MONGO_ROOT_PASSWORD=very_strong_password_here
JWT_SECRET=very-strong-jwt-secret-here
```

## 🚢 Deploy to Production

```bash
# Build production
make prod-build

# View production logs
make prod-logs

# Stop production
make prod-down
```

Xem chi tiết: [DEPLOYMENT.md](DEPLOYMENT.md)

## 📚 Additional Resources

- **[README.md](../README.md)** - Tổng quan dự án
- **[QUICKSTART.md](./QUICKSTART.md)** - Quick start guide
- **[DATETIME_GUIDE.md](./DATETIME_GUIDE.md)** - Datetime handling
- **[DATABASE_COMMANDS_GUIDE.md](./DATABASE_COMMANDS_GUIDE.md)** - Database commands
- **[CSS_BUILD_GUIDE.md](./CSS_BUILD_GUIDE.md)** - CSS build guide
- **🐳 DevContainer Development** - Xem section trên để setup môi trường development với VS Code DevContainer và MongoDB Extension

---

**Happy coding! 🎉**
