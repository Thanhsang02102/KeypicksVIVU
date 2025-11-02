# Hướng dẫn Setup Database - KeypicksVIVU

## Tổng quan

Dự án sử dụng MongoDB để lưu trữ dữ liệu. MongoDB chạy trong Docker container, app chạy locally và kết nối qua `localhost:27017`.

## Kiến trúc

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
│  npm run dev        │     docker-compose up
│  npm run seed       │
└─────────────────────┘
```

## Các thay đổi so với mock data

### 1. **Models**

- `models/Airport.js` - Quản lý thông tin sân bay
- `models/Airline.js` - Quản lý thông tin hãng bay
- `models/Flight.js` - Quản lý thông tin chuyến bay
- `models/Booking.js` - Quản lý đơn đặt vé
- `models/User.js` - Quản lý người dùng

### 2. **Routes**

Tất cả routes đã được cập nhật để sử dụng MongoDB:

- `routes/flights.js` - GET /api/flights/search, /api/flights/:id
- `routes/bookings.js` - POST /api/bookings, GET /api/bookings/user
- `routes/auth.js` - POST /api/auth/register, /api/auth/login
- `routes/users.js` - GET /api/users/profile

### 3. **UI**

- `ui/js/api.js` - Đổi baseURL từ CDN thành `/api`
- `ui/js/search.js` - Sử dụng `window.apiManager` thay vì mock
- `ui/js/booking.js` - Tương tác với API thật

### 4. **Seed Script**

- `scripts/seed.js` - Script để import dữ liệu vào MongoDB
- Chạy locally với `npm run seed`
- Tự động import airports, airlines, và flights

## Hướng dẫn Setup

### Bước 1: Cài đặt Dependencies

```bash
npm install
```

### Bước 2: Khởi động MongoDB

**Option 1: Quick Start Script**
```bash
./quick-start.sh
```

**Option 2: Makefile**
```bash
make dev
```

**Option 3: Docker Compose trực tiếp**
```bash
docker-compose up -d mongodb mongo-express
```

Kết quả:
- ✅ MongoDB container khởi động (port 27017)
- ✅ Mongo Express UI (port 8081)

### Bước 3: Cấu hình .env

File `.env` được tự động tạo từ `env.example`:

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

### Bước 4: Chạy App

```bash
npm run dev
```

App sẽ:
- Khởi động Express server trên port 3000
- Kết nối MongoDB qua localhost:27017
- Enable hot reload với nodemon

### Bước 5: Seed Database

```bash
npm run seed
```

Kết quả mong đợi:
```
🌱 Seeding database...
MongoDB connected successfully

✓ Airports seeded successfully (10 airports)
✓ Airlines seeded successfully (4 airlines)
✓ Flights seeded successfully (sample flights)

✓ Database seeding completed!
```

### Bước 6: Kiểm tra Services

**Từ browser:**
- Frontend: http://localhost:3000
- Mongo Express: http://localhost:8081 (admin/admin123)

**Từ terminal:**
```bash
# Health check
curl http://localhost:3000/api/health

# Get airports
curl http://localhost:3000/api/flights/airports/list

# Get airlines
curl http://localhost:3000/api/flights/airlines/list

