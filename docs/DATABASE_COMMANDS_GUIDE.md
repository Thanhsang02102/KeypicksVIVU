# 🗄️ Database Commands Guide

## 🚀 Quick Commands

### Seed dữ liệu mẫu

```bash
npm run seed
```

**Chức năng**: Import dữ liệu mẫu vào MongoDB (chạy locally)

- 10 airports (sân bay Việt Nam)
- 4 airlines (hãng bay Việt Nam)
- Sample flights (chuyến bay mẫu)

**Khi nào dùng**:
- Lần đầu setup project
- Sau khi reset database
- Cần dữ liệu để test

### Xóa dữ liệu

```bash
npm run seed:clear
```

**Chức năng**: Xóa toàn bộ database keypicksvivu

⚠️ **Cảnh báo**: Không thể undo!

**Khi nào dùng**:
- Muốn bắt đầu lại từ đầu
- Dữ liệu test bị lộn xộn
- Trước khi chạy test suite

### Backup database

```bash
make db-backup
```

**Chức năng**: Tạo backup file tại `backups/keypicksvivu_YYYYMMDD_HHMMSS.dump`

**Khi nào dùng**:
- Trước khi deploy
- Trước khi migration
- Định kỳ (production)
- Trước khi test với data quan trọng

### Restore database

```bash
make db-restore FILE=backups/keypicksvivu_20251025_143022.dump
```

**Chức năng**: Restore database từ backup file

**Khi nào dùng**:
- Sau khi có lỗi xảy ra
- Muốn rollback changes
- Recovery sau disaster

### MongoDB shell

```bash
make db-shell
```

**Chức năng**: Truy cập MongoDB shell để query trực tiếp

**Khi nào dùng**:
- Debug database
- Inspect data
- Run custom queries
- Manual data manipulation

## 🎯 Quick Start Script

### Linux/macOS: `quick-start.sh`

```bash
chmod +x quick-start.sh
./quick-start.sh
```

### Windows: `quick-start.ps1`

```powershell
.\quick-start.ps1
```

**Script thông minh sẽ tự động:**
1. ✅ Kiểm tra Node.js 24+, npm 10+, Docker
2. ✅ Tạo `.env` từ `env.example` (nếu chưa có)
3. ✅ Cài đặt dependencies (nếu chưa có)
4. ✅ Khởi động MongoDB và Mongo Express
5. ✅ Đợi MongoDB sẵn sàng
6. ✅ **Hỏi có muốn seed database không**

## 📝 Makefile Commands - Full List

### Development

```bash
make dev         # Khởi động MongoDB và Mongo Express
make dev-down    # Dừng môi trường dev
make dev-logs    # Xem logs
```

### Database

```bash
make db-shell    # MongoDB shell
make db-backup   # Backup database
make db-restore  # Restore từ backup
```

### Utilities

```bash
make stats       # Resource usage
make logs-db     # MongoDB logs
make ps          # Container status
make clean       # Clean everything
```

### Xem tất cả commands

```bash
make help
```

## 🔄 Typical Workflows

### 1. First Time Setup

```bash
# 1. Run quick-start script
chmod +x quick-start.sh
./quick-start.sh

# Script sẽ tự động:
# - Check Node.js 24+, npm 10+, Docker
# - Create .env from env.example
# - Install dependencies
# - Start MongoDB and Mongo Express
# - Seed database (nếu chọn Yes)

# 2. Chạy app
npm run dev

# 3. Seed database
npm run seed

# 4. Verify
curl http://localhost:3000/api/health
curl http://localhost:3000/api/flights/airports/list
```

### 2. Daily Development

```bash
# 1. Start MongoDB (nếu chưa chạy)
./quick-start.sh

# 2. Start app
npm run dev

# 3. Work on code...

# 4. Stop app (Ctrl+C)

# 5. (Optional) Stop MongoDB
docker-compose down
```

### 3. Database Testing

```bash
# 1. Start với fresh data
npm run seed:clear
npm run seed

# 2. Test app...

# 3. Inspect data
make db-shell

# 4. Nếu cần restore
make db-restore FILE=backups/file.dump
```

### 4. Debug Database Issues

```bash
# Check MongoDB logs
make logs-db

# Access MongoDB shell
make db-shell

# Inside shell:
use keypicksvivu
show collections
db.flights.find().count()
db.airports.find().pretty()

# Exit shell
exit

# Nếu vẫn có vấn đề, reset
npm run seed:clear
npm run seed
```

### 5. Before Deploy

```bash
# 1. Backup database
make db-backup

# 2. Test locally

# 3. Deploy

# 4. Nếu có vấn đề, rollback
make db-restore FILE=backups/file.dump
```

## 🎓 MongoDB Shell Quick Reference

Sau khi chạy `make db-shell`:

```javascript
// Select database
use keypicksvivu

// Show collections
show collections

// Count documents
db.airports.countDocuments()
db.airlines.countDocuments()
db.flights.countDocuments()
db.bookings.countDocuments()

// Find all
db.airports.find().pretty()
db.airlines.find()

// Find with filter
db.flights.find({
  "departure.airport": "SGN",
  "arrival.airport": "HAN"
})

// Find one
db.flights.findOne({ flightNumber: "VN210" })

// Update
db.flights.updateOne(
  { flightNumber: "VN210" },
  { $set: { price: 2000000 } }
)

// Delete
db.flights.deleteOne({ flightNumber: "VN210" })

// Aggregate
db.bookings.aggregate([
  { $group: { _id: "$status", count: { $sum: 1 } } }
])

// Create index
db.flights.createIndex({ "departure.airport": 1, "arrival.airport": 1 })

// Drop collection
db.flights.drop()

// Drop database
db.dropDatabase()
```

## 🔒 Security Notes

### Development

- Username: `admin`
- Password: `admin123`
- Database: `keypicksvivu`

⚠️ **CHỈ dùng cho development!**

### Production

Phải thay đổi trong `.env`:

```env
MONGO_ROOT_USERNAME=secure_username
MONGO_ROOT_PASSWORD=very_strong_password_here
```

## 🐛 Troubleshooting

### Seed fails với "Cannot connect to MongoDB"

```bash
# Check MongoDB is running
docker ps

# Restart MongoDB
docker-compose restart mongodb

# Wait 5 seconds
sleep 5

# Try seed again
npm run seed
```

### "make: command not found"

```bash
# On Windows without make, use npm directly:
npm run seed
npm run seed:clear
```

### Backup fails

```bash
# Make sure backups directory exists
mkdir -p backups

# Try again
make db-backup
```

### Restore fails

```bash
# Check file exists
ls -la backups/

# Check file format
file backups/keypicksvivu_*.dump

# Try with correct filename
make db-restore FILE=backups/keypicksvivu_20251025_143022.dump
```

### Can't access db-shell

```bash
# Make sure MongoDB is running
docker ps

# Check MongoDB logs
make logs-db

# Try restart
docker-compose restart mongodb
sleep 5
make db-shell
```

## 📚 Related Documentation

- **Setup Guide**: [SETUP_DATABASE.md](SETUP_DATABASE.md)
- **Development Guide**: [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md)
- **Docker Guide**: [DOCKER_GUIDE.md](DOCKER_GUIDE.md)

## 🎉 Summary

Các database commands giúp bạn:

- ✅ Seed data nhanh chóng (chạy locally với `npm run seed`)
- ✅ Reset database dễ dàng
- ✅ Backup/restore an toàn
- ✅ Debug với MongoDB shell
- ✅ Quản lý database hiệu quả

**Tip**: Chạy `make help` để xem tất cả commands có sẵn!

---

**Last updated**: 2025-10-31
