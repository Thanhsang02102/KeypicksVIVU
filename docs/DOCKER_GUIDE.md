# Docker Guide - KeypicksVIVU

> Hướng dẫn sử dụng Docker scripts và xử lý các vấn đề khi làm việc với Docker

## 📋 Yêu cầu hệ thống

- **Docker Engine** 20.10+
- **Docker Compose** 2.0+
- **Make** (optional, để dùng Makefile commands)

## 🚀 Docker Scripts - Cách sử dụng

Dự án cung cấp Docker management scripts cho cả Linux/Mac và Windows để quản lý môi trường development và production dễ dàng.

### Linux/Mac: `docker.sh`

```bash
# Cấp quyền thực thi (chỉ cần làm 1 lần)
chmod +x docker.sh

# Sử dụng
./docker.sh [command]
```

### Windows: `docker.ps1`

```powershell
# Nếu gặp lỗi ExecutionPolicy
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process

# Sử dụng
.\docker.ps1 [command]
```

## 📝 Các lệnh Docker Scripts

### Development Commands

#### `dev` - Khởi động môi trường development
```bash
./docker.sh dev          # Linux/Mac
.\docker.ps1 dev         # Windows
```
- Khởi động tất cả services (app, MongoDB, Mongo Express)
- Timezone: UTC trong tất cả containers
- Hot reload enabled
- Logs hiển thị real-time

#### `dev-build` - Rebuild và khởi động development
```bash
./docker.sh dev-build    # Linux/Mac
.\docker.ps1 dev-build   # Windows
```
- Rebuild Docker images từ đầu
- Dùng khi có thay đổi Dockerfile hoặc dependencies

#### `dev-down` - Dừng môi trường development
```bash
./docker.sh dev-down     # Linux/Mac
.\docker.ps1 dev-down    # Windows
```
- Dừng tất cả containers
- Không xóa volumes (data được giữ lại)

#### `dev-logs` - Xem logs development
```bash
./docker.sh dev-logs     # Linux/Mac
.\docker.ps1 dev-logs    # Windows
```
- Xem logs real-time của tất cả services
- Ctrl+C để thoát

### Production Commands

#### `prod` - Khởi động môi trường production
```bash
./docker.sh prod         # Linux/Mac
.\docker.ps1 prod        # Windows
```
- Yêu cầu file `.env` tồn tại
- Chạy containers ở background (-d)
- Sử dụng `docker-compose.prod.yml`

#### `prod-build` - Rebuild và khởi động production
```bash
./docker.sh prod-build   # Linux/Mac
.\docker.ps1 prod-build  # Windows
```
- Build production images với multi-stage Dockerfile
- Optimized cho performance

#### `prod-down` - Dừng môi trường production
```bash
./docker.sh prod-down    # Linux/Mac
.\docker.ps1 prod-down   # Windows
```

#### `prod-logs` - Xem logs production
```bash
./docker.sh prod-logs    # Linux/Mac
.\docker.ps1 prod-logs   # Windows
```

### Utility Commands

#### `shell` - Truy cập app container shell
```bash
./docker.sh shell        # Linux/Mac
.\docker.ps1 shell       # Windows
```
- Mở shell (sh) trong app container
- Dùng để chạy npm commands, debug, inspect files

#### `db-shell` - Truy cập MongoDB shell
```bash
./docker.sh db-shell     # Linux/Mac
.\docker.ps1 db-shell    # Windows
```
- Mở mongosh trong MongoDB container
- Tự động authenticate với admin credentials
- Timezone: UTC

#### `health` - Kiểm tra health của ứng dụng
```bash
./docker.sh health       # Linux/Mac
.\docker.ps1 health      # Windows
```
- Test API health endpoint: `http://localhost:3000/api/health`
- Hiển thị status và response JSON

#### `stats` - Xem resource usage
```bash
./docker.sh stats        # Linux/Mac
.\docker.ps1 stats       # Windows
```
- Hiển thị CPU, Memory, Network I/O của containers
- Real-time monitoring

#### `seed` - Seed database (chỉ Linux/Mac)
```bash
./docker.sh seed
```
- Seed database với Vietnam timezone data
- Tự động convert từ Asia/Ho_Chi_Minh (UTC+7) sang UTC
- Dùng cho development environment

