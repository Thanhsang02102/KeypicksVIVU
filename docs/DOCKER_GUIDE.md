# Docker Guide - KeypicksVIVU

> Hướng dẫn sử dụng Docker cho Development và Production

## 📋 Yêu cầu hệ thống

- **Docker Engine** 20.10+
- **Docker Compose** 2.0+

## 🏗️ Kiến Trúc Docker

### Hai môi trường Docker

| File                    | Mục đích         | Services                          |
| ----------------------- | ---------------- | --------------------------------- |
| `docker-compose.yml`    | **Development/DevContainer** | MongoDB + App (không build) + Mongo Express |
| `docker-compose.prod.yml` | **Production**   | MongoDB + App (build từ Dockerfile) |

### Development Environment (docker-compose.yml)

Dành cho **DevContainer** và development:

| Service       | Container Name                  | Port  | Purpose           |
| ------------- | ------------------------------- | ----- | ----------------- |
| App           | keypicksvivu-app-dev            | 3000  | Node.js App (volume mount) |
| MongoDB       | keypicksvivu-mongodb-dev        | 27017 | Database          |
| Mongo Express | keypicksvivu-mongo-express      | 8081  | Database Admin UI |

**Đặc điểm:**
- ✅ App **KHÔNG build** - sử dụng `node:24-alpine` image
- ✅ Source code được mount từ host (volume: `.:/app`)
- ✅ Chạy `npm run dev` với hot-reload
- ✅ Có Mongo Express để quản lý database
- ✅ Phù hợp cho DevContainer và local development

### Production Environment (docker-compose.prod.yml)

Dành cho **Production deployment**:

| Service       | Container Name                  | Port  | Purpose           |
| ------------- | ------------------------------- | ----- | ----------------- |
| App           | keypicksvivu-app-prod           | 3000  | Node.js App (built) |
| MongoDB       | keypicksvivu-mongodb-prod       | 27017 | Database          |

**Đặc điểm:**
- ✅ App được **BUILD** từ Dockerfile
- ✅ Không có Mongo Express (security)
- ✅ Environment variables từ `.env`
- ✅ Health checks và restart policies
- ✅ Production-ready configuration

## 🚀 Các Lệnh Docker

### 🔧 Development (DevContainer)

#### Quick Start Script

**Cách nhanh nhất:**
```bash
./quick-start.sh    # Linux/Mac
```

Script sẽ:
- ✅ Tạo `.env` file (nếu chưa có)
- ✅ Khởi động tất cả services (App + MongoDB + Mongo Express)
- ✅ Hiển thị thông tin services

#### Makefile Commands

```bash
# Khởi động toàn bộ development stack
make dev

# Dừng services
make dev-down

# Xem logs
make dev-logs

# Truy cập MongoDB shell
make db-shell

# Backup database
make db-backup

# Restore database
make db-restore FILE=backups/file.dump

# Xem status
make ps

# Dọn dẹp (xóa containers và volumes)
make clean
```

#### Docker Compose Trực Tiếp

```bash
# Khởi động toàn bộ stack (App + MongoDB + Mongo Express)
docker-compose up -d

# Chỉ khởi động MongoDB và Mongo Express
docker-compose up -d mongodb mongo-express

# Dừng
docker-compose down

# Xem logs
docker-compose logs -f

# Xem logs của một service cụ thể
docker-compose logs -f app
docker-compose logs -f mongodb

# Restart services
docker-compose restart app
docker-compose restart mongodb

# Xem status
docker-compose ps

# Xóa toàn bộ (bao gồm data)
docker-compose down -v
```

### 🚀 Production

#### Docker Compose Production Commands

```bash
# Khởi động production stack
docker-compose -f docker-compose.prod.yml up -d

# Build và khởi động
docker-compose -f docker-compose.prod.yml up -d --build

# Xem logs
docker-compose -f docker-compose.prod.yml logs -f

# Dừng
docker-compose -f docker-compose.prod.yml down

# Xem status
docker-compose -f docker-compose.prod.yml ps

# Rebuild app
docker-compose -f docker-compose.prod.yml build app

# Restart app only
docker-compose -f docker-compose.prod.yml restart app
```

