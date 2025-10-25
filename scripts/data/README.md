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

3. **Thêm route**:
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

Total records after seed: **23 static records** + **7 sample flights**

## 🔗 Related

- **Seed Script**: [scripts/seed.js](../seed.js)
- **Database Guide**: [DATABASE_COMMANDS_GUIDE.md](../DATABASE_COMMANDS_GUIDE.md)
- **Setup Guide**: [SETUP_DATABASE.md](../SETUP_DATABASE.md)

---

**Tip**: Luôn test với `make db-reset` sau khi update data files!