# Search flights
curl "http://localhost:3000/api/flights/search?departure=SGN&arrival=HAN&date=2025-01-15"
```

## Cấu trúc Database

### Collections

#### 1. airports

```javascript
{
  code: "SGN",
  name: "TP. Hồ Chí Minh (SGN)",
  city: "TP. Hồ Chí Minh",
  country: "Vietnam",
  timezone: "Asia/Ho_Chi_Minh"
}
```

#### 2. airlines

```javascript
{
  code: "VN",
  name: "Vietnam Airlines",
  logo: "/images/airlines/vn.png",
  country: "Vietnam",
  website: "https://www.vietnamairlines.com"
}
```

#### 3. flights

```javascript
{
  airline: "Vietnam Airlines",
  flightNumber: "VN210",
  departure: {
    airport: "SGN",
    city: "TP. Hồ Chí Minh",
    time: "06:00",
    date: ISODate("2025-01-15T06:00:00Z")
  },
  arrival: {
    airport: "HAN",
    city: "Hà Nội",
    time: "08:15",
    date: ISODate("2025-01-15T08:15:00Z")
  },
  duration: "2h 15m",
  price: 1850000,
  type: "direct",
  availableSeats: 50,
  totalSeats: 180
}
```

#### 4. bookings

```javascript
{
  userId: ObjectId("..."),
  flightId: ObjectId("..."),
  passengers: [...],
  contactInfo: { email, phone },
  totalAmount: 2100000,
  status: "confirmed",
  bookingCode: "VNABCD12",
  paymentMethod: "credit_card",
  paymentStatus: "paid",
  createdAt: ISODate("..."),
  updatedAt: ISODate("...")
}
```

#### 5. users

```javascript
{
  email: "user@example.com",
  password: "hashed_password",
  firstName: "Nguyen",
  lastName: "Van A",
  phone: "0123456789",
  role: "user",
  createdAt: ISODate("..."),
  updatedAt: ISODate("...")
}
```

## Testing API

### Health Check

```bash
curl http://localhost:3000/api/health
```

Response:
```json
{
  "status": "OK",
  "timestamp": "2025-10-31T10:00:00.000Z"
}
```

### Get Airports

```bash
curl http://localhost:3000/api/flights/airports/list
```

### Search Flights

```bash
curl "http://localhost:3000/api/flights/search?departure=SGN&arrival=HAN&date=2025-01-15"
```

### Create Booking (cần authentication)

```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "flightId": "FLIGHT_ID",
    "passengers": [{
      "firstName": "Nguyen",
      "lastName": "Van A",
      "gender": "male",
      "dateOfBirth": "1990-01-01"
    }],
    "contactInfo": {
      "email": "test@example.com",
      "phone": "0123456789"
    }
  }'
```

## MongoDB Shell

### Truy cập Shell

```bash
make db-shell
```

Hoặc:
```bash
docker-compose exec mongodb mongosh -u admin -p admin123 --authenticationDatabase admin
```

### Queries mẫu

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

// Update flight price
db.flights.updateOne(
  { flightNumber: "VN210" },
  { $set: { price: 2000000 } }
)

// Delete a flight
db.flights.deleteOne({ flightNumber: "VN999" })
```

## Troubleshooting

### MongoDB không kết nối được

```bash
# Kiểm tra MongoDB container
docker ps | grep mongodb

# Xem logs
docker-compose logs mongodb

# Restart MongoDB
docker-compose restart mongodb

# Verify connection string
echo $MONGODB_URI
```

### Seed script fails

```bash
# Đảm bảo MongoDB đã sẵn sàng
docker-compose logs mongodb | grep "Waiting for connections"

# Chạy lại seed
npm run seed

# Hoặc clear và seed lại
npm run seed:clear
npm run seed
```

### UI không load được data

**Kiểm tra:**
1. App đang chạy: `curl http://localhost:3000/api/health`
2. MongoDB đang chạy: `docker ps`
3. Database đã được seed: `make db-shell` → `db.flights.count()`
4. Browser console (F12) để xem lỗi

### Port conflicts

```bash
# Port 3000 (app)
# Windows: netstat -ano | findstr :3000
# Linux/Mac: lsof -i :3000

# Port 27017 (MongoDB)
# Windows: netstat -ano | findstr :27017
# Linux/Mac: lsof -i :27017

# Đổi port trong .env hoặc docker-compose.yml
```

## Backup & Restore

### Backup

```bash
make db-backup
```

File được lưu tại: `backups/keypicksvivu_YYYYMMDD_HHMMSS.dump`

### Restore

```bash
make db-restore FILE=backups/keypicksvivu_20251031_100000.dump
```

## Security

### Development

- MongoDB: `admin` / `admin123`
- Mongo Express: `admin` / `admin123`

⚠️ **CHỈ dùng cho development!**

### Production

Thay đổi trong `.env`:

```env
MONGO_ROOT_USERNAME=secure_username
MONGO_ROOT_PASSWORD=very_strong_password_here
JWT_SECRET=very-strong-jwt-secret
```

## Next Steps

1. **Authentication** - Implement JWT authentication
2. **Validation** - Add input validation
3. **Pagination** - Add pagination cho danh sách
4. **Search Filters** - Thêm filters nâng cao
5. **Real-time Updates** - WebSocket cho seat availability
6. **Payment Integration** - Tích hợp cổng thanh toán

## Liên hệ

Nếu có vấn đề hoặc câu hỏi, vui lòng tạo issue trên GitHub.

---

**Last updated**: 2025-10-31