#### `timezone` hoặc `tz` - Kiểm tra timezone (chỉ Linux/Mac)
```bash
./docker.sh timezone
./docker.sh tz
```
- Kiểm tra timezone trong app và MongoDB containers
- Verify cả hai đều ở UTC

#### `clean` - Dọn dẹp Docker
```bash
./docker.sh clean        # Linux/Mac
.\docker.ps1 clean       # Windows
```
- ⚠️ **Cẩn thận**: Xóa tất cả containers, volumes, và images
- **Data sẽ bị mất** - chỉ dùng khi muốn reset hoàn toàn

#### `help` - Hiển thị trợ giúp
```bash
./docker.sh help         # Linux/Mac
.\docker.ps1 help        # Windows
```

## 🛠️ Makefile Commands

Nếu bạn có `make` installed, có thể dùng các commands ngắn gọn hơn:

```bash
# Development
make dev                 # Khởi động dev environment
make dev-build          # Rebuild và khởi động
make down               # Dừng containers
make logs               # Xem logs

# Production
make prod               # Khởi động production
make prod-build         # Build và khởi động production
make prod-down          # Dừng production

# Utilities
make shell              # Truy cập app shell
make db-shell           # Truy cập MongoDB shell
make seed               # Seed database
make timezone           # Kiểm tra timezone
make health             # Health check
make clean              # Dọn dẹp (xóa volumes)
make prune              # Dọn dẹp (giữ volumes)

# Xem tất cả commands
make help
```

## 🔧 Troubleshooting - Xử lý lỗi Docker

### 1. Port đã được sử dụng

**Triệu chứng:**
```
Error: bind: address already in use
```

**Giải pháp:**

**Kiểm tra port đang dùng:**
```bash
# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :27017

# Linux/Mac
lsof -i :3000
lsof -i :27017
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
  app:
    ports:
      - "3001:3000"  # Thay vì 3000:3000
```

### 2. MongoDB connection error

**Triệu chứng:**
```
MongoServerError: Authentication failed
MongoNetworkError: connect ECONNREFUSED
```

**Giải pháp:**

**1. Kiểm tra MongoDB đã khởi động:**
```bash
docker-compose ps
docker-compose logs mongodb | grep "Waiting for connections"
```

**2. Restart MongoDB và app:**
```bash
docker-compose restart mongodb
sleep 5
docker-compose restart app
```

**3. Kiểm tra kết nối network:**
```bash
docker-compose exec app ping -c 2 mongodb
```

**4. Verify MONGODB_URI trong `.env`:**
```env
# ✅ Đúng - dùng service name
MONGODB_URI=mongodb://admin:admin123@mongodb:27017/keypicksvivu?authSource=admin

# ❌ Sai - không dùng localhost trong Docker
MONGODB_URI=mongodb://admin:admin123@localhost:27017/keypicksvivu?authSource=admin
```

**5. Reset hoàn toàn:**
```bash
docker-compose down -v
docker-compose up --build
```

### 3. Hot reload không hoạt động

**Triệu chứng:**
- Code thay đổi nhưng app không tự động restart
- Phải restart container thủ công

**Giải pháp:**

**Trên Windows - Bật polling trong `package.json`:**
```json
{
  "nodemonConfig": {
    "legacyWatch": true,
    "watch": ["*.js", "routes/**", "models/**", "middleware/**"],
    "ext": "js,json"
  }
}
```

**Kiểm tra volumes được mount đúng:**
```yaml
# docker-compose.yml
volumes:
  - .:/app
  - /app/node_modules
```

**Restart container:**
```bash
docker-compose restart app
```

### 4. Timezone không đúng

**Triệu chứng:**
- Timestamps không đúng
- Database query theo time không hoạt động

**Giải pháp:**

**Kiểm tra timezone:**
```bash
# Linux/Mac
./docker.sh timezone

# Hoặc manual
docker-compose exec app date
docker-compose exec mongodb date
```

**Cả hai phải hiển thị UTC:**
```
Sat Oct 25 10:30:45 UTC 2025
```

**Nếu không đúng, rebuild:**
```bash
docker-compose down
docker-compose up --build
```

**Verify Dockerfile có set timezone:**
```dockerfile
ENV TZ=UTC
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
```

### 5. Container không khởi động

**Triệu chứng:**
```
container exited with code 1
```

**Giải pháp:**

