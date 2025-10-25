# Datetime & Timezone Guide

**Hướng dẫn đầy đủ về xử lý datetime và timezone trong KeypicksVIVU**

> 📌 **TL;DR**: Backend lưu UTC, Frontend hiển thị theo timezone của user. Middleware tự động serialize Date → ISO8601. Sử dụng Utils functions cho mọi datetime operations.

---

## 📖 Table of Contents

- [Quick Summary](#quick-summary)
- [Core Principles](#core-principles)
- [Architecture Overview](#architecture-overview)
- [Backend Implementation](#backend-implementation)
- [Frontend Implementation](#frontend-implementation)
- [Timezone Strategy](#timezone-strategy)
- [Common Scenarios](#common-scenarios)
- [Best Practices](#best-practices)
- [Testing & Debugging](#testing--debugging)
- [Troubleshooting](#troubleshooting)
- [References](#references)

---

## Quick Summary

### 🎯 Nguyên tắc đơn giản

#### Backend
```javascript
// 1. Lưu Date objects
const flight = new Flight({
    departure: { date: new Date('2024-12-15T08:00:00.000Z') }
});

// 2. Response tự động serialize
res.json({ flight }); // Middleware tự động convert Date → ISO8601
```

#### Frontend
```javascript
// 1. Nhận data (tự động parse)
const flight = await apiManager.get('/flights/123');
// flight.departure.date đã là Date object

// 2. Hiển thị
Utils.formatDate(flight.departure.date);      // "15 tháng 12, 2024"
Utils.formatTime(flight.departure.date);      // "15:00"
Utils.formatDateTime(flight.departure.date);  // "15 tháng 12, 2024, 15:00"
```

### ⚡ Cheatsheet

#### Backend
| Action | Code |
|--------|------|
| Save date | `new Flight({ date: new Date() })` |
| Query date | `Flight.find({ date: { $gte: new Date() }})` |
| Response | `res.json({ flight })` → Auto serialize |

#### Frontend
| Action | Code |
|--------|------|
| Parse | Auto via ApiManager |
| Format date | `Utils.formatDate(date)` |
| Format time | `Utils.formatTime(date)` |
| Get now | `Utils.now()` |
| To ISO | `Utils.toISOString(date)` |

### ❌ Common Mistakes

```javascript
// ❌ Backend - Lưu string
date: '2024-12-15'

// ✅ Backend - Lưu Date
date: new Date('2024-12-15T00:00:00.000Z')

// ❌ Frontend - Parse thủ công
new Date(str)

// ✅ Frontend - Dùng Utils hoặc để ApiManager tự parse
Utils.parseDateTime(str)

// ❌ Frontend - Format thủ công
`${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`

// ✅ Frontend - Dùng Utils
Utils.formatShortDate(date)
```

---

## Core Principles

### 1. UTC Base

- **Backend**: Tất cả datetime được lưu trữ trong MongoDB ở dạng UTC
- **Transmission**: Datetime được truyền tải giữa client-server ở format ISO8601 (UTC)
- **Display**: Frontend tự động convert sang timezone cụ thể (Asia/Ho_Chi_Minh) khi hiển thị

### 2. ISO8601 Format

Format chuẩn: `YYYY-MM-DDTHH:mm:ss.sssZ`

Ví dụ:
```
2024-12-15T08:00:00.000Z  // Full datetime
2024-12-15                // Date only
```

### 3. Timezone Flow

```
┌─────────────────────────────────────────────────────────┐
│  INPUT: Vietnam Time (Asia/Ho_Chi_Minh, UTC+7)         │
│         - Seed data                                     │
│         - User input từ Vietnam                         │
└─────────────────────────────────────────────────────────┘
                        │
                        │ Automatic Conversion
                        ▼
┌─────────────────────────────────────────────────────────┐
│  STORAGE: UTC (Coordinated Universal Time)             │
│           - Database timestamps                         │
│           - Server logs                                 │
│           - API responses                               │
└─────────────────────────────────────────────────────────┘
                        │
                        │ Frontend Conversion
                        ▼
┌─────────────────────────────────────────────────────────┐
│  DISPLAY: User's Local Time                            │
│           - Browser timezone                            │
│           - Customizable per user                       │
└─────────────────────────────────────────────────────────┘
```

---

## Architecture Overview

### Centralized Serialization

```
┌─────────────────────────────────────────────────────────────┐
│                        EXPRESS APP                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Request → Parse JSON → Routes → MongoDB Models            │
│                ↓          ↓           ↓                     │
│            Body Parse   Logic    Date objects              │
│                                       ↓                     │
│                                   res.json()                │
│                                       ↓                     │
│                        serializeDateTimeFields              │
│                    (Tự động Date → ISO8601)                 │
│                                       ↓                     │
│                           Response to Client                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Lợi ích:**
- ✅ **DRY**: Không lặp code ở mỗi model
- ✅ **Maintainable**: Sửa 1 chỗ, áp dụng toàn app
- ✅ **Automatic**: Tự động xử lý mọi Date property
- ✅ **Consistent**: Đảm bảo format nhất quán

### Data Flow

#### Backend Flow
```
MongoDB (BSON Date) → Mongoose (Date object) → res.json() → Middleware → ISO8601 string → Client
```

#### Frontend Flow
```
Client → ISO8601 string → ApiManager → Date object → Utils.format*() → Display
```

---

## Backend Implementation

### 1. Centralized Datetime Serialization

Tất cả datetime serialization được xử lý tập trung tại **Express middleware** - không cần config ở từng Model:

**Middleware tự động:**
- Tìm tất cả properties kiểu Date trong response
- Serialize chúng thành ISO8601 format
- Áp dụng cho mọi API response

```javascript
// middleware/datetime.js
const serializeDateTimeFields = (req, res, next) => {
    const originalJson = res.json;
    
    res.json = function(data) {
        // Tự động serialize tất cả Date objects thành ISO8601
        const serialized = serializeDateTime(data);
        return originalJson.call(this, serialized);
    };
    
    next();
};
```

### 2. Model Configuration

Models chỉ cần define Date fields:

```javascript
// models/Flight.js
const flightSchema = new mongoose.Schema({
    departure: {
        date: { type: Date, required: true }
    },
    arrival: {
        date: { type: Date, required: true }
    }
}, { timestamps: true });

// Không cần thêm gì - middleware sẽ tự động serialize
module.exports = mongoose.model('Flight', flightSchema);
```

### 3. Middleware Setup

Middleware được apply một lần duy nhất trong `server.js`:

```javascript
// server.js
const { serializeDateTimeFields } = require('./middleware/datetime');

// Apply middleware globally
app.use(serializeDateTimeFields);

// Tất cả responses sau đây sẽ tự động serialize Date → ISO8601
```

### 4. Helper Functions

Sử dụng các helper functions từ `middleware/datetime.js`:

```javascript
const { now, parseDate, toISO } = require('./middleware/datetime');

// Lấy datetime hiện tại
const currentTime = now();

// Parse date string
const date = parseDate('2024-12-15T08:00:00.000Z');

// Convert Date to ISO8601
const isoString = toISO(new Date());
```

### 5. Timezone in Containers

Tất cả Docker containers được cấu hình với `TZ=UTC`:

```yaml
# docker-compose.yml
services:
  mongodb:
    environment:
      TZ: UTC  # ✅ MongoDB internal clock
    
  app:
    environment:
      TZ: UTC  # ✅ Node.js/Express timezone
      
  mongo-express:
    environment:
      TZ: UTC  # ✅ UI hiển thị timestamps
```

**Verify trong containers:**
```bash
# Kiểm tra timezone
make timezone

# Output mong đợi:
# App Container:
#   TZ=UTC
#   Fri Oct 25 10:00:00 UTC 2025
# MongoDB Container:
#   TZ=UTC
#   Fri Oct 25 10:00:00 UTC 2025
```

### 6. Seed Data: Vietnam Time → UTC

Seed script tự động convert Vietnam time sang UTC:

```javascript
// scripts/seed.js

// Helper function: Convert Vietnam time to UTC
const createFlightDate = (dateStr, timeStr) => {
    // Parse Vietnam local time
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hour, minute] = timeStr.split(':').map(Number);
    
    // Create date object (browser timezone agnostic)
    const vietnamDateTime = new Date(year, month - 1, day, hour, minute, 0);
    
    // Vietnam is UTC+7, so subtract 7 hours to get UTC
    const utcDateTime = new Date(vietnamDateTime.getTime() - (7 * 60 * 60 * 1000));
    
    return utcDateTime;
};

// Usage in seed data
const flight = {
    departure: {
        time: '06:00',  // Display time (Vietnam local)
        date: createFlightDate('2025-01-15', '06:00')  // Stored as UTC
    }
};
```

**Conversion Table:**

| Vietnam Time (UTC+7) | UTC Time | Stored in DB |
|---------------------|----------|--------------|
| 2025-01-15 00:00 | 2025-01-14 17:00 | `ISODate("2025-01-14T17:00:00.000Z")` |
| 2025-01-15 06:00 | 2025-01-14 23:00 | `ISODate("2025-01-14T23:00:00.000Z")` |
| 2025-01-15 12:00 | 2025-01-15 05:00 | `ISODate("2025-01-15T05:00:00.000Z")` |
| 2025-01-15 18:00 | 2025-01-15 11:00 | `ISODate("2025-01-15T11:00:00.000Z")` |
| 2025-01-15 23:59 | 2025-01-15 16:59 | `ISODate("2025-01-15T16:59:00.000Z")` |

### 7. Best Practices (Backend)

#### ✅ DO:
```javascript
// Lưu datetime với Date object
const flight = new Flight({
    departure: {
        date: new Date('2024-12-15T08:00:00.000Z'),
        // ...
    }
});

// Tìm kiếm với Date range
const flights = await Flight.find({
    'departure.date': {
        $gte: new Date(startDate),
        $lt: new Date(endDate)
    }
});

// Response sẽ tự động serialize bởi middleware
res.json({ flight }); // Middleware convert Date → ISO8601 string

// Always store timestamps in UTC
const booking = {
    createdAt: new Date(),  // Will be UTC in DB
    flightDate: utcDate
};

// Use ISO 8601 format
date: "2025-01-15T06:00:00.000Z"  // ISO 8601 with Z (UTC)
```

#### ❌ DON'T:
```javascript
// Không lưu datetime dưới dạng string
const flight = new Flight({
    departure: {
        date: '2024-12-15', // BAD
        // ...
    }
});

// Không tự convert sang timezone khác ở backend
const localTime = utcDate.toLocaleString('vi-VN'); // BAD

// Don't use local time in backend
const now = new Date();
const localString = now.toLocaleString();  // DON'T save this!

// Don't hardcode timezone offsets
const utc = new Date(local.getTime() - 7 * 60 * 60 * 1000);  // What if DST?

// Don't assume server timezone
const date = new Date('2025-01-15');  // Depends on server timezone!
```

---

## Frontend Implementation

### 1. API Manager

`ApiManager` tự động parse ISO8601 strings thành Date objects:

```javascript
// ui/js/api.js
async handleResponse(response) {
    const data = await response.json();
    // Tự động parse datetime fields
    return this.parseDateTimeFields(data);
}
```

### 2. Utils Functions

Sử dụng các utility functions từ `ui/js/utils.js`:

```javascript
// Parse ISO8601 string to Date object
const date = Utils.parseDateTime('2024-12-15T08:00:00.000Z');

// Format date cho hiển thị
const formatted = Utils.formatDate(date); // "15 tháng 12, 2024"
const shortDate = Utils.formatShortDate(date); // "15/12/2024"

// Format time
const time = Utils.formatTime(date); // "15:00" (Vietnam timezone)

// Format full datetime
const fullDateTime = Utils.formatDateTime(date); // "15 tháng 12, 2024, 15:00"

// Relative time
const relative = Utils.formatRelativeTime(date); // "2 giờ trước"

// Get current datetime in ISO8601
const now = Utils.now(); // "2024-12-15T08:00:00.000Z"

// Convert to ISO8601 for sending to backend
const iso = Utils.toISOString(new Date());
```

### 3. Display Datetime in HTML

#### Ví dụ: Hiển thị thông tin chuyến bay

```javascript
// Lấy dữ liệu từ API (đã được parse tự động)
const flight = await apiManager.get('/flights/123');

// flight.departure.date là Date object
console.log(flight.departure.date instanceof Date); // true

// Hiển thị
const html = `
    <div class="flight-info">
        <p class="date">${Utils.formatDate(flight.departure.date)}</p>
        <p class="time">${Utils.formatTime(flight.departure.date)}</p>
    </div>
`;
```

#### Ví dụ: Form input

```javascript
// Hiển thị date trong input
const dateInput = document.getElementById('departure-date');
dateInput.value = Utils.formatForDateInput(flight.departure.date);

// Gửi date lên backend
const formData = {
    departureDate: Utils.toISOString(new Date(dateInput.value))
};
await apiManager.post('/bookings', formData);
```

### 4. Best Practices (Frontend)

#### ✅ DO:
```javascript
// Parse datetime từ API response (tự động)
const bookings = await apiManager.get('/bookings/user');
bookings.forEach(booking => {
    // booking.createdAt đã là Date object
    console.log(Utils.formatDateTime(booking.createdAt));
});

// Gửi datetime lên backend ở format ISO8601
const bookingData = {
    departureDate: Utils.toISOString(selectedDate),
    passengers: passengers.map(p => ({
        ...p,
        dateOfBirth: Utils.toISOString(p.dateOfBirth)
    }))
};

// Hiển thị datetime với timezone Vietnam
const displayDate = Utils.formatDate(flight.departure.date);
const displayTime = Utils.formatTime(flight.departure.date);
```

#### ❌ DON'T:
```javascript
// Không parse datetime thủ công
const date = new Date(dateString); // Dùng Utils.parseDateTime() thay vì

// Không format datetime thủ công
const formatted = `${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}`; 
// Dùng Utils.formatDate() hoặc Utils.formatShortDate()

// Không dùng toLocaleDateString trực tiếp (không consistent)
const str = date.toLocaleDateString(); // BAD
```

---

## Timezone Strategy

### 🎯 Tại sao sử dụng UTC?

#### ✅ Advantages

1. **Consistency**: Tất cả timestamps trong DB đều cùng timezone
2. **No DST Issues**: UTC không có Daylight Saving Time
3. **International Ready**: Dễ dàng support users từ nhiều quốc gia
4. **No Ambiguity**: Không bị nhầm lẫn giữa các timezone
5. **Standard Practice**: Industry best practice cho backend systems

#### ❌ Nếu không dùng UTC

```javascript
// BAD: Lưu local time vào database
{
  departure: "2025-01-15 06:00"  // Đây là giờ nào? Vietnam? UTC? Server?
}

// GOOD: Lưu UTC, display là Vietnam time
{
  departure: {
    time: "06:00",  // Display time (for UI)
    date: ISODate("2025-01-14T23:00:00.000Z")  // UTC timestamp (truth)
  }
}
```

### Timezone Considerations

#### Backend
- Luôn lưu trữ ở UTC
- Không convert sang timezone khác
- MongoDB tự động lưu Date objects ở UTC

#### Frontend
- Tự động convert sang Asia/Ho_Chi_Minh khi hiển thị (qua Utils functions)
- Date objects trong JavaScript tự động sử dụng timezone của browser
- Utils functions đã cấu hình `timeZone: 'Asia/Ho_Chi_Minh'` cho Vietnam

---

## Common Scenarios

### Scenario 1: Tìm kiếm chuyến bay theo ngày

**Backend (routes/flights.js):**
```javascript
router.get('/search', async (req, res) => {
    const { date } = req.query; // "2024-12-15"
    
    const searchDate = new Date(date);
    const nextDay = new Date(searchDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    const flights = await Flight.find({
        'departure.date': {
            $gte: searchDate,
            $lt: nextDay
        }
    });
    
    // Middleware tự động serialize tất cả Date fields → ISO8601
    res.json({ flights });
});
```

**Frontend:**
```javascript
// Lấy date từ input
const dateInput = document.getElementById('departure-date');
const searchDate = new Date(dateInput.value);

// Gửi lên backend
const results = await apiManager.get('/flights/search', {
    date: Utils.toISOString(searchDate)
});

// Hiển thị kết quả
results.flights.forEach(flight => {
    // flight.departure.date đã là Date object
    const dateStr = Utils.formatDate(flight.departure.date);
    const timeStr = Utils.formatTime(flight.departure.date);
    // Render...
});
```

### Scenario 2: Tạo booking với passenger info

**Frontend:**
```javascript
const bookingData = {
    flightId: selectedFlight._id,
    passengers: passengers.map(p => ({
        firstName: p.firstName,
        lastName: p.lastName,
        gender: p.gender,
        dateOfBirth: Utils.toISOString(new Date(p.dateOfBirth))
    })),
    contactInfo: {
        email: email,
        phone: phone
    }
};

const response = await apiManager.post('/bookings', bookingData);
// response.booking.createdAt sẽ là Date object
```

**Backend (routes/bookings.js):**
```javascript
router.post('/', authenticateToken, async (req, res) => {
    const { passengers } = req.body;
    
    // dateOfBirth được parse từ ISO8601 string → Date object
    const booking = new Booking({
        userId: req.user.id,
        passengers: passengers.map(p => ({
            ...p,
            dateOfBirth: new Date(p.dateOfBirth) // Parse ISO8601 → Date
        })),
        // ...
    });
    
    await booking.save();
    // Middleware tự động serialize: Date → ISO8601
    res.json({ booking });
});
```

### Scenario 3: Hiển thị booking history

**Frontend:**
```javascript
const bookings = await apiManager.get('/bookings/user');

const html = bookings.map(booking => `
    <div class="booking-card">
        <p class="booking-date">
            Đặt ngày: ${Utils.formatDateTime(booking.createdAt)}
        </p>
        <p class="flight-date">
            Ngày bay: ${Utils.formatDate(booking.flight.departure.date)}
        </p>
        <p class="relative-time">
            ${Utils.formatRelativeTime(booking.createdAt)}
        </p>
    </div>
`).join('');
```

### Scenario 4: User Input → UTC Conversion

Khi user nhập thời gian (ví dụ: tìm kiếm chuyến bay):

**Frontend gửi request:**
```javascript
// ui/js/search.js
function searchFlights(departure, arrival, date) {
    // User chọn: 15/01/2025 (Vietnam calendar)
    // Convert to UTC for API
    const vietnamDate = new Date(date);
    vietnamDate.setHours(0, 0, 0, 0);
    
    // Send as ISO string (will be UTC)
    const params = {
        departure,
        arrival,
        date: vietnamDate.toISOString()  // "2025-01-14T17:00:00.000Z"
    };
    
    return apiManager.get('/flights/search', params);
}
```

**Backend xử lý:**
```javascript
// routes/flights.js
router.get('/search', async (req, res) => {
    const { departure, arrival, date } = req.query;
    
    // date đã là UTC string
    const searchDate = new Date(date);
    
    // Query với UTC timestamps
    const flights = await Flight.find({
        'departure.airport': departure,
        'arrival.airport': arrival,
        'departure.date': {
            $gte: searchDate,
            $lt: new Date(searchDate.getTime() + 24 * 60 * 60 * 1000)
        }
    });
    
    res.json({ flights });
});
```

---

## Best Practices

### ✅ DO's

1. **Always store timestamps in UTC**
   ```javascript
   // GOOD
   const booking = {
       createdAt: new Date(),  // Will be UTC in DB
       flightDate: utcDate
   };
   ```

2. **Convert at the boundaries**
   ```javascript
   // Input: Convert local → UTC
   const vietnamInput = '2025-01-15 06:00';
   const utcDate = convertVietnamToUTC(vietnamInput);
   
   // Output: Convert UTC → local
   const displayDate = utcDate.toLocaleString('vi-VN', {
       timeZone: 'Asia/Ho_Chi_Minh'
   });
   ```

3. **Use ISO 8601 format**
   ```javascript
   // GOOD
   date: "2025-01-15T06:00:00.000Z"  // ISO 8601 with Z (UTC)
   
   // BAD
   date: "15/01/2025 06:00"  // Ambiguous format
   ```

4. **Test with different timezones**
   ```javascript
   // Test data for edge cases
   const testCases = [
       { vietnam: '2025-01-15 00:00', utc: '2025-01-14T17:00:00.000Z' },
       { vietnam: '2025-01-15 23:59', utc: '2025-01-15T16:59:00.000Z' },
   ];
   ```

5. **Use centralized utilities**
   ```javascript
   // Backend: Use middleware helpers
   const { now, parseDate, toISO } = require('./middleware/datetime');
   
   // Frontend: Use Utils functions
   Utils.formatDate(date);
   Utils.toISOString(date);
   ```

### ❌ DON'Ts

1. **Don't use local time in backend**
   ```javascript
   // BAD
   const now = new Date();
   const localString = now.toLocaleString();  // DON'T save this!
   
   // GOOD
   const now = new Date();  // Internally UTC
   await save({ timestamp: now });  // MongoDB stores as UTC
   ```

2. **Don't hardcode timezone offsets**
   ```javascript
   // BAD
   const utc = new Date(local.getTime() - 7 * 60 * 60 * 1000);  // What if DST?
   
   // GOOD
   const utc = convertVietnamToUTC(localString);  // Use helper function
   ```

3. **Don't mix timezones in database**
   ```javascript
   // BAD - Inconsistent!
   {
       departure: vietnamTime,  // Some flights in Vietnam time
       arrival: utcTime        // Some in UTC
   }
   
   // GOOD - All UTC!
   {
       departure: utcTime,
       arrival: utcTime
   }
   ```

4. **Don't assume server timezone**
   ```javascript
   // BAD
   const date = new Date('2025-01-15');  // Depends on server timezone!
   
   // GOOD
   const date = new Date('2025-01-15T00:00:00.000Z');  // Explicit UTC
   ```

---

## Testing & Debugging

### Test Backend Datetime Serialization

```javascript
// Test middleware serialization
const flight = await Flight.findById(id);
console.log(typeof flight.departure.date); // object (Date) - in memory

// When sent through res.json(), middleware converts to ISO8601
res.json({ flight }); // Client nhận: { flight: { departure: { date: "2024-12-15T08:00:00.000Z" }}}
```

### Test Middleware in Isolation

```javascript
const { serializeDateTime } = require('./middleware/datetime');

const testData = {
    flight: {
        departure: {
            date: new Date('2024-12-15T08:00:00.000Z')
        }
    },
    createdAt: new Date()
};

const serialized = serializeDateTime(testData);
console.log(typeof serialized.flight.departure.date); // string
console.log(serialized.flight.departure.date); // "2024-12-15T08:00:00.000Z"
```

### Test Frontend Datetime Parsing

```javascript
// Test trong browser console
const testDate = '2024-12-15T08:00:00.000Z';
const parsed = Utils.parseDateTime(testDate);
console.log(parsed instanceof Date); // true
console.log(Utils.formatDate(parsed)); // "15 tháng 12, 2024"
console.log(Utils.formatTime(parsed)); // "15:00" (nếu ở Vietnam timezone)
```

### Test Timezone Conversion

```javascript
// test-timezone.js
const { createFlightDate } = require('./scripts/seed');

console.log('Testing Vietnam → UTC conversion:\n');

const testCases = [
    { date: '2025-01-15', time: '00:00' },
    { date: '2025-01-15', time: '06:00' },
    { date: '2025-01-15', time: '12:00' },
    { date: '2025-01-15', time: '18:00' },
    { date: '2025-01-15', time: '23:59' },
];

testCases.forEach(({ date, time }) => {
    const utc = createFlightDate(date, time);
    console.log(`VN: ${date} ${time} → UTC: ${utc.toISOString()}`);
});

// Expected output:
// VN: 2025-01-15 00:00 → UTC: 2025-01-14T17:00:00.000Z
// VN: 2025-01-15 06:00 → UTC: 2025-01-14T23:00:00.000Z
// VN: 2025-01-15 12:00 → UTC: 2025-01-15T05:00:00.000Z
// VN: 2025-01-15 18:00 → UTC: 2025-01-15T11:00:00.000Z
// VN: 2025-01-15 23:59 → UTC: 2025-01-15T16:59:00.000Z
```

### Development Workflow

#### Kiểm tra Timezone

```bash
# Kiểm tra timezone trong containers
make timezone

# Hoặc manual
docker-compose exec app sh -c "echo TZ=\$TZ && date"
docker-compose exec mongodb sh -c "echo TZ=\$TZ && date"
```

#### Seed Database

```bash
# Seed với Vietnam timezone data
make seed

# Log output sẽ hiển thị:
# 📅 Creating flight data with Vietnam timezone (Asia/Ho_Chi_Minh)...
#    All times shown are Vietnam local time (UTC+7)
#    Database will store in UTC
# ✓ Flights seeded successfully
#    Example: VN210 departs at 06:00 Vietnam time 
#             (stored as 23:00 UTC previous day)
```

#### Query Database

```bash
# Access MongoDB shell
make db-shell

# Check timezone-sensitive data
> db.flights.findOne({flightNumber: "VN210"})
{
  departure: {
    time: "06:00",  // Display time
    date: ISODate("2025-01-14T23:00:00.000Z")  // UTC!
  }
}

# Query by date range (UTC)
> db.flights.find({
    'departure.date': {
      $gte: ISODate("2025-01-14T17:00:00.000Z"),  // Start of 2025-01-15 VN time
      $lt: ISODate("2025-01-15T17:00:00.000Z")    // Start of 2025-01-16 VN time
    }
  })
```

#### Debug API Response

```bash
# Check container timezone
make timezone

# Check MongoDB data
make db-shell
> db.flights.find().limit(1).pretty()

# Check Express server logs
make logs-app | grep -i "timezone\|utc"

# Test API response
curl http://localhost:3000/api/flights/search\?departure=SGN\&arrival=HAN\&date=2025-01-15 | jq '.flights[0].departure'

# Should see:
# {
#   "time": "06:00",
#   "date": "2025-01-14T23:00:00.000Z"
# }
```

---

## Troubleshooting

### Issue 1: Datetime hiển thị sai timezone

**Giải pháp:** Đảm bảo sử dụng Utils functions thay vì format thủ công

```javascript
// ❌ Wrong
const str = date.toLocaleDateString();

// ✅ Correct
const str = Utils.formatDate(date);
```

### Issue 2: Date không được parse từ API

**Giải pháp:** Kiểm tra ApiManager đang sử dụng đúng và field name có trong danh sách dateTimeFields

### Issue 3: Backend lưu datetime sai

**Giải pháp:** Đảm bảo sử dụng Date object, không phải string

```javascript
// ❌ Wrong
const booking = new Booking({
    createdAt: new Date().toISOString() // String - MongoDB lưu as string!
});

// ✅ Correct
const booking = new Booking({
    createdAt: new Date() // Date object - MongoDB lưu as BSON Date
});
// hoặc dùng timestamps: true trong schema (Mongoose tự động thêm)
```

### Issue 4: Middleware không serialize

**Giải pháp:** Kiểm tra middleware đã được apply:

```javascript
// server.js - đảm bảo middleware được thêm TRƯỚC routes
const { serializeDateTimeFields } = require('./middleware/datetime');
app.use(serializeDateTimeFields);

// Sau đó mới add routes
app.use('/api/flights', flightRoutes);
```

### Issue 5: Dates off by 1 day

```
Symptom: Flight shows 14/01 instead of 15/01
Cause: Timezone conversion error
Solution: Check createFlightDate() offset calculation
```

```javascript
// Verify conversion
const vn = '2025-01-15 06:00';
const utc = createFlightDate('2025-01-15', '06:00');
console.log('Vietnam:', vn);
console.log('UTC:', utc.toISOString());
// Should be: 2025-01-14T23:00:00.000Z (7 hours earlier)
```

### Issue 6: Container showing wrong timezone

```
Symptom: docker exec app date shows local time, not UTC
Cause: TZ env var not set correctly
Solution: Rebuild containers
```

```bash
# Fix
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Verify
make timezone
```

### Issue 7: Query returns wrong flights

```
Symptom: Search for 15/01 returns flights from 14/01 or 16/01
Cause: Date range query not accounting for timezone
Solution: Use full day range in UTC
```

```javascript
// BAD: Direct date comparison
const date = new Date('2025-01-15');
const flights = await Flight.find({ 'departure.date': date });

// GOOD: Date range covering full day
const startOfDay = new Date('2025-01-14T17:00:00.000Z');  // 00:00 VN time
const endOfDay = new Date('2025-01-15T17:00:00.000Z');    // 00:00 next day VN time

const flights = await Flight.find({
    'departure.date': { $gte: startOfDay, $lt: endOfDay }
});
```

---

## Migration Guide

Nếu bạn có code cũ cần migrate:

### Backend Migration

```javascript
// Old
flight.departure.date = '2024-12-15';

// New
flight.departure.date = new Date('2024-12-15T00:00:00.000Z');
```

### Frontend Migration

```javascript
// Old
const dateStr = flight.departure.date.substring(0, 10);
element.textContent = dateStr;

// New
const dateStr = Utils.formatShortDate(flight.departure.date);
element.textContent = dateStr;
```

---

## Advanced Topics

### Working with Multiple Timezones

Nếu cần support users từ nhiều quốc gia:

```javascript
// Backend: Always return UTC
router.get('/flights/:id', async (req, res) => {
    const flight = await Flight.findById(req.params.id);
    res.json({
        ...flight.toObject(),
        departure: {
            time: flight.departure.time,
            date: flight.departure.date.toISOString(),  // UTC
            timezone: 'Asia/Ho_Chi_Minh'  // Reference timezone
        }
    });
});

// Frontend: Convert to user's timezone
function displayFlightTime(flight, userTimezone) {
    const utcDate = new Date(flight.departure.date);
    
    return utcDate.toLocaleString('default', {
        timeZone: userTimezone
    });
}
```

### Date Range Queries

```javascript
// Helper: Get UTC range for a Vietnam date
function getVietnamDayRange(vietnamDateString) {
    // "2025-01-15" in Vietnam
    const [year, month, day] = vietnamDateString.split('-').map(Number);
    
    // Start: 00:00 Vietnam time = 17:00 UTC previous day
    const startUTC = new Date(year, month - 1, day, 0, 0, 0);
    startUTC.setTime(startUTC.getTime() - 7 * 60 * 60 * 1000);
    
    // End: 00:00 next day Vietnam time = 17:00 UTC same day
    const endUTC = new Date(startUTC);
    endUTC.setTime(endUTC.getTime() + 24 * 60 * 60 * 1000);
    
    return { start: startUTC, end: endUTC };
}

// Usage in API
router.get('/flights/search', async (req, res) => {
    const { date } = req.query;  // "2025-01-15"
    const { start, end } = getVietnamDayRange(date);
    
    const flights = await Flight.find({
        'departure.date': { $gte: start, $lt: end }
    });
    
    res.json({ flights });
});
```

### Helper Functions

```javascript
// Add to utils/timezone.js

// Convert Vietnam time string to UTC Date
function vietnamToUTC(dateStr, timeStr) {
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hour, minute] = timeStr.split(':').map(Number);
    
    const vn = new Date(year, month - 1, day, hour, minute, 0);
    return new Date(vn.getTime() - 7 * 60 * 60 * 1000);
}

// Convert UTC Date to Vietnam time string
function utcToVietnam(utcDate) {
    return utcDate.toLocaleString('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
}

// Get Vietnam day boundaries in UTC
function getVietnamDayUTC(dateString) {
    const [y, m, d] = dateString.split('-').map(Number);
    const start = new Date(y, m - 1, d, 0, 0, 0);
    start.setTime(start.getTime() - 7 * 60 * 60 * 1000);
    
    const end = new Date(start);
    end.setTime(end.getTime() + 24 * 60 * 60 * 1000);
    
    return { start, end };
}

module.exports = { vietnamToUTC, utcToVietnam, getVietnamDayUTC };
```

---

## Quick Command Reference

```bash
# Timezone Management
make timezone          # Check timezone in all containers
make seed             # Seed with VN time → UTC conversion
make db-shell         # Access MongoDB (UTC timezone)

# Debugging
make logs-app         # Check Express server logs
make logs-db          # Check MongoDB logs
docker-compose exec app date  # Check app container time
docker-compose exec mongodb date  # Check MongoDB container time
```

---

## 💡 Tips & Tricks

1. **Always think in UTC internally**: Backend should only work with UTC
2. **Convert at boundaries**: Input/Output is where conversion happens
3. **Test edge cases**: Midnight, end of day, month boundaries
4. **Use ISO 8601**: Standard format for date/time strings
5. **Document assumptions**: Make timezone expectations explicit in code
6. **Validate dates**: Ensure dates are valid before conversion
7. **Use libraries carefully**: moment-timezone, date-fns-tz are helpful but add bundle size

---

## Key Points Summary

- ✅ **Backend**: Lưu Date objects, middleware tự động serialize thành ISO8601
- ✅ **Frontend**: ApiManager tự động parse ISO8601 → Date objects
- ✅ **Display**: Utils functions format với Vietnam timezone
- ✅ **Centralized**: Tất cả datetime logic tập trung ở middleware, không rải rác ở models
- ✅ **Automatic**: Không cần config gì thêm, chỉ cần dùng Date type trong schema
- ✅ **UTC**: Tất cả containers và database sử dụng UTC timezone
- ✅ **Conversion**: Seed data tự động convert Vietnam time → UTC

---

## References

- [ISO8601 Standard](https://en.wikipedia.org/wiki/ISO_8601)
- [MDN - Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)
- [Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat)
- [MongoDB Date Types](https://www.mongodb.com/docs/manual/reference/bson-types/#date)
- [SETUP_DATABASE.md](./SETUP_DATABASE.md) - Database setup guide
- [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) - Development workflow
- [DATABASE_COMMANDS_GUIDE.md](./DATABASE_COMMANDS_GUIDE.md) - Database commands
- [QUICKSTART.md](./QUICKSTART.md) - Quick start guide
- [README.md](../README.md) - Project overview

---

**Document Type:** Technical Guide  
**Last Updated:** 2025-10-25  
**Maintained By:** Development Team

