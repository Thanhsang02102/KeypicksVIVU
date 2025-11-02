# 📁 Data Files

Thư mục này chứa các file JSON dữ liệu mẫu để seed vào MongoDB database.

## 📂 Files

### `airports.json`
Danh sách 10 sân bay Việt Nam:
- SGN - TP. Hồ Chí Minh
- HAN - Hà Nội  
- DAD - Đà Nẵng
- CXR - Nha Trang
- PQC - Phú Quốc
- HUI - Huế
- VCA - Cần Thơ
- DLI - Đà Lạt
- VDO - Vân Đồn
- HPH - Hải Phòng

**Format**:
```json
{
  "code": "SGN",
  "name": "TP. Hồ Chí Minh (SGN)",
  "city": "TP. Hồ Chí Minh",
  "country": "Vietnam",
  "timezone": "Asia/Ho_Chi_Minh"
}
```

### `flights.json`
Danh sách các chuyến bay mẫu với thời gian khởi hành và đến sử dụng **ISO 8601 timestamp** để hỗ trợ quốc tế.

**Lưu ý**: Giá vé KHÔNG nằm trong model chuyến bay vì giá phụ thuộc vào nhiều yếu tố như loại ghế, ưu đãi, thời điểm đặt, v.v. Giá vé sẽ được xử lý bởi module pricing riêng biệt (sẽ triển khai sau).

**Format**:
```json
{
  "airline": "VN",
  "flightNumber": "VN210",
  "departure": {
    "airport": "SGN",
    "city": "TP. Hồ Chí Minh",
    "timestamp": "2025-10-27T06:00:00+07:00"
  },
  "arrival": {
    "airport": "HAN",
    "city": "Hà Nội",
    "timestamp": "2025-10-27T08:00:00+07:00"
  },
  "duration": "2h 00m",
  "type": "direct",
  "availableSeats": 120,
  "totalSeats": 180
}
```

**Timestamp Format**:
- ✅ Sử dụng ISO 8601 với timezone offset: `YYYY-MM-DDTHH:mm:ss±HH:mm`
- ✅ Ví dụ: `"2025-10-27T06:00:00+07:00"` (6:00 AM giờ Việt Nam GMT+7)
- ✅ Ví dụ: `"2025-10-27T14:00:00+09:00"` (2:00 PM giờ Nhật Bản GMT+9)
- ✅ Ví dụ: `"2025-10-27T08:00:00Z"` (8:00 AM giờ UTC)
- ⚡ JavaScript tự động convert sang UTC khi lưu vào MongoDB
- 🌍 Hỗ trợ đầy đủ các múi giờ quốc tế

### `airlines.json`
Danh sách 4 hãng bay Việt Nam:
- VN - Vietnam Airlines
- VJ - VietJet Air
- QH - Bamboo Airways
- BL - Pacific Airlines

**Format**:
```json
{
  "code": "VN",
  "name": "Vietnam Airlines",
  "logo": "/images/airlines/vn.png",
  "country": "Vietnam",
  "website": "https://www.vietnamairlines.com"
}
```

### `routes.json`
Danh sách các tuyến bay phổ biến với thông tin:
- Khoảng cách (km)
- Thời gian bay
- Độ phổ biến

**Format**:
```json
{
  "id": "SGN-HAN",
  "from": "SGN",
  "to": "HAN",
  "distance": 1130,
  "duration": "2h 00m",
  "popular": true
}
```

### `promotions.json`
Danh sách các chương trình khuyến mãi:
- Giảm giá phần trăm
- Combo du lịch
- Vé tháng

**Format**:
```json
{
  "id": "PROMO001",
  "title": "Giảm 50% vé máy bay",
  "description": "Áp dụng cho tất cả tuyến bay nội địa",
  "discount": 50,
  "type": "percentage",
  "startDate": "2024-12-15",
  "endDate": "2024-12-31",
  "active": true
}
```

## 🚀 Usage

### Seed dữ liệu vào MongoDB

```bash
# Option 1: npm script
npm run seed

# Option 2: Makefile
make seed

# Option 3: Direct
node scripts/seed.js
```

### Thêm dữ liệu mới

1. **Thêm airport**:
   ```bash
   # Edit airports.json
   vim scripts/data/airports.json
   
   # Add new airport
   {
     "code": "BMV",
     "name": "Buôn Ma Thuột (BMV)",
     "city": "Buôn Ma Thuột",
     "country": "Vietnam",
     "timezone": "Asia/Ho_Chi_Minh"
   }
   
   # Re-seed
   make db-reset
   ```

2. **Thêm airline**:
   ```bash
   # Edit airlines.json
   vim scripts/data/airlines.json
   
   # Add new airline
   {
     "code": "XX",
     "name": "New Airline",
     "logo": "/images/airlines/xx.png",
     "country": "Vietnam",
     "website": "https://example.com"
   }
   
   # Re-seed
   make db-reset
   ```