**1. Xem logs để tìm lỗi:**
```bash
docker-compose logs app
docker-compose logs mongodb
```

**2. Kiểm tra file `.env` tồn tại:**
```bash
ls -la .env

# Nếu không có, tạo từ template
cp env.example .env
```

**3. Kiểm tra syntax errors trong code:**
```bash
# Truy cập container shell
docker-compose exec app sh

# Test chạy app manually
node server.js
```

**4. Rebuild từ đầu:**
```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up
```

### 6. Quyền truy cập files (Linux/Mac)

**Triệu chứng:**
```
EACCES: permission denied
```

**Giải pháp:**

**Kiểm tra ownership:**
```bash
ls -la
```

**Sửa permissions:**
```bash
# Cho phép user hiện tại access
sudo chown -R $USER:$USER .

# Hoặc thay đổi UID trong Dockerfile
RUN adduser --system --uid $(id -u) nodejs
```

### 7. Disk space đầy

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

# Xóa unused volumes (cẩn thận!)
docker volume prune

# Hoặc dùng script
./docker.sh clean
```

### 8. Build quá chậm

**Giải pháp:**

**1. Sử dụng BuildKit:**
```bash
# Linux/Mac
DOCKER_BUILDKIT=1 docker-compose build

# Windows
$env:DOCKER_BUILDKIT=1
docker-compose build
```

**2. Build specific service:**
```bash
docker-compose build app
```

**3. Use cache hiệu quả - kiểm tra `.dockerignore`:**
```
node_modules
npm-debug.log
.env
.git
```

### 9. Container chạy nhưng không truy cập được

**Triệu chứng:**
- `docker ps` hiển thị container đang chạy
- Không truy cập được `http://localhost:3000`

**Giải pháp:**

**1. Kiểm tra ports mapping:**
```bash
docker-compose ps
```
Phải thấy: `0.0.0.0:3000->3000/tcp`

**2. Kiểm tra app đang listen đúng port:**
```bash
docker-compose logs app | grep "Server is running"
```

**3. Kiểm tra firewall:**
```bash
# Windows
netsh advfirewall firewall show rule name=all | findstr 3000

# Linux
sudo ufw status
```

**4. Test từ trong container:**
```bash
docker-compose exec app wget -O- http://localhost:3000/api/health
```

### 10. PowerShell Execution Policy Error (Windows)

**Triệu chứng:**
```
cannot be loaded because running scripts is disabled on this system
```

**Giải pháp:**

**Cho session hiện tại:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
.\docker.ps1 dev
```

**Cho user hiện tại (persistent):**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Hoặc chạy trực tiếp:**
```powershell
powershell -ExecutionPolicy Bypass -File .\docker.ps1 dev
```

## 📦 Cấu trúc Docker Files

```
KeypicksVIVU/
├── Dockerfile                      # Production build (multi-stage)
├── Dockerfile.dev                  # Development build (hot reload)
├── docker-compose.yml              # Dev environment config
├── docker-compose.prod.yml         # Production environment config
├── docker-compose.override.yml.example  # Local overrides template
├── .dockerignore                   # Files to ignore in build
├── docker.sh                       # Linux/Mac management script
└── docker.ps1                      # Windows management script
```

### Dockerfile (Production)

- **Multi-stage build** để giảm image size
- Alpine Linux base image (nhẹ)
- Non-root user cho security
- Health check included

### Dockerfile.dev (Development)

- Hot reload với nodemon
- Dev dependencies included
- Source code mounted as volume
- Better for debugging

### docker-compose.yml (Development)

Services:
- **app**: Express server (port 3000)
- **mongodb**: MongoDB 7.0 (port 27017)
- **mongo-express**: Database UI (port 8081)

### docker-compose.prod.yml (Production)

- Production-optimized configs
- No mongo-express
- Resource limits
- Restart policies

## 🐳 Docker Best Practices

### 1. Environment Variables

```bash
# ✅ Tốt - dùng .env file
docker-compose up

# ❌ Tránh - hardcode trong docker-compose.yml
```

### 2. Data Persistence

```bash
# ✅ Giữ data khi dừng
docker-compose down

# ⚠️ Xóa data - chỉ dùng khi cần reset
docker-compose down -v
```

### 3. Network

```bash
# ✅ Trong containers - dùng service names
MONGODB_URI=mongodb://admin:admin123@mongodb:27017

