# Hướng dẫn Setup Database và Migration từ Mock Data sang MongoDB

## Tổng quan

Dự án đã được cập nhật để sử dụng MongoDB thay vì mock data. Tất cả các API endpoints hiện nay đều kết nối với MongoDB để lưu trữ và truy xuất dữ liệu.

## Các thay đổi đã thực hiện

### 1. **Models mới**
- `models/Airport.js` - Quản lý thông tin sân bay
- `models/Airline.js` - Quản lý thông tin hãng bay

### 2. **Routes đã cập nhật**
- `routes/flights.js` - Sử dụng MongoDB thay vì mock data
  - GET `/api/flights/search` - Tìm kiếm chuyến bay
  - GET `/api/flights/:id` - Chi tiết chuyến bay
  - GET `/api/flights/airports/list` - Danh sách sân bay
  - GET `/api/flights/airlines/list` - Danh sách hãng bay
  
- `routes/bookings.js` - Sử dụng MongoDB với các tính năng mới
  - POST `/api/bookings` - Tạo booking mới
  - POST `/api/bookings/:id/confirm` - Xác nhận booking
  - GET `/api/bookings/user` - Lấy bookings của user
  - GET `/api/bookings/:id` - Chi tiết booking
  - POST `/api/bookings/:id/cancel` - Hủy booking
  - Tự động cập nhật số ghế trống khi booking/hủy

### 3. **UI đã cập nhật**
- `ui/js/api.js` - Đổi baseURL từ `https://api.keypicksvivu.com` thành `/api` (local server)
- `ui/js/search.js` - Xóa `mockApiCall`, sử dụng `window.apiManager` để gọi API thật
- `ui/js/booking.js` - Xóa `mockApiCall`, thêm các method mới để tương tác với API

### 4. **Seed Script**
- `scripts/seed.js` - Script để import dữ liệu từ JSON files vào MongoDB
  - Import airports từ `scripts/data/airports.json`
  - Import airlines từ `scripts/data/airlines.json`
  - Tạo dữ liệu mẫu cho flights

## Hướng dẫn Setup

### Bước 1: Khởi động Docker Environment

**Tất cả services chạy trong Docker - không cần cài đặt MongoDB local**

```bash
# Khởi động môi trường development
docker-compose up -d

# Hoặc sử dụng Makefile
make dev
```

Docker sẽ tự động:
- ✅ Khởi động MongoDB container (timezone UTC)
- ✅ Khởi động Express app container (timezone UTC)  
- ✅ Khởi động Mongo Express (Database UI)
- ✅ Cấu hình network giữa các containers

### Bước 2: Seed Database

Chạy seed script **bên trong Docker container**:

```bash
# Sử dụng Makefile (khuyến nghị)
make seed

# Hoặc Docker Compose trực tiếp
docker-compose exec app npm run seed
```

Kết quả mong đợi:
```
🌱 Đang seed database...
MongoDB connected successfully
Server timezone: UTC
Current UTC time: 2025-10-25T10:00:00.000Z

📅 Creating flight data with Vietnam timezone (Asia/Ho_Chi_Minh)...
   All times shown are Vietnam local time (UTC+7)
   Database will store in UTC

✓ Airports seeded successfully
✓ Airlines seeded successfully
✓ Flights seeded successfully
   Created 7 flights
   Example: VN210 departs at 06:00 Vietnam time (stored as 23:00 UTC previous day)

✓ Database seeding completed!
✅ Seed hoàn tất!
```

### Bước 3: Kiểm tra Services

**Từ host machine (browser):**
- Frontend: `http://localhost:3000`
- Health check: `http://localhost:3000/api/health`
- Mongo Express (DB UI): `http://localhost:8081`
  - Username: `admin`
  - Password: `admin123`

**Từ bên trong Docker containers:**
```bash
# Truy cập app container
docker-compose exec app sh

# Kiểm tra từ bên trong container
curl http://app:3000/api/health
curl http://app:3000/api/flights/airports/list

# Kết nối MongoDB (sử dụng service name)
mongosh mongodb://admin:admin123@mongodb:27017/keypicksvivu?authSource=admin
```

### Bước 4: Xem Logs

```bash
# Xem tất cả logs
make dev-logs

# Chỉ xem app logs
make logs-app

# Chỉ xem MongoDB logs
make logs-db
```