3. **Thêm flight**:
   ```bash
   # Edit flights.json
   vim scripts/data/flights.json
   
   # Add new flight (NOTE: No price field - pricing handled by separate module)
   {
     "airline": "VN",
     "flightNumber": "VN999",
     "departure": {
       "airport": "SGN",
       "city": "TP. Hồ Chí Minh",
       "timestamp": "2025-10-27T06:00:00+07:00"
     },
     "arrival": {
       "airport": "HAN",
       "city": "Hà Nội",
       "timestamp": "2025-10-27T08:00:00+07:00"
     },
     "duration": "2h 00m",
     "type": "direct",
     "availableSeats": 120,
     "totalSeats": 180
   }
   
   # Re-seed
   make db-reset
   ```

4. **Thêm route**:
   ```bash
   # Edit routes.json
   vim scripts/data/routes.json
   
   # Add new route
   {
     "id": "SGN-BMV",
     "from": "SGN",
     "to": "BMV",
     "distance": 350,
     "duration": "1h 10m",
     "popular": false
   }
   ```

## 📝 Data Validation

Khi thêm dữ liệu mới, đảm bảo:

### Airports
- ✅ `code` phải unique (3 ký tự uppercase)
- ✅ `name` rõ ràng
- ✅ `city` và `country` chính xác
- ✅ `timezone` hợp lệ

### Airlines
- ✅ `code` phải unique (2 ký tự uppercase)
- ✅ `name` là tên chính thức
- ✅ `logo` path tồn tại hoặc placeholder
- ✅ `website` URL hợp lệ

### Routes
- ✅ `id` format: "FROM-TO"
- ✅ `from` và `to` tồn tại trong airports
- ✅ `distance` tính bằng km
- ✅ `duration` format: "Xh Ym"

### Promotions
- ✅ `id` phải unique
- ✅ `type` là "percentage" hoặc "fixed"
- ✅ `startDate` < `endDate`
- ✅ Dates format: "YYYY-MM-DD"

### Flights
- ✅ `flightNumber` phải unique
- ✅ `airline` code tồn tại trong airlines
- ✅ `departure.airport` và `arrival.airport` tồn tại trong airports
- ✅ `departure.timestamp` và `arrival.timestamp` format: ISO 8601 với timezone (e.g., "2025-10-27T06:00:00+07:00")
- ✅ `departure.timestamp` < `arrival.timestamp`
- ✅ `duration` format: "Xh Ym"
- ✅ `type` là "direct" hoặc "connecting"
- ✅ `availableSeats` <= `totalSeats`
- ⚠️ **KHÔNG có trường `price`** - giá vé được xử lý bởi module pricing riêng (phụ thuộc loại ghế, ưu đãi, thời điểm đặt)

## 🔄 Update Strategy

### Development
```bash
# 1. Update JSON files
vim scripts/data/*.json

# 2. Reset database
make db-reset

# 3. Verify
curl http://localhost:3000/api/flights/airports/list
```

### Production
```bash
# 1. Backup first
make db-backup

# 2. Update JSON files
vim scripts/data/*.json

# 3. Re-seed
npm run seed

# 4. Verify data
make db-shell
db.airports.countDocuments()

# 5. If issues, restore
make db-restore FILE=backups/latest.dump
```

## 📊 Data Statistics

Current data:
- **10** airports
- **4** airlines  
- **6** routes
- **3** promotions
- **30** sample flights

Total records after seed: **53 records**

## 🌍 International Support

### Timezone Handling
Model hiện tại sử dụng **single timestamp field** cho departure và arrival:

**Ưu điểm**:
- ✅ **International**: Hỗ trợ tất cả múi giờ trên thế giới
- ✅ **Simple**: Chỉ 1 field timestamp thay vì tách time + date
- ✅ **Standard**: Sử dụng ISO 8601 format được công nhận quốc tế
- ✅ **Automatic**: JavaScript/MongoDB tự động handle timezone conversion
- ✅ **Flexible**: Dễ dàng display theo múi giờ của user

**Best Practices**:
```json
// ✅ GOOD: ISO 8601 with timezone offset
"timestamp": "2025-10-27T06:00:00+07:00"

// ✅ GOOD: UTC timestamp
"timestamp": "2025-10-26T23:00:00Z"

// ❌ BAD: No timezone info
"timestamp": "2025-10-27T06:00:00"

// ❌ BAD: Separate date and time fields
"date": "2025-10-27",
"time": "06:00"
```

### Display trong Frontend
```javascript
// Get flight timestamp from API
const departureTimestamp = flight.departure.timestamp; // "2025-10-27T06:00:00+07:00"

// Display in user's local timezone
const userTime = new Date(departureTimestamp).toLocaleString('vi-VN', {
  timeZone: 'Asia/Ho_Chi_Minh',
  dateStyle: 'medium',
  timeStyle: 'short'
});

// Or display in airport's timezone
const airportTime = new Date(departureTimestamp).toLocaleString('en-US', {
  timeZone: flight.departure.timezone, // From airports.json
  dateStyle: 'medium',
  timeStyle: 'short'
});
```

## 🔗 Related

- **Seed Script**: [scripts/seed.js](../seed.js)
- **Database Guide**: [DATABASE_COMMANDS_GUIDE.md](../DATABASE_COMMANDS_GUIDE.md)
- **Setup Guide**: [SETUP_DATABASE.md](../SETUP_DATABASE.md)

---

**Tip**: Luôn test với `make db-reset` sau khi update data files!