**Lưu ý Production:**
- ⚠️ Đảm bảo file `.env` có đầy đủ production credentials
- ⚠️ Thay đổi `MONGO_ROOT_PASSWORD` và `JWT_SECRET`
- ⚠️ Không expose port MongoDB ra ngoài nếu không cần thiết

## 🔧 Troubleshooting

### 1. Port đã được sử dụng

**Triệu chứng:**
```
Error: bind: address already in use
```

**Giải pháp:**

**Kiểm tra port đang dùng:**
```bash
# Windows
netstat -ano | findstr :27017
netstat -ano | findstr :8081

# Linux/Mac
lsof -i :27017
lsof -i :8081
```

**Dừng process đang dùng port:**
```bash
# Windows
taskkill /PID <PID> /F

# Linux/Mac
kill -9 <PID>
```

**Hoặc đổi port trong `docker-compose.yml`:**
```yaml
services:
  mongodb:
    ports:
      - "27018:27017"  # Thay vì 27017:27017
```

Nhớ update MONGODB_URI trong `.env`:
```env
MONGODB_URI=mongodb://admin:admin123@localhost:27018/keypicksvivu?authSource=admin
```

### 2. MongoDB connection error từ app

**Triệu chứng:**
```
MongoServerError: Authentication failed
MongoNetworkError: connect ECONNREFUSED
```

**Giải pháp:**

**1. Kiểm tra MongoDB đã khởi động:**
```bash
docker ps | grep mongodb
```

**2. Xem logs MongoDB:**
```bash
docker-compose logs mongodb | grep "Waiting for connections"
```

**3. Restart MongoDB:**
```bash
docker-compose restart mongodb
```

**4. Verify connection string:**

**Development (app trong Docker):**
```env
# ✅ Đúng - app chạy trong Docker, dùng service name
MONGODB_URI=mongodb://admin:admin123@mongodb:27017/keypicksvivu?authSource=admin
```

**Local development (app chạy ngoài Docker):**
```env
# ✅ Đúng - app chạy locally, kết nối qua localhost
MONGODB_URI=mongodb://admin:admin123@localhost:27017/keypicksvivu?authSource=admin
```

**5. Reset hoàn toàn:**
```bash
# Development
docker-compose down -v
docker-compose up -d

# Production
docker-compose -f docker-compose.prod.yml down -v
docker-compose -f docker-compose.prod.yml up -d
```

### 3. Container không khởi động

**Triệu chứng:**
```
container exited with code 1
```

**Giải pháp:**

**1. Xem logs để tìm lỗi:**
```bash
docker-compose logs mongodb
docker-compose logs mongo-express
```

**2. Rebuild từ đầu:**
```bash
docker-compose down -v
docker-compose pull
docker-compose up -d
```

### 4. Mongo Express không truy cập được

**Triệu chứng:**
- Container đang chạy nhưng không truy cập được http://localhost:8081

**Giải pháp:**

**1. Kiểm tra container status:**
```bash
docker ps | grep mongo-express
```

**2. Xem logs:**
```bash
docker-compose logs mongo-express
```

**3. Restart Mongo Express:**
```bash
docker-compose restart mongo-express
```

**4. Verify MongoDB đang chạy:**
```bash
docker-compose ps
```

### 5. Disk space đầy

**Triệu chứng:**
```
no space left on device
```

**Giải pháp:**

**Kiểm tra disk usage:**
```bash
docker system df
```

**Dọn dẹp:**
```bash
# Xóa unused containers, images, networks
docker system prune -a

# Xóa unused volumes (cẩn thận - sẽ mất data!)
docker volume prune

# Hoặc dùng make command
make clean
```

### 6. Data bị mất sau khi restart

**Triệu chứng:**
- Database trống sau khi restart containers

**Giải pháp:**

**Kiểm tra volumes:**
```bash
docker volume ls | grep mongodb
```

**Không dùng `-v` khi stop:**
```bash
# ✅ Đúng - giữ data
docker-compose down

# ❌ Sai - xóa data
docker-compose down -v
```

**Restore từ backup:**
```bash
make db-restore FILE=backups/keypicksvivu_YYYYMMDD_HHMMSS.dump
```

### 7. Container chạy chậm

**Giải pháp:**

**Xem resource usage:**
```bash
docker stats

# Hoặc dùng make
make stats
```

