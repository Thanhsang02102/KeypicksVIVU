# 🚀 Quick Start Guide - KeypicksVIVU

> **Lưu ý quan trọng:** Dự án này CHỈ sử dụng Docker cho development. Tất cả services (app, MongoDB, Mongo Express) đều chạy trong Docker containers.

## 📋 Yêu cầu hệ thống

- **Docker Engine** 20.10+ ([Cài đặt Docker](https://docs.docker.com/get-docker/))
- **Docker Compose** 2.0+ (thường đi kèm với Docker Desktop)
- **Make** (optional, để dùng Makefile commands)

## ⚡ Cách nhanh nhất để bắt đầu

**Khuyến nghị: Sử dụng Init Script để setup tự động hoàn toàn!**

### 1️⃣ Clone Repository

```bash
git clone <repository-url>
cd KeypicksVIVU
```

### 2️⃣ Cấp quyền thực thi cho scripts (Linux/Mac)

```bash
# Cấp quyền execute cho các scripts
chmod +x init.sh quick-start.sh docker.sh
```

> **Windows Users:** Không cần bước này. Có thể chạy trực tiếp `.ps1` files.

### 3️⃣ Khởi động với Init Script - Một lệnh duy nhất! (Khuyến nghị)

**Linux/Mac:**
```bash
./init.sh
```

**Windows PowerShell:**
```powershell
.\init.ps1
```

**Script này sẽ tự động:**
- ✅ Tạo file `.env` từ `env.example` (nếu chưa có)
- ✅ Build Docker images (nếu chưa có)
- ✅ Khởi động MongoDB container với timezone UTC
- ✅ Khởi động Mongo Express (Database Admin UI)
- ✅ Khởi động App container với timezone UTC và hot-reload
- ✅ Tự động seed dữ liệu mẫu (nếu database trống)
- ✅ Hiển thị thông tin các services

**Ví dụ output khi chạy script:**
```
🚀 Initializing KeypicksVIVU Development Environment
====================================================

✓ Creating .env file from env.example...
✓ Building Docker images...
✓ Starting MongoDB container...
✓ Starting Mongo Express...
✓ Starting App container...
✓ Seeding sample data...

✓ All services are running!

Access points:
  - App:           http://localhost:3000
  - Mongo Express: http://localhost:8081
```

### 4️⃣ Truy cập ứng dụng

- **Ứng dụng chính**: http://localhost:3000
- **Mongo Express** (Database UI): http://localhost:8081
  - Username: `admin`
  - Password: `admin123`

**Xong!** Bạn đã sẵn sàng để phát triển! ✈️

---

## 🔄 Phương pháp thay thế

Nếu bạn muốn điều khiển chi tiết hơn hoặc không dùng Init script:

### Sử dụng Docker Script (Điều khiển services riêng lẻ)

**Khởi động development:**
```bash
./docker.sh dev          # Linux/Mac
.\docker.ps1 dev         # Windows
```

**Dừng tất cả services:**
```bash
./docker.sh down         # Linux/Mac
.\docker.ps1 down        # Windows
```

**Xem logs:**
```bash
./docker.sh logs         # Linux/Mac
.\docker.ps1 logs        # Windows
```

**Rebuild containers:**
```bash
./docker.sh rebuild      # Linux/Mac
.\docker.ps1 rebuild     # Windows
```

**Lưu ý:** Docker script không tự động tạo `.env` file. Bạn cần tạo thủ công từ `env.example`.

### Sử dụng Makefile Commands

```bash
# Khởi động development environment
make dev

# Dừng tất cả containers
make down

# Xem logs
make logs

# Seed database
make seed

# Xem tất cả commands có sẵn
make help
```

### Sử dụng Docker Compose trực tiếp

```bash
# Khởi động
docker-compose up

# Khởi động ở background
docker-compose up -d

# Xem logs
docker-compose logs -f

# Dừng
docker-compose down
```

### Tìm hiểu thêm về Docker

Xem chi tiết đầy đủ về Docker setup, troubleshooting, và advanced commands tại:

📚 **[DOCKER_GUIDE.md](./DOCKER_GUIDE.md)** - Hướng dẫn Docker chi tiết

**Lưu ý:** Tất cả services chạy trong Docker với timezone UTC. Seed data tự động convert từ Asia/Ho_Chi_Minh sang UTC.

---

## 📋 Các lệnh thường dùng

### Init Scripts (Khuyến nghị cho lần đầu)

**Khởi động lần đầu:**
```bash
./init.sh                # Linux/Mac
.\init.ps1               # Windows
```

**Khởi động nhanh (sau lần đầu):**
```bash
./quick-start.sh         # Linux/Mac
.\quick-start.ps1        # Windows
```

### Docker Scripts (Điều khiển chi tiết hơn)

**Khởi động development:**
```bash
./docker.sh dev          # Linux/Mac
.\docker.ps1 dev         # Windows
```

**Dừng tất cả services:**
```bash
./docker.sh down         # Linux/Mac
.\docker.ps1 down        # Windows
```

**Xem logs:**
```bash
./docker.sh logs         # Linux/Mac
.\docker.ps1 logs        # Windows
```

**Rebuild containers:**
```bash
./docker.sh rebuild      # Linux/Mac
.\docker.ps1 rebuild     # Windows
```

### Utilities

```bash
# Truy cập shell của app (để chạy npm commands, debug, etc)
docker-compose exec app sh

# Truy cập MongoDB shell
docker-compose exec mongodb mongosh -u admin -p admin123 --authenticationDatabase admin

# Kiểm tra health endpoint
curl http://localhost:3000/api/health

# Seed database
docker-compose exec app npm run seed
# Hoặc
make seed

# Xem resource usage (CPU, Memory)
docker stats

# Xem logs real-time
docker-compose logs -f app
```

**Lưu ý:** 
- Không bao giờ sử dụng `localhost` để kết nối giữa các containers
- Sử dụng service names (`mongodb`, `app`) trong Docker network
- Tất cả containers chạy với timezone UTC

---

## 🔧 Troubleshooting

### Docker Script Issues

#### Script không có quyền thực thi (Linux/Mac)
```bash
# Cấp quyền execute cho scripts
chmod +x docker.sh init.sh quick-start.sh
./docker.sh dev
```

#### PowerShell Execution Policy Error (Windows)
```powershell
# Cho phép chạy script trong session hiện tại
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
.\docker.ps1 dev
```

### Docker Container Issues

#### Port đã được sử dụng
```bash
# Kiểm tra port 3000 hoặc 27017
netstat -ano | findstr :3000  # Windows
lsof -i :3000                  # Linux/Mac

# Dừng container đang dùng port
docker ps  # Xem containers đang chạy
docker stop <container_id>

# Hoặc sửa port trong docker-compose.yml
ports:
  - "3001:3000"  # Đổi host port thành 3001
```

#### Container không khởi động
```bash
# Xem logs để debug
docker-compose logs app
docker-compose logs mongodb

# Rebuild từ đầu
docker-compose down -v
docker-compose up --build

# Hoặc dùng script
./docker.sh rebuild  # Linux/Mac
.\docker.ps1 rebuild # Windows
```

#### MongoDB connection error
```bash
# Đảm bảo MongoDB đã khởi động hoàn toàn
docker-compose logs mongodb | grep "Waiting for connections"

# Restart MongoDB container
docker-compose restart mongodb

# Đợi vài giây rồi restart app
sleep 5
docker-compose restart app

# Test kết nối từ app container
docker-compose exec app sh -c "ping -c 2 mongodb"
```

#### Hot reload không hoạt động (code thay đổi nhưng không tự động restart)
```bash
# Trên Windows, có thể cần bật polling
# Kiểm tra file package.json có nodemonConfig với legacyWatch: true

# Hoặc restart container thủ công
docker-compose restart app
```

#### Disk space đầy hoặc Docker chạy chậm
```bash
# Dọn dẹp unused containers, images, volumes
docker system prune -a

# Xem disk usage
docker system df

# Xóa unused volumes (cẩn thận: sẽ mất data!)
docker volume prune
```

#### Timezone không đúng
```bash
# Kiểm tra timezone trong containers
docker-compose exec app date
docker-compose exec mongodb date

# Cả hai phải hiển thị UTC
# Nếu không đúng, rebuild containers
docker-compose down
docker-compose up --build
```

### Docker Installation Issues

#### Docker không được cài đặt
- **Windows/Mac:** Cài đặt [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- **Linux:** 
  ```bash
  # Ubuntu/Debian
  curl -fsSL https://get.docker.com -o get-docker.sh
  sudo sh get-docker.sh
  ```

#### Docker Compose không tìm thấy
```bash
# Kiểm tra version
docker compose version  # Docker Compose V2 (built-in)
docker-compose version  # Docker Compose V1 (standalone)

# Nếu dùng V2, thay 'docker-compose' bằng 'docker compose' (có space)
docker compose up
```

### Cần thêm trợ giúp?

Xem hướng dẫn chi tiết tại:
- 📚 **[DOCKER_GUIDE.md](./DOCKER_GUIDE.md)** - Docker troubleshooting đầy đủ
- 📚 **[DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)** - Development best practices
- 📅 **[DATETIME_GUIDE.md](./DATETIME_GUIDE.md)** - Datetime & timezone handling

---

## 🎯 Next Steps

Sau khi khởi động thành công với Docker, bạn có thể:

1. ✅ **Kiểm tra ứng dụng:** http://localhost:3000
2. 📖 **Test API health endpoint:**
   ```bash
   curl http://localhost:3000/api/health
   ```
3. 📊 **Xem database qua Mongo Express:** http://localhost:8081
   - Username: `admin` / Password: `admin123`
4. 🔐 **Test authentication endpoints** (xem `routes/auth.js`)
5. 🎨 **Customize UI** trong folder `ui/`
6. 🛠️ **Seed dữ liệu mẫu:**
   ```bash
   make seed
   # Hoặc
   docker-compose exec app npm run seed
   ```
7. 📚 **Đọc thêm documentation:**
   - [README.md](../README.md) - Tổng quan dự án
   - [DOCKER_GUIDE.md](./DOCKER_GUIDE.md) - Docker chi tiết
   - [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) - Development guide
   - [DATETIME_GUIDE.md](./DATETIME_GUIDE.md) - Datetime & timezone handling
8. 🚀 **Deploy to production** (xem [DEPLOYMENT.md](./DEPLOYMENT.md))

---

## 📚 Tài liệu liên quan

- **[README.md](../README.md)** - Tổng quan dự án và kiến trúc
- **[DOCKER_GUIDE.md](./DOCKER_GUIDE.md)** - Hướng dẫn Docker chi tiết, troubleshooting
- **[DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)** - Best practices cho development
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Hướng dẫn deploy production
- **[DATETIME_GUIDE.md](./DATETIME_GUIDE.md)** - Xử lý datetime và timezone (UTC/Asia/Ho_Chi_Minh)
- **[DATABASE_COMMANDS_GUIDE.md](./DATABASE_COMMANDS_GUIDE.md)** - MongoDB commands

Happy coding! ✈️

