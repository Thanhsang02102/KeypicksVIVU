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

## 🐳 DevContainer Setup (Recommended for Debugging)

### Giới thiệu

DevContainer cho phép bạn phát triển trong một container Docker được cấu hình sẵn với tất cả tools và extensions cần thiết, đặc biệt hữu ích cho debugging.

### Yêu cầu

- **Visual Studio Code**
- **Docker Desktop** đã cài đặt và đang chạy
- **Dev Containers extension** (`ms-vscode-remote.remote-containers`)

### Cài đặt Extension

1. Mở VS Code
2. Vào Extensions (Ctrl+Shift+X)
3. Tìm và cài đặt: **Dev Containers**

### Mở project trong DevContainer

**Cách 1:**

1. Mở folder project trong VS Code
2. Nhấn `F1` hoặc `Ctrl+Shift+P`
3. Chọn: **Dev Containers: Reopen in Container**
4. Đợi container build và khởi động (lần đầu mất vài phút)

**Cách 2:**

- Click vào biểu tượng xanh ở góc dưới bên trái VS Code
- Chọn **Reopen in Container**

### Tính năng

DevContainer tự động cài đặt:

- ESLint, Prettier - Code quality
- MongoDB for VS Code - Database management
- Docker extension - Container management
- Tailwind CSS IntelliSense - CSS autocomplete
- Path Intellisense - File path autocomplete

**Ports được forward:**

- `3000` - Express Server
- `27017` - MongoDB
- `8081` - Mongo Express (Admin UI)

### Debug trong DevContainer

#### Method 1: Debug với Nodemon (Recommended)

1. Mở file cần debug (vd: `server.js`, `routes/flights.js`)
2. Đặt breakpoint bằng cách click vào lề bên trái số dòng (xuất hiện chấm đỏ)
3. Nhấn `F5` hoặc vào **Run and Debug** panel
4. Chọn **Debug Express with Nodemon**
5. Server sẽ khởi động ở debug mode
6. Truy cập `http://localhost:3000` để trigger breakpoints
7. Khi sửa code, nodemon tự động restart

**Ưu điểm:**

- ✅ Hot reload tự động
- ✅ Breakpoints được giữ nguyên khi restart
- ✅ Giống môi trường development thật

#### Method 2: Debug thông thường

1. Đặt breakpoints trong code
2. Chọn **Debug Express Server** từ debug panel
3. Nhấn `F5` để start debugging

**Ưu điểm:**

- ✅ Đơn giản, nhanh
- ✅ Không cần nodemon

#### Method 3: Attach to Running Process

Nếu server đã chạy với `--inspect` flag:

1. Chọn **Attach to Process**
2. Nhấn `F5`
3. Debugger sẽ attach vào process đang chạy

#### Debug Seed Script

1. Mở file `scripts/seed.js`
2. Đặt breakpoints
3. Chọn **Debug Seed Script**
4. Nhấn `F5`

### Debug Controls

| Phím tắt        | Chức năng                          |
| --------------- | ---------------------------------- |
| `F5`            | Continue / Start debugging         |
| `F10`           | Step Over (chạy qua dòng hiện tại) |
| `F11`           | Step Into (nhảy vào function)      |
| `Shift+F11`     | Step Out (thoát khỏi function)     |
| `Ctrl+Shift+F5` | Restart debugging                  |
| `Shift+F5`      | Stop debugging                     |

### Debug Features

**Breakpoints:**

- **Standard Breakpoint** - Click vào lề bên trái
- **Conditional Breakpoint** - Right-click breakpoint > Edit Breakpoint
  - Ví dụ: `departure === 'SGN'` (chỉ dừng khi condition true)
- **Logpoint** - Right-click > Add Logpoint (log ra console mà không dừng)
  - Ví dụ: `Flight ID: {flight._id}`

**Watch Variables:**