**Tăng resources cho Docker Desktop:**
- Mở Docker Desktop > Settings > Resources
- Tăng CPU và Memory allocation

**Giới hạn MongoDB cache size** (đã được set trong docker-compose.yml):
```yaml
command: --wiredTigerCacheSizeGB 1.5
```

## 📦 Cấu trúc Docker Files

```
KeypicksVIVU/
├── docker-compose.yml         # Development/DevContainer
├── docker-compose.prod.yml    # Production deployment
├── Dockerfile                 # Production build image
└── .dockerignore              # Files to ignore in build
```

### docker-compose.yml (Development/DevContainer)

**Mục đích:** Development environment và DevContainer

**Services:**

1. **app**: Node.js Application
   - Image: `node:24-alpine` (không build)
   - Port: `3000`
   - Volume mount: `.:/app` (hot-reload)
   - Command: `npm run dev`
   - Environment: Development mode

2. **mongodb**: MongoDB 7.0
   - Port: `27017`
   - Credentials: `admin` / `admin123`
   - Volume: `mongodb_data` (persistent storage)
   - Health check: enabled

3. **mongo-express**: MongoDB Admin UI
   - Port: `8081`
   - Credentials: `admin` / `admin123`
   - Accessible at: http://localhost:8081

**Đặc điểm:**
- ✅ Source code được mount từ host
- ✅ Hot-reload với nodemon
- ✅ Development tools included
- ✅ Mongo Express cho database management

### docker-compose.prod.yml (Production)

**Mục đích:** Production deployment

**Services:**

1. **app**: Node.js Application
   - Build: từ `Dockerfile`
   - Port: `3000`
   - Environment: Production mode
   - Health check: enabled
   - Restart: always

2. **mongodb**: MongoDB 7.0
   - Port: `27017`
   - Credentials: từ environment variables
   - Volume: `mongodb_data` (persistent storage)
   - Auth: enabled

**Đặc điểm:**
- ✅ App được build từ source
- ✅ Optimized for production
- ✅ No development tools
- ✅ No Mongo Express (security)
- ✅ Environment từ `.env` file

## 🧑‍💻 DevContainer Usage

### Sử dụng với VSCode

**docker-compose.yml** được thiết kế để làm việc với DevContainer trong VSCode:

1. **Mở project trong DevContainer:**
   - Install extension: `Remote - Containers`
   - Command Palette (Ctrl+Shift+P): `Dev Containers: Reopen in Container`

2. **App service sẽ:**
   - Mount source code từ host (`.:/app`)
   - Chạy `npm run dev` tự động
   - Hot-reload khi code thay đổi
   - Kết nối MongoDB qua service name `mongodb`

3. **Lợi ích của DevContainer:**
   - ✅ Môi trường development nhất quán
   - ✅ Không cần cài Node.js trên host
   - ✅ Tất cả dependencies trong container
   - ✅ Dễ dàng onboard team members
   - ✅ Hot-reload và debugging

### Workflow Development

```bash
# 1. Start development environment
docker-compose up -d

# 2. Xem logs để debug
docker-compose logs -f app

# 3. Access app container shell
docker-compose exec app sh

# 4. Chạy npm commands trong container
docker-compose exec app npm install
docker-compose exec app npm test

# 5. Restart app khi cần
docker-compose restart app
```

### DevContainer vs Local Development

| Aspect                | DevContainer (docker-compose.yml) | Local Development        |
| --------------------- | --------------------------------- | ------------------------ |
| Node.js cài đặt       | ❌ Không cần                      | ✅ Phải cài              |
| Dependencies          | Trong container                    | Trên host machine        |
| MongoDB connection    | `mongodb:27017` (service name)    | `localhost:27017`        |
| Code changes          | Hot-reload (volume mount)          | Hot-reload (local)       |
| Môi trường            | Consistent (Docker image)          | Varies by developer      |

## 🐳 Docker Best Practices

### 1. Data Persistence

```bash
# ✅ Giữ data khi dừng
docker-compose down

# ⚠️ Xóa data - chỉ dùng khi cần reset
docker-compose down -v
```

### 2. Backup trước khi xóa data

```bash
# Backup
make db-backup

# Sau đó mới xóa
docker-compose down -v
```

### 3. Security

