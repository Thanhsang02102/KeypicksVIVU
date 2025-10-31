# 🚀 Quick Start Guide - KeypicksVIVU

> **Lưu ý quan trọng:** MongoDB và Mongo Express chạy trong Docker. App chạy locally trên máy của bạn.

## ✨ What's New

**Scripts thông minh hơn!** Giờ đây các quickstart scripts sẽ tự động:
- 🔍 **Kiểm tra môi trường** (Node 24+, npm 10+, Docker)
- 📦 **Cài đặt dependencies** nếu chưa có
- 🚀 **Khởi động services** và đợi sẵn sàng
- 🌱 **Seed database** (hỏi trước khi thực hiện)
- ⚠️ **Báo lỗi rõ ràng** với hướng dẫn khắc phục

➡️ **Bạn chỉ cần chạy `./quick-start.sh` và để script lo phần còn lại!**

## 📋 Yêu cầu hệ thống

- **Node.js** 24.0.0+ ([Download](https://nodejs.org/))
- **npm** 10.0.0+ (đi kèm với Node.js)
- **Docker Engine** 20.10+ ([Cài đặt Docker](https://docs.docker.com/get-docker/))
- **Docker Compose** 2.0+ (thường đi kèm với Docker Desktop)

> **⚠️ Lưu ý:** Scripts sẽ tự động kiểm tra version và báo lỗi nếu không đúng yêu cầu.

## ⚡ Cách nhanh nhất để bắt đầu

### 1️⃣ Clone Repository

```bash
git clone <repository-url>
cd KeypicksVIVU
```

### 2️⃣ Chạy Quick Start Script

**Linux/Mac:**
```bash
chmod +x quick-start.sh
./quick-start.sh
```

**Windows PowerShell:**
```powershell
.\quick-start.ps1
```

**Script này sẽ tự động:**
- ✅ Kiểm tra **Node.js >= 24.0.0**
- ✅ Kiểm tra **npm >= 10.0.0**
- ✅ Kiểm tra **Docker & Docker Compose**
- ✅ Tạo file `.env` từ `env.example` (nếu chưa có)
- ✅ **Cài đặt dependencies** (`npm install` nếu chưa có)
- ✅ Khởi động MongoDB và Mongo Express containers
- ✅ Đợi MongoDB sẵn sàng (auto health check)
- ✅ **Hỏi có muốn seed database không**

> **💡 Tip:** Script thông minh! Nó sẽ tự động kiểm tra và cài đặt mọi thứ bạn cần.

```bash
# Chạy app locally
npm run dev
```

> **🔁 Mỗi lần làm việc**: Chỉ cần chạy `./quick-start.sh` để khởi động lại MongoDB, script sẽ tự động kiểm tra và cài dependencies nếu có thay đổi!

### 4️⃣ Truy cập ứng dụng

- **Ứng dụng chính**: http://localhost:3000
- **Mongo Express** (Database UI): http://localhost:8081
  - Username: `admin`
  - Password: `admin123`

**Xong!** Bạn đã sẵn sàng để phát triển! ✈️

---

## 🔄 Workflow hàng ngày

**Cách đơn giản nhất:**

```bash
# 1. Khởi động tất cả (tự động kiểm tra dependencies)
./quick-start.sh              # Linux/Mac
.\quick-start.ps1             # Windows PowerShell

# Script sẽ tự động:
# - Kiểm tra Node 24, npm 10, Docker
# - Cài đặt dependencies nếu chưa có
# - Khởi động MongoDB & Mongo Express
# - Hỏi có muốn seed database không

# 2. Chạy app
npm run dev

# 3. Làm việc với code...

# 4. Dừng MongoDB khi xong (optional)
docker-compose down
```

**Hoặc dùng Makefile:**

```bash
make dev                      # Khởi động MongoDB & Mongo Express
npm run dev                   # Chạy app
```

---

## 💡 Về Quick Start Script

Script `quick-start.sh` / `quick-start.ps1` được thiết kế để **tự động hóa mọi thứ**:

### Lần đầu tiên (First run):
- ✅ Kiểm tra Node 24+, npm 10+, Docker
- ✅ Tạo `.env` từ `env.example`
- ✅ Cài đặt dependencies (`npm install`)
- ✅ Khởi động MongoDB & Mongo Express
- ✅ Hỏi có muốn seed database không

### Các lần sau (Daily use):
- ✅ Kiểm tra requirements vẫn OK
- ✅ Cài đặt dependencies mới nếu có (auto-detect)
- ✅ Khởi động MongoDB & Mongo Express
- ✅ Hỏi có muốn seed lại không

> **🎯 One script to rule them all!** Không cần phân biệt setup hay daily workflow - `quick-start.sh` lo hết!

---

## 📋 Các lệnh thường dùng

### Quản lý MongoDB

```bash
# Khởi động MongoDB và Mongo Express (Smart - tự động kiểm tra & cài đặt)
./quick-start.sh                                      # Linux/Mac
.\quick-start.ps1                                     # Windows PowerShell
make dev                                              # Hoặc dùng Makefile

# Dừng MongoDB (giữ data)
docker-compose stop

# Tắt MongoDB (xóa containers nhưng giữ data)
docker-compose down

# Xóa hoàn toàn (bao gồm volumes/data)
docker-compose down -v

# Xem logs MongoDB
docker-compose logs -f mongodb

# Xem logs Mongo Express
docker-compose logs -f mongo-express

# Truy cập MongoDB shell
make db-shell
# hoặc
docker-compose exec mongodb mongosh -u admin -p admin123 --authenticationDatabase admin
```

### Quản lý App

```bash
# Chạy app (development mode với hot reload)
npm run dev

# Chạy app (production mode)
npm start

# Build CSS
npm run build:css

# Watch CSS (auto-rebuild khi có thay đổi)
npm run watch:css
```

### Database

```bash
# Seed dữ liệu mẫu
npm run seed

# Xóa tất cả dữ liệu
npm run seed:clear

# Backup database
make db-backup

# Restore database
make db-restore FILE=backups/keypicksvivu_20251025_143022.dump
```

---

## 🔧 Troubleshooting

### Node.js hoặc npm version không đúng

```bash
# Kiểm tra version hiện tại
node -v                       # Phải >= 24.0.0
npm -v                        # Phải >= 10.0.0

# Cài đặt Node.js 24
# Download từ: https://nodejs.org/

# Hoặc dùng nvm (Node Version Manager)
nvm install 24
nvm use 24

# Update npm
npm install -g npm@latest
```

### Dependencies không cài đặt được

```bash
# Xóa node_modules và package-lock.json
rm -rf node_modules package-lock.json    # Linux/Mac
rmdir /s node_modules                    # Windows
del package-lock.json                    # Windows

# Cài đặt lại
npm install

# Hoặc dùng quick-start script (sẽ tự động cài đặt)
./quick-start.sh                         # Linux/Mac
.\quick-start.ps1                        # Windows
```

### MongoDB không kết nối được

```bash
# Kiểm tra MongoDB đang chạy
docker ps

# Xem logs MongoDB
docker-compose logs mongodb

# Restart MongoDB
docker-compose restart mongodb

# Kiểm tra connection string trong .env
# Phải là: mongodb://admin:admin123@localhost:27017/keypicksvivu?authSource=admin
```

### App không khởi động

```bash
# Kiểm tra file .env tồn tại
cat .env

# Nếu chưa có, tạo từ template
cp env.example .env

# Kiểm tra dependencies
npm install

# Xem lỗi chi tiết
npm run dev
```

### Port 3000 đã được sử dụng

```bash
# Kiểm tra process đang dùng port
# Windows
netstat -ano | findstr :3000
# Linux/Mac
lsof -i :3000

# Kill process hoặc đổi port trong .env
PORT=3001
```

### Docker không chạy

```bash
# Kiểm tra Docker Desktop đang chạy
docker --version

# Khởi động Docker Desktop nếu chưa chạy
```

### "make: command not found"

Nếu không có `make`, dùng commands trực tiếp:

```bash
# Thay vì: make dev
docker-compose up -d mongodb mongo-express

# Thay vì: make db-shell
docker-compose exec mongodb mongosh -u admin -p admin123 --authenticationDatabase admin
```

---

## 📝 Common Scenarios

### Scenario 1: Mới clone project lần đầu
```bash
# 1. Clone và vào thư mục
git clone <repository-url>
cd KeypicksVIVU

# 2. Chạy quick-start script
chmod +x quick-start.sh
./quick-start.sh       # Linux/Mac
.\quick-start.ps1      # Windows

# Script sẽ làm mọi thứ: check, install, start, seed

# 3. Chạy app
npm run dev

# Done! 🎉
```

### Scenario 2: Làm việc hàng ngày
```bash
# 1. Mở terminal và vào project
cd KeypicksVIVU

# 2. Chạy quick-start (tự động check & start)
./quick-start.sh       # Linux/Mac
.\quick-start.ps1      # Windows

# Script sẽ kiểm tra mọi thứ và khởi động

# 3. Chạy app
npm run dev

# 4. Code away! 💻
```

### Scenario 3: Sau khi pull code mới
```bash
# 1. Pull code
git pull

# 2. Chạy quick-start (sẽ tự động cài dependencies mới nếu có)
./quick-start.sh       # Linux/Mac

# 3. Rebuild CSS nếu có thay đổi
npm run build:css

# 4. Chạy app
npm run dev
```

### Scenario 4: Reset database
```bash
# 1. Dừng và xóa containers + data
docker-compose down -v

# 2. Chạy lại quick-start
./quick-start.sh

# 3. Seed database
npm run seed

# Database mới tinh! 🌱
```

### Scenario 5: Chuyển máy/Setup môi trường mới
```bash
# 1. Cài đặt requirements
# - Node.js 24+ (https://nodejs.org/)
# - Docker Desktop (https://docker.com/)

# 2. Clone project
git clone <repository-url>
cd KeypicksVIVU

# 3. Chạy quick-start script
./quick-start.sh       # Linux/Mac
.\quick-start.ps1      # Windows

# Done! Script sẽ lo hết!
```

---

## 🎯 Next Steps

Sau khi khởi động thành công, bạn có thể:

1. ✅ **Kiểm tra ứng dụng:** http://localhost:3000
2. 📖 **Test API health endpoint:**
   ```bash
   curl http://localhost:3000/api/health
   ```
3. 📊 **Xem database qua Mongo Express:** http://localhost:8081
   - Username: `admin` / Password: `admin123`
4. 🌱 **Seed dữ liệu mẫu** (nếu chưa seed):
   ```bash
   npm run seed
   ```
   > **💡 Tip:** Quick-start script đã hỏi bạn về việc seed. Nếu bạn chọn "No", chạy lệnh trên để seed lại.
5. 🔐 **Test authentication endpoints** (xem `routes/auth.js`)
6. 🎨 **Customize UI** trong folder `ui/`
7. 📚 **Đọc thêm documentation:**
   - [README.md](../README.md) - Tổng quan dự án
   - [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) - Development guide
   - [DATETIME_GUIDE.md](./DATETIME_GUIDE.md) - Datetime & timezone handling
   - [DATABASE_COMMANDS_GUIDE.md](./DATABASE_COMMANDS_GUIDE.md) - MongoDB commands
8. 🚀 **Deploy to production** (xem [DEPLOYMENT.md](./DEPLOYMENT.md))

---

## 📚 Tài liệu liên quan

- **[README.md](../README.md)** - Tổng quan dự án và kiến trúc
- **[DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)** - Best practices cho development
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Hướng dẫn deploy production
- **[DATETIME_GUIDE.md](./DATETIME_GUIDE.md)** - Xử lý datetime và timezone
- **[DATABASE_COMMANDS_GUIDE.md](./DATABASE_COMMANDS_GUIDE.md)** - MongoDB commands
- **[SETUP_DATABASE.md](./SETUP_DATABASE.md)** - Database setup chi tiết

Happy coding! ✈️
