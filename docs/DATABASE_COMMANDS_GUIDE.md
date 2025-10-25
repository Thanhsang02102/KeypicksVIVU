# 🗄️ Database Commands Guide

## 🚀 Quick Commands

### Seed dữ liệu mẫu
```bash
make seed
```
**Chức năng**: Import dữ liệu mẫu vào MongoDB (chạy trong Docker container)
- 10 airports (sân bay Việt Nam)
- 4 airlines (hãng bay Việt Nam)
- 7 sample flights (chuyến bay mẫu với timezone Asia/Ho_Chi_Minh tự động convert sang UTC)

**Khi nào dùng**:
- Lần đầu setup project
- Sau khi reset database
- Cần dữ liệu để test

**Lưu ý**: Tất cả thời gian trong seed data là Vietnam time (UTC+7) và được tự động convert sang UTC khi lưu vào database.

### Xóa dữ liệu
```bash
make seed-clear
```
**Chức năng**: Xóa toàn bộ database keypicksvivu

⚠️ **Cảnh báo**: Không thể undo!

**Khi nào dùng**:
- Muốn bắt đầu lại từ đầu
- Dữ liệu test bị lộn xộn
- Trước khi chạy test suite

### Reset database
```bash
make db-reset
```
**Chức năng**: Xóa database + seed lại (combo của `seed-clear` + `seed`)

**Khi nào dùng**:
- Dữ liệu bị corrupt
- Muốn fresh start
- Sau khi update seed script

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
**Chức năng**: Truy cập MongoDB shell **trong Docker container** để query trực tiếp

**Khi nào dùng**:
- Debug database
- Inspect data
- Run custom queries
- Manual data manipulation

**Lưu ý**: Shell chạy trong MongoDB container với timezone UTC. Tất cả timestamps trong database là UTC.

## 🎯 Init Scripts với Seed Option

### Linux/macOS: `init.sh`

```bash
./init.sh
```

Script sẽ:
1. Kiểm tra Docker & Docker Compose
2. Tạo `.env` từ `env.example`
3. Pull & build Docker images
4. **Hỏi có muốn khởi động không**
5. **Hỏi có muốn seed database không** ⭐ NEW!

### Windows: `init.ps1`

```powershell
.\init.ps1
```

Tương tự init.sh nhưng cho Windows PowerShell.

## 📝 Makefile Commands - Full List

### Development
```bash
make dev         # Khởi động môi trường dev
make dev-build   # Build và khởi động
make dev-down    # Dừng môi trường dev
make dev-logs    # Xem logs
```

### Database
```bash
make seed        # Seed dữ liệu mẫu
make seed-clear  # Xóa toàn bộ dữ liệu
make db-reset    # Reset database (xóa + seed)
make db-backup   # Backup database
make db-restore  # Restore từ backup
make db-shell    # MongoDB shell
```

### Utilities
```bash
make shell       # App container shell
make health      # Check API health
make stats       # Resource usage
make logs-app    # App logs
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
# Run init script
./init.sh

# Script sẽ tự động:
# - Check Docker installation
# - Create .env from env.example
# - Pull and build Docker images (with UTC timezone)
# - Start all services in containers
# - Seed database (nếu chọn Yes) với Vietnam timezone data

# Verify từ host machine
curl http://localhost:3000/api/health
curl http://localhost:3000/api/flights/airports/list

# Verify timezone trong containers
docker-compose exec app sh -c "echo TZ=\$TZ && date"
docker-compose exec mongodb sh -c "echo TZ=\$TZ && date"
```

### 2. Daily Development
```bash
# Start
make dev

# Work on code...

# Restart app sau khi thay đổi code
make restart-app

# View logs
make logs-app

# Stop
make dev-down
```

### 3. Database Testing
```bash
# Start với fresh data
make db-reset

# Add test data manually...
make db-shell
# (thêm data)

# Backup trước khi test
make db-backup

# Run tests...

# Nếu có lỗi, restore
make db-restore FILE=backups/keypicksvivu_LATEST.dump

# Hoặc reset lại
make db-reset
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
make db-reset
```

### 5. Before Deploy
```bash
# 1. Backup production database
make db-backup

# 2. Test locally với production data
make db-restore FILE=backups/prod_backup.dump

# 3. Test migrations/changes

# 4. Deploy

# 5. Nếu có vấn đề, rollback
make db-restore FILE=backups/prod_backup.dump
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
make logs-db

# Restart MongoDB
docker-compose restart mongodb

# Wait 5 seconds
sleep 5

# Try seed again
make seed
```

### "make: command not found"
```bash
# On Windows without make, use docker-compose directly:
docker-compose exec -T app npm run seed
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
docker-compose ps

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
- **Migration Summary**: [MIGRATION_SUMMARY.md](MIGRATION_SUMMARY.md)
- **Backup Guide**: [backups/README.md](backups/README.md)

## 🎉 Summary

Các database commands giúp bạn:
- ✅ Seed data nhanh chóng
- ✅ Reset database dễ dàng
- ✅ Backup/restore an toàn
- ✅ Debug với MongoDB shell
- ✅ Quản lý database hiệu quả

**Tip**: Chạy `make help` để xem tất cả commands có sẵn!

---

**Last updated**: 2025-10-25