- Thêm variables vào **Watch** panel để theo dõi giá trị
- Có thể evaluate expressions: `flight.price * 1.1`, `arr.length`

**Call Stack:**

- Xem call stack hiện tại
- Click vào frame để xem variables tại thời điểm đó

**Debug Console:**

- Evaluate expressions trong runtime
- Test functions: `calculatePrice(flight)`
- Modify variables: `flight.price = 1000`

### Working with MongoDB in DevContainer

**Sử dụng Mongo Express:**

- Truy cập: http://localhost:8081
- Username: `admin`
- Password: `admin123`

**Sử dụng MongoDB VS Code Extension:**

1. Click vào MongoDB icon trong Activity Bar
2. Add Connection:
   - Connection String: `mongodb://admin:admin123@localhost:27017/?authSource=admin`
3. Browse collections và data trực tiếp trong VS Code
4. Run queries trực tiếp từ VS Code

### VS Code Tasks

DevContainer cung cấp các tasks có sẵn (nhấn `Ctrl+Shift+P` > **Tasks: Run Task**):

- **Start Server** - Khởi động server với nodemon
- **Seed Database** - Seed database
- **Build CSS** - Build Tailwind CSS
- **Watch CSS** - Watch CSS changes
- **Docker: Up** - Start containers
- **Docker: Down** - Stop containers
- **Docker: Logs** - View app logs

### Tips & Best Practices

**Hot Reload:**

- Khi debug với nodemon, mỗi lần save file, server tự động restart
- Breakpoints được giữ nguyên
- Console sẽ clear và show lại logs

**Environment Variables:**

- Đã được cấu hình trong `.vscode/launch.json`
- Có thể customize nếu cần

**Multiple Debug Sessions:**

- Có thể debug nhiều files cùng lúc
- Mỗi debug session có call stack riêng

**Debugging Async Code:**

- Breakpoints hoạt động tốt với async/await
- Có thể step through Promises

### Troubleshooting

**Container không start:**

```bash
# Kiểm tra Docker Desktop đang chạy
# Rebuild container
Ctrl+Shift+P > Dev Containers: Rebuild Container
```

**Breakpoints không hoạt động:**

```bash
# Đảm bảo file đã được save
# Restart debugger (Ctrl+Shift+F5)
# Kiểm tra source maps
```

**Port đã được sử dụng:**

```bash
# Dừng các containers khác
docker-compose down

# Kiểm tra processes
# Windows: netstat -ano | findstr :3000
# Linux: lsof -i :3000
```

**MongoDB connection failed:**

```bash
# Đợi vài giây để MongoDB khởi động
# Check MongoDB container
docker ps

# View logs
docker logs keypicksvivu-mongodb-dev
```

### Thoát DevContainer

**Reopen Locally:**

1. Nhấn `F1`
2. Chọn **Dev Containers: Reopen Folder Locally**

Hoặc click biểu tượng xanh ở góc dưới trái và chọn **Reopen Folder Locally**.

## 📦 Database Commands (Makefile)

### Seed dữ liệu mẫu

```bash
make seed
```

Import vào database:

- 10 airports (sân bay)
- 4 airlines (hãng bay)
- 30 flights (chuyến bay)

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
│   └── data/          # JSON sample data files
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
- ✅ **Datetime: BẮT BUỘC sử dụng ISO8601 format** (xem [DATETIME_GUIDE.md](./DATETIME_GUIDE.md))

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

| Command          | Description          |
| ---------------- | -------------------- |
| `make help`      | Xem tất cả commands  |
| `make dev`       | Start development    |
| `make dev-down`  | Stop development     |
| `make seed`      | Seed database        |
| `make db-reset`  | Reset database       |
| `make db-backup` | Backup database      |
| `make shell`     | Access app shell     |
| `make db-shell`  | Access MongoDB shell |
| `make logs-app`  | View app logs        |
| `make health`    | Check API health     |
| `make clean`     | Clean everything     |

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