```bash
# ✅ Không commit .env file
echo ".env" >> .gitignore

# ✅ Thay đổi passwords trong production
MONGO_ROOT_PASSWORD=strong-password-here
```

### 4. Resource Management

Giới hạn resources trong production:

```yaml
services:
  mongodb:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 2G
```

### 5. Logging

```bash
# Xem logs với timestamps
docker-compose logs -f -t

# Limit log lines
docker-compose logs --tail=100

# Specific service
docker-compose logs -f mongodb
```

## 📚 Truy cập Services

### Development Environment (docker-compose.yml)

| Service       | URL                       | Credentials      | Access From     |
| ------------- | ------------------------- | ---------------- | --------------- |
| App           | http://localhost:3000     | -                | Host/Browser    |
| MongoDB       | mongodb://localhost:27017 | admin / admin123 | Host            |
| Mongo Express | http://localhost:8081     | admin / admin123 | Browser         |

### Production Environment (docker-compose.prod.yml)

| Service       | URL                       | Credentials         | Access From     |
| ------------- | ------------------------- | ------------------- | --------------- |
| App           | http://localhost:3000     | -                   | Host/Browser    |
| MongoDB       | mongodb://localhost:27017 | From `.env` file    | Host            |

### MongoDB Connection Strings

#### Development

**Từ app trong DevContainer (docker-compose.yml):**
```
mongodb://admin:admin123@mongodb:27017/keypicksvivu?authSource=admin
```

**Từ host machine (khi test locally):**
```
mongodb://admin:admin123@localhost:27017/keypicksvivu?authSource=admin
```

**Từ MongoDB shell:**
```bash
# Từ host
mongosh mongodb://admin:admin123@localhost:27017/?authSource=admin

# Từ trong container
docker-compose exec mongodb mongosh -u admin -p admin123 --authenticationDatabase admin
```

#### Production

**Từ app (trong docker-compose.prod.yml):**
```
mongodb://${MONGO_ROOT_USERNAME}:${MONGO_ROOT_PASSWORD}@mongodb:27017/keypicksvivu?authSource=admin
```

**Lưu ý:** Thay đổi credentials trong `.env` file cho production!

## 🎯 Quick Commands Reference

### Development Commands

```bash
# === Khởi động ===
./quick-start.sh              # Quick start (recommended)
make dev                      # Start với Makefile
docker-compose up -d          # Start all services

# === Kiểm tra status ===
docker ps                     # List containers
make ps                       # Status (Makefile)
docker-compose ps             # Status với compose

# === Xem logs ===
make dev-logs                 # All logs
docker-compose logs -f        # All logs (live)
docker-compose logs -f app    # App only
docker-compose logs -f mongodb  # MongoDB only

# === Truy cập MongoDB ===
make db-shell                 # MongoDB shell
docker-compose exec mongodb mongosh -u admin -p admin123

# === Database ===
make db-backup                # Backup database
make db-restore FILE=...      # Restore

# === Dừng & Dọn dẹp ===
make dev-down                 # Stop containers
docker-compose down           # Stop (keep data)
docker-compose down -v        # Stop and remove data
make clean                    # Clean all
```

### Production Commands

```bash
# === Khởi động ===
docker-compose -f docker-compose.prod.yml up -d          # Start
docker-compose -f docker-compose.prod.yml up -d --build  # Build & start

# === Kiểm tra status ===
docker-compose -f docker-compose.prod.yml ps             # Status

# === Xem logs ===
docker-compose -f docker-compose.prod.yml logs -f        # All logs
docker-compose -f docker-compose.prod.yml logs -f app    # App only

# === Build ===
docker-compose -f docker-compose.prod.yml build app      # Rebuild app

# === Restart ===
docker-compose -f docker-compose.prod.yml restart app    # Restart app
docker-compose -f docker-compose.prod.yml restart        # Restart all

# === Dừng ===
docker-compose -f docker-compose.prod.yml down           # Stop
docker-compose -f docker-compose.prod.yml down -v        # Stop & remove data
```

## 🚀 Production Deployment Guide

### Chuẩn bị Deploy Production

1. **Tạo `.env` file cho production:**