# ✅ Từ host machine - dùng localhost
http://localhost:3000

# ❌ Tránh - dùng IP addresses
MONGODB_URI=mongodb://admin:admin123@172.18.0.2:27017
```

### 4. Timezone

```bash
# ✅ Luôn dùng UTC trong containers
TZ=UTC

# ✅ Seed data tự động convert từ Vietnam time sang UTC
```

### 5. Security

```bash
# ✅ Không commit .env file
echo ".env" >> .gitignore

# ✅ Thay đổi passwords trong production
MONGO_ROOT_PASSWORD=strong-password-here

# ✅ Sử dụng secrets cho production
docker secret create mongo_password ./mongo_password.txt
```

### 6. Resource Management

```yaml
# docker-compose.prod.yml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
```

### 7. Logging

```bash
# Xem logs với timestamps
docker-compose logs -f -t

# Limit log lines
docker-compose logs --tail=100

# Specific service
docker-compose logs -f app
```

## 🔐 Security Checklist

- [ ] File `.env` không được commit vào Git
- [ ] Thay đổi tất cả passwords mặc định trong production
- [ ] Sử dụng secrets management (Docker Secrets, Vault)
- [ ] Giới hạn network exposure - chỉ expose ports cần thiết
- [ ] Regular updates - cập nhật base images thường xuyên
- [ ] Scan images - `docker scan <image>` để tìm vulnerabilities
- [ ] Non-root user trong containers
- [ ] Read-only filesystem khi có thể

## 📚 Truy cập Services

### Development Environment

| Service | URL | Credentials |
|---------|-----|-------------|
| App | http://localhost:3000 | - |
| Mongo Express | http://localhost:8081 | admin / admin123 |
| MongoDB | localhost:27017 | admin / admin123 |
| Health Check | http://localhost:3000/api/health | - |

### Production Environment

| Service | URL | Credentials |
|---------|-----|-------------|
| App | http://localhost:3000 | - |
| MongoDB | localhost:27017 | From `.env` |
| Health Check | http://localhost:3000/api/health | - |

## 🎯 Quick Commands Reference

```bash
# === Khởi động nhanh ===
./docker.sh dev              # Start dev
make dev                     # Start dev (Makefile)

# === Kiểm tra status ===
docker-compose ps            # List containers
./docker.sh health           # Health check
./docker.sh stats            # Resource usage

# === Xem logs ===
./docker.sh dev-logs         # All logs
docker-compose logs -f app   # App logs only
docker-compose logs -f mongodb  # MongoDB logs only

# === Truy cập containers ===
./docker.sh shell            # App shell
./docker.sh db-shell         # MongoDB shell
docker-compose exec app sh   # App shell (direct)

# === Database ===
./docker.sh seed             # Seed database
make seed                    # Seed (Makefile)

# === Dừng & Dọn dẹp ===
./docker.sh dev-down         # Stop containers
./docker.sh clean            # Clean all (remove volumes)
docker-compose down -v       # Stop and remove volumes

# === Rebuild ===
./docker.sh dev-build        # Rebuild dev
docker-compose build --no-cache  # Rebuild without cache
```

## 📖 Tài liệu liên quan

- **[README.md](../README.md)** - Tổng quan dự án
- **[QUICKSTART.md](./QUICKSTART.md)** - Hướng dẫn khởi động nhanh
- **[DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)** - Development practices
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment
- **[DATETIME_GUIDE.md](./DATETIME_GUIDE.md)** - Datetime & timezone handling
- **[DATABASE_COMMANDS_GUIDE.md](./DATABASE_COMMANDS_GUIDE.md)** - MongoDB commands

## 🆘 Cần thêm trợ giúp?

1. **Kiểm tra logs:**
   ```bash
   ./docker.sh dev-logs
   ```

2. **Health check:**
   ```bash
   ./docker.sh health
   ```

3. **Rebuild từ đầu:**
   ```bash
   docker-compose down -v
   docker-compose up --build
   ```

4. **Tham khảo documentation:**
   - [Docker Documentation](https://docs.docker.com/)
   - [Docker Compose Documentation](https://docs.docker.com/compose/)
   - [Node.js Docker Best Practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)
   - [MongoDB Docker Documentation](https://hub.docker.com/_/mongo)

---

**Happy Dockering!** 🐳✈️