## Cấu trúc Database

### Collections

1. **airports** - Thông tin sân bay
   ```javascript
   {
     code: "SGN",
     name: "TP. Hồ Chí Minh (SGN)",
     city: "TP. Hồ Chí Minh",
     country: "Vietnam",
     timezone: "Asia/Ho_Chi_Minh"
   }
   ```

2. **airlines** - Thông tin hãng bay
   ```javascript
   {
     code: "VN",
     name: "Vietnam Airlines",
     logo: "/images/airlines/vn.png",
     country: "Vietnam",
     website: "https://www.vietnamairlines.com"
   }
   ```

3. **flights** - Thông tin chuyến bay
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

4. **bookings** - Đơn đặt vé
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
     paymentStatus: "paid"
   }
   ```

5. **users** - Thông tin người dùng
   - Xem `models/User.js` để biết chi tiết

## Testing API

### Từ Host Machine (truy cập qua localhost)

```bash
# Health check
curl http://localhost:3000/api/health

# Lấy danh sách airports
curl http://localhost:3000/api/flights/airports/list

# Lấy danh sách airlines
curl http://localhost:3000/api/flights/airlines/list

# Tìm kiếm chuyến bay
curl "http://localhost:3000/api/flights/search?departure=SGN&arrival=HAN&date=2025-01-15"
```

### Từ Bên Trong Docker Container

```bash
# Truy cập app container
docker-compose exec app sh

# Test API từ container (sử dụng service name hoặc localhost)
curl http://localhost:3000/api/health
curl http://app:3000/api/health

# Test kết nối MongoDB
mongosh mongodb://admin:admin123@mongodb:27017/keypicksvivu?authSource=admin
```

### Tạo booking (cần authentication token)
```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "flightId": "FLIGHT_ID_HERE",
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

## Troubleshooting

### Container không khởi động
```bash
# Kiểm tra logs
docker-compose logs

# Rebuild containers
docker-compose down
docker-compose up --build
```

### Lỗi kết nối MongoDB trong container
```bash
# Kiểm tra MongoDB container đang chạy
docker-compose ps

# Kiểm tra logs MongoDB
make logs-db

# Restart MongoDB
docker-compose restart mongodb

# Đợi 5 giây rồi thử lại
sleep 5
docker-compose exec app npm run seed
```

### Seed script fails
**Giải pháp:**
```bash
# Đảm bảo MongoDB đã sẵn sàng
docker-compose logs mongodb | grep "Waiting for connections"

# Chạy lại seed
make seed

# Hoặc reset toàn bộ
make db-reset
```

### UI không load được data
**Giải pháp:**
1. Kiểm tra app container đang chạy: `docker-compose ps`
2. Xem app logs: `make logs-app`
3. Kiểm tra trong browser Developer Console (F12) Network tab
4. Đảm bảo đã seed data: `make seed`

### Timezone issues
**Kiểm tra timezone:**
```bash
# Trong app container
docker-compose exec app sh
date
echo $TZ  # Phải là "UTC"

# Trong MongoDB container  
docker-compose exec mongodb sh
date
echo $TZ  # Phải là "UTC"
```

Tất cả thời gian được lưu trong database ở UTC, nhưng seed script tự động convert từ Asia/Ho_Chi_Minh.

## Docker Environment

**Tất cả development chạy trong Docker:**

```bash
# Khởi động
make dev

# Seed database
make seed

# Reset database
make db-reset

# Access containers
make shell      # App container
make db-shell   # MongoDB shell

# Xem logs
make logs-app
make logs-db
```

## Next Steps

1. **Implement Authentication** - Các endpoints booking cần authentication
2. **Add Validation** - Thêm validation cho input data
3. **Add Pagination** - Phân trang cho danh sách flights và bookings
4. **Add Search Filters** - Thêm bộ lọc nâng cao (giá, thời gian, hãng bay)
5. **Add Real-time Updates** - Sử dụng WebSocket để cập nhật ghế trống real-time
6. **Add Payment Integration** - Tích hợp cổng thanh toán thật

## Liên hệ

Nếu có vấn đề hoặc câu hỏi, vui lòng tạo issue trên GitHub hoặc liên hệ team.