```env
# MongoDB
MONGO_ROOT_USERNAME=your_secure_username
MONGO_ROOT_PASSWORD=your_secure_password_here

# JWT
JWT_SECRET=your_very_long_random_secret_key_here
JWT_EXPIRE=7d

# Node
NODE_ENV=production
PORT=3000
```

2. **Build và khởi động:**

```bash
# Build app từ Dockerfile
docker-compose -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Verify services đang chạy
docker-compose -f docker-compose.prod.yml ps
```

3. **Kiểm tra health:**

```bash
# Check app health
curl http://localhost:3000/api/health

# Check logs
docker-compose -f docker-compose.prod.yml logs -f app
```

### Production Checklist

- ✅ Thay đổi tất cả default passwords
- ✅ Sử dụng strong JWT_SECRET
- ✅ Setup firewall rules
- ✅ Configure backup schedule
- ✅ Setup monitoring và logging
- ✅ Use HTTPS/SSL (reverse proxy)
- ✅ Limit MongoDB access (không expose public)
- ✅ Regular security updates

### Zero-Downtime Deployment

```bash
# 1. Build new version
docker-compose -f docker-compose.prod.yml build app

# 2. Scale up (optional, nếu có load balancer)
# docker-compose -f docker-compose.prod.yml up -d --scale app=2

# 3. Rolling restart
docker-compose -f docker-compose.prod.yml up -d --no-deps --build app

# 4. Verify
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs -f app
```

### Monitoring Production

```bash
# Xem resource usage
docker stats

# Xem logs real-time
docker-compose -f docker-compose.prod.yml logs -f

# Export logs
docker-compose -f docker-compose.prod.yml logs --since 24h > logs.txt

# Check health status
docker-compose -f docker-compose.prod.yml ps
```

## 📖 Tài liệu liên quan

- **[README.md](../README.md)** - Tổng quan dự án
- **[QUICKSTART.md](./QUICKSTART.md)** - Hướng dẫn khởi động nhanh
- **[DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)** - Development practices
- **[DATABASE_COMMANDS_GUIDE.md](./DATABASE_COMMANDS_GUIDE.md)** - MongoDB commands

## 🆘 Cần thêm trợ giúp?

1. **Kiểm tra logs:**
   ```bash
   docker-compose logs -f
   ```

2. **Rebuild từ đầu:**
   ```bash
   docker-compose down -v
   docker-compose up -d
   ```

3. **Tham khảo documentation:**
   - [Docker Documentation](https://docs.docker.com/)
   - [Docker Compose Documentation](https://docs.docker.com/compose/)
   - [MongoDB Docker Documentation](https://hub.docker.com/_/mongo)

## 📊 Tóm tắt: Development vs Production

### Sự khác biệt chính

| Feature                    | Development (`docker-compose.yml`) | Production (`docker-compose.prod.yml`) |
| -------------------------- | ---------------------------------- | -------------------------------------- |
| **App Container**          | `node:24-alpine` (no build)        | Build từ `Dockerfile`                  |
| **Source Code**            | Volume mount (`.:/app`)            | Copied vào image                       |
| **Hot Reload**             | ✅ Yes                             | ❌ No                                  |
| **Mongo Express**          | ✅ Included                        | ❌ Not included                        |
| **Environment**            | Hardcoded dev values               | Từ `.env` file                         |
| **Restart Policy**         | `unless-stopped`                   | `always`                               |
| **Health Checks**          | MongoDB only                       | App + MongoDB                          |
| **Security**               | Development-friendly               | Production-hardened                    |
| **Build Time**             | ⚡ Fast (no build)                 | 🐢 Slower (build required)             |
| **Use Case**               | DevContainer, Local Dev            | Production Deployment                  |

### Khi nào dùng gì?

**Dùng `docker-compose.yml` khi:**
- 🧑‍💻 Development và testing
- 🔧 Làm việc với DevContainer trong VSCode
- 🔄 Cần hot-reload
- 🗄️ Cần Mongo Express để quản lý database
- ⚡ Muốn start nhanh không cần build

**Dùng `docker-compose.prod.yml` khi:**
- 🚀 Deploy lên production server
- 🔒 Cần security và stability
- 📦 Muốn package app thành image
- 🎯 Không cần development tools
- ⚖️ Cần health checks và monitoring

---

**Happy Dockering!** 🐳✈️
