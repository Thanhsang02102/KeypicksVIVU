# 🛠️ Development Guide - KeypicksVIVU

## 🚀 Quick Start

### Lần đầu tiên setup

```bash
# Linux/macOS
./init.sh

# Windows
.\init.ps1
```

Script sẽ tự động:
1. ✅ Kiểm tra Docker
2. ✅ Tạo file .env
3. ✅ Pull Docker images
4. ✅ Build ứng dụng
5. ✅ Khởi động services
6. ✅ Seed database (nếu chọn)

### Khởi động thường ngày

```bash
# Option 1: Docker Compose
docker-compose up

# Option 2: Docker script
./docker.sh dev        # Linux/macOS
.\docker.ps1 dev       # Windows

# Option 3: Makefile (khuyến nghị)
make dev
```

## 📦 Database Commands (Makefile)

### Seed dữ liệu mẫu

```bash
make seed
```

Import vào database:
- 10 airports (sân bay)
- 4 airlines (hãng bay)
- 7 sample flights (chuyến bay mẫu)

### Xóa toàn bộ dữ liệu

```bash
make seed-clear
```

⚠️ **Cảnh báo**: Lệnh này sẽ xóa toàn bộ database!

### Reset database (xóa + seed lại)

```bash
make db-reset
```

Hữu ích khi:
- Dữ liệu bị corrupt
- Muốn refresh database
- Test với dữ liệu sạch

### Backup database

```bash
make db-backup
```

Tạo backup file tại: `backups/keypicksvivu_YYYYMMDD_HHMMSS.dump`

### Restore database

```bash
make db-restore FILE=backups/keypicksvivu_20251025_100000.dump
```

## 🐚 Shell Access

### App container shell

```bash
make shell
```

Truy cập terminal của Node.js app để:
- Run npm commands
- Debug
- Inspect files

### MongoDB shell

```bash
make db-shell
```

Truy cập MongoDB shell để:
- Query data trực tiếp
- Inspect collections
- Debug database

Example queries:
```javascript
// Show databases
show dbs

// Use keypicksvivu database
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
```

## 📊 Monitoring

### View logs

```bash
# All services
make dev-logs

# App only
make logs-app

# MongoDB only
make logs-db
```

### Check health

```bash
make health
```

Output:
```json
{
  "status": "OK",
  "timestamp": "2025-10-25T10:00:00.000Z"
}
```

### View resource usage

```bash
make stats
```

### View container status

```bash
make ps
```

## 🔧 Development Workflow

### Typical workflow

```bash
# 1. Start services
make dev

# 2. Seed database (nếu chưa có data)
make seed

# 3. Code your changes...

# 4. Restart app (nếu cần)
make restart-app

# 5. View logs
make logs-app

# 6. Check health
make health

# 7. Dừng khi xong
make dev-down
```

### Reset và test lại từ đầu

```bash
# 1. Stop services
make dev-down

# 2. Clean everything
make clean

# 3. Start fresh
make dev-build

# 4. Reset database
make db-reset
```

## 🗂️ Project Structure

```
KeypicksVIVU/
├── config/              # Configuration files
├── middleware/          # Express middleware
├── models/             # MongoDB models
│   ├── Airport.js
│   ├── Airline.js
│   ├── Flight.js
│   ├── Booking.js
│   └── User.js
├── routes/             # API routes
│   ├── flights.js
│   ├── bookings.js
│   ├── auth.js
│   └── users.js
├── scripts/            # Utility scripts
│   └── seed.js        # Database seeding
│   └── data/          # JSON data files
├── ui/                 # Frontend files
│   ├── css/
│   ├── js/
│   ├── pages/
├── server.js          # Main server file
└── docker-compose.yml
```

## 🧪 Testing API

### Using curl from Host Machine

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

### Using curl from Inside Container

```bash
# Access app container
docker-compose exec app sh

# Test using service names
curl http://app:3000/api/health
curl http://mongodb:27017

# Or use localhost within container
curl http://localhost:3000/api/health
```

### Using browser (Host Machine)

- Frontend: http://localhost:3000
- Mongo Express: http://localhost:8081
  - Username: `admin`
  - Password: `admin123`

## 📝 Environment Variables

Các biến trong `.env` (hoặc docker-compose.yml):

```env
# MongoDB - Sử dụng Docker service name
MONGODB_URI=mongodb://admin:admin123@mongodb:27017/keypicksvivu?authSource=admin

# Server
NODE_ENV=development
PORT=3000
TZ=UTC  # Timezone UTC cho cả server và database

# JWT (nếu dùng authentication)
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d

# API - Sử dụng relative URL
API_BASE_URL=/api
```

**Lưu ý quan trọng:**
- ✅ Sử dụng `mongodb` (service name) thay vì `localhost`
- ✅ Timezone luôn là UTC trong containers
- ✅ API_BASE_URL sử dụng relative path `/api`
- ✅ Seed data tự động convert từ Asia/Ho_Chi_Minh sang UTC

## 🐛 Common Issues

### MongoDB không kết nối được

```bash
# Check MongoDB logs
make logs-db

# Restart MongoDB
docker-compose restart mongodb
```

### App không chạy sau khi update code

```bash
# Restart app
make restart-app

# Hoặc rebuild
make dev-build
```

### Database trống sau khi seed

```bash
# Check seed logs
docker-compose logs app | grep seed

# Seed lại
make seed
```

### Port 3000 đã được sử dụng

```bash
# Stop all containers
make dev-down

# Hoặc edit .env để đổi PORT
PORT=3001
```

## 📚 Useful Commands Cheat Sheet

| Command | Description |
|---------|-------------|
| `make help` | Xem tất cả commands |
| `make dev` | Start development |
| `make dev-down` | Stop development |
| `make seed` | Seed database |
| `make db-reset` | Reset database |
| `make db-backup` | Backup database |
| `make shell` | Access app shell |
| `make db-shell` | Access MongoDB shell |
| `make logs-app` | View app logs |
| `make health` | Check API health |
| `make clean` | Clean everything |

## 🔄 Update Dependencies

```bash
# Access app shell
make shell

# Inside container
npm install package-name
npm install --save-dev dev-package-name

# Exit shell
exit

# Rebuild (nếu cần)
make dev-build
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

## 📖 Additional Resources

- **Setup Database**: [SETUP_DATABASE.md](SETUP_DATABASE.md)
- **Migration Summary**: [MIGRATION_SUMMARY.md](MIGRATION_SUMMARY.md)
- **Quick Start**: [START_HERE.md](START_HERE.md)
- **Docker Guide**: [DOCKER_GUIDE.md](DOCKER_GUIDE.md)

---

**Happy coding! 🎉**

