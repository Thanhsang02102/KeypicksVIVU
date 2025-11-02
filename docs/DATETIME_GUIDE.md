# Datetime Guide - ISO8601 Only

**Quy tắc cứng: Toàn bộ dự án CHỈ sử dụng ISO8601 format**

> 📌 **TL;DR**: Mọi datetime PHẢI là ISO8601. Backend lưu Date objects, trả về ISO8601. Frontend gửi ISO8601, nhận ISO8601. Middleware tự động xử lý.

---

## 📖 Table of Contents

- [Core Rule](#core-rule)
- [ISO8601 Format](#iso8601-format)
- [Backend](#backend)
- [Frontend](#frontend)
- [Examples](#examples)
- [References](#references)

---

## Core Rule

### ✅ LUÔN LUÔN sử dụng ISO8601

```
BACKEND:  Date objects → Middleware → ISO8601 string → Response
FRONTEND: ISO8601 string → Parse → Date object → Display
FILTER:   ISO8601 string → Backend
```

### ❌ KHÔNG BAO GIỜ

- ❌ Không format thủ công (`DD/MM/YYYY`, `HH:mm`, etc.)
- ❌ Không tách date và time thành 2 fields riêng
- ❌ Không lưu string trong database
- ❌ Không dùng format khác ngoài ISO8601

---

## ISO8601 Format

### Supported Formats

```javascript
// ✅ Full datetime with timezone
'2025-10-27T06:00:00+07:00'; // Vietnam time (UTC+7)
'2025-10-27T08:00:00Z'; // UTC time

// ✅ Full datetime with milliseconds
'2025-10-27T08:00:00.000Z'; // UTC with milliseconds

// ✅ Date only
'2025-10-27'; // Date without time
```

### Pattern

```
YYYY-MM-DDTHH:mm:ss.sssZ
YYYY-MM-DDTHH:mm:ss+HH:mm
YYYY-MM-DD
```

---

## Backend

### 1. Model Definition

```javascript
// models/Flight.js
const flightSchema = new mongoose.Schema(
  {
    departure: {
      airport: { type: String, required: true },
      city: { type: String, required: true },
      timestamp: { type: Date, required: true }, // ✅ Date type
    },
    arrival: {
      airport: { type: String, required: true },
      city: { type: String, required: true },
      timestamp: { type: Date, required: true }, // ✅ Date type
    },
  },
  { timestamps: true }
); // ✅ Auto createdAt, updatedAt
```

### 2. Middleware (Already configured)

```javascript
// middleware/datetime.js - Tự động xử lý
// ✅ Parse: ISO8601 string → Date object (request)
// ✅ Serialize: Date object → ISO8601 string (response)

// server.js
app.use(parseDateTimeFields); // Parse incoming requests
app.use(serializeDateTimeFields); // Serialize outgoing responses
```

### 3. Routes

```javascript
// routes/flights.js
router.get('/search', async (req, res) => {
  const { date } = req.query; // ✅ ISO8601 string: "2025-10-27"

  // ✅ Middleware đã tự động parse thành Date object
  const searchDate = new Date(date); // Already a Date if parsed by middleware
  const nextDay = new Date(searchDate);
  nextDay.setDate(nextDay.getDate() + 1);

  const flights = await Flight.find({
    'departure.timestamp': {
      $gte: searchDate,
      $lt: nextDay,
    },
  }).sort({ 'departure.timestamp': 1 });

  // ✅ Middleware tự động serialize Date → ISO8601
  res.json({ flights });
});
```

### 4. Seed Data

```json
// scripts/data/flights.json
{
  "departure": {
    "airport": "SGN",
    "city": "TP. Hồ Chí Minh",
    "timestamp": "2025-10-27T06:00:00+07:00"
  },
  "arrival": {
    "airport": "HAN",
    "city": "Hà Nội",
    "timestamp": "2025-10-27T08:00:00+07:00"
  }
}
```

```javascript
// scripts/seed.js
const flight = new Flight({
  departure: {
    airport: 'SGN',
    city: 'TP. Hồ Chí Minh',
    timestamp: new Date('2025-10-27T06:00:00+07:00'), // ✅ ISO8601 → Date
  },
});
await flight.save();
```

---

## Frontend

### 1. Gửi Filter (ISO8601 Only)

```javascript
// ui/js/search.js
async searchFlights(searchParams) {
    // ✅ Đảm bảo date là ISO8601
    const params = {
        departure: searchParams.departure,
        arrival: searchParams.arrival,
        date: Utils.toISOString(new Date(searchParams.date))  // ✅ ISO8601
    };

    const response = await apiManager.get('/flights/search', params);
    return response.flights || [];
}
```

### 2. Nhận Response (Auto Parse)

```javascript
// ui/js/api.js - ApiManager tự động parse ISO8601 → Date objects
const flight = await apiManager.get('/flights/123');
// flight.departure.timestamp is Date object
```

### 3. Hiển thị (Utils Functions)

```javascript
// ui/js/utils.js
Utils.formatDate(flight.departure.timestamp); // "27 tháng 10, 2025"
Utils.formatTime(flight.departure.timestamp); // "13:00"
Utils.formatDateTime(flight.departure.timestamp); // "27 tháng 10, 2025, 13:00"
Utils.formatShortDate(flight.departure.timestamp); // "27/10/2025"
```

### 4. Form Input

```javascript
// Lấy giá trị từ input[type="date"]
const dateInput = document.getElementById('departure-date');
const selectedDate = dateInput.value; // "2025-10-27" (ISO8601 date)

// Gửi lên backend (ISO8601)
const bookingData = {
  departureDate: selectedDate, // ✅ ISO8601 date string
  // hoặc với time:
  departureDateTime: Utils.toISOString(new Date(selectedDate)), // ✅ Full ISO8601
};

await apiManager.post('/bookings', bookingData);
```

---

## Examples

### Example 1: Search Flights

**Frontend:**

```javascript
// User chọn date từ input: 2025-10-27
const searchParams = {
  departure: 'SGN',
  arrival: 'HAN',
  date: '2025-10-27', // ✅ ISO8601 date
};

const flights = await searchManager.searchFlights(searchParams);
```

**Backend:**

```javascript
// routes/flights.js
router.get('/search', async (req, res) => {
  const { date } = req.query; // "2025-10-27" (ISO8601)

  const searchDate = new Date(date); // Parsed by middleware
  const nextDay = new Date(searchDate);
  nextDay.setDate(nextDay.getDate() + 1);

  const flights = await Flight.find({
    'departure.timestamp': { $gte: searchDate, $lt: nextDay },
  });

  res.json({ flights }); // Serialized to ISO8601 by middleware
});
```

### Example 2: Display Flight

**Frontend:**

```javascript
const flight = await apiManager.get('/flights/123');

// flight.departure.timestamp is Date object (auto-parsed by ApiManager)
const html = `
    <div class="flight-card">
        <p>Ngày: ${Utils.formatDate(flight.departure.timestamp)}</p>
        <p>Giờ: ${Utils.formatTime(flight.departure.timestamp)}</p>
        <p>Đầy đủ: ${Utils.formatDateTime(flight.departure.timestamp)}</p>
    </div>
`;
```

### Example 3: Create Booking

**Frontend:**

```javascript
const bookingData = {
  flightId: selectedFlight._id,
  passengers: passengers.map((p) => ({
    firstName: p.firstName,
    lastName: p.lastName,
    dateOfBirth: Utils.toISOString(new Date(p.dateOfBirth)), // ✅ ISO8601
  })),
};

const booking = await apiManager.post('/bookings', bookingData);
```

**Backend:**

```javascript
router.post('/', async (req, res) => {
  const { passengers } = req.body;

  // Middleware đã parse dateOfBirth thành Date objects
  const booking = new Booking({
    passengers: passengers, // dateOfBirth đã là Date objects
    createdAt: new Date(), // ✅ Date object
  });

  await booking.save();
  res.json({ booking }); // Middleware serialize → ISO8601
});
```

---

## Quick Reference

### Backend

| Action       | Code                                                                             |
| ------------ | -------------------------------------------------------------------------------- |
| Define field | `timestamp: { type: Date, required: true }`                                      |
| Create       | `new Flight({ departure: { timestamp: new Date('2025-10-27T06:00:00+07:00') }})` |
| Query        | `Flight.find({ 'departure.timestamp': { $gte: new Date() }})`                    |
| Response     | `res.json({ flight })` → Middleware auto-serializes                              |

### Frontend

| Action      | Code                                                            |
| ----------- | --------------------------------------------------------------- |
| Send filter | `{ date: '2025-10-27' }` or `{ date: Utils.toISOString(date) }` |
| Receive     | Auto-parsed by ApiManager → Date objects                        |
| Display     | `Utils.formatDate(date)`, `Utils.formatTime(date)`              |
| Get current | `Utils.now()` → ISO8601 string                                  |
| Convert     | `Utils.toISOString(date)` → ISO8601 string                      |

---

## Testing

### Test Backend

```bash
# Search flights by date (ISO8601)
curl "http://localhost:3000/api/flights/search?date=2025-10-27"

# Response should have ISO8601 timestamps:
# {
#   "flights": [{
#     "departure": { "timestamp": "2025-10-27T06:00:00.000Z" }
#   }]
# }
```

### Test Frontend

```javascript
// Browser console
const flight = await apiManager.get('/flights/123');
console.log(flight.departure.timestamp instanceof Date); // true
console.log(flight.departure.timestamp.toISOString()); // ISO8601 string
```

---

## Rules Summary

### ✅ DO

1. **Backend**: Use `Date` type in schemas
2. **Backend**: Let middleware handle serialization
3. **Frontend**: Send ISO8601 strings in filters
4. **Frontend**: Use Utils functions for display
5. **Everywhere**: Use ISO8601 format exclusively

### ❌ DON'T

1. **Backend**: Don't store strings (`timestamp: String`)
2. **Backend**: Don't manually serialize (`date.toISOString()` in routes)
3. **Frontend**: Don't send non-ISO8601 formats
4. **Frontend**: Don't format manually (`${day}/${month}/${year}`)
5. **Anywhere**: Don't split date and time into separate fields

---

## Troubleshooting

### Issue: Filter không trả về kết quả

**Nguyên nhân**: Frontend gửi format không phải ISO8601

**Giải pháp**:

```javascript
// ❌ Wrong
const params = { date: '27/10/2025' };

// ✅ Correct
const params = { date: '2025-10-27' };
// or
const params = { date: Utils.toISOString(new Date(dateInput.value)) };
```

### Issue: Date hiển thị sai timezone

**Nguyên nhân**: Không dùng Utils functions

**Giải pháp**:

```javascript
// ❌ Wrong
const str = date.toLocaleDateString();

// ✅ Correct
const str = Utils.formatDate(date); // Tự động dùng Vietnam timezone
```

### Issue: Backend lưu string thay vì Date

**Nguyên nhân**: Schema dùng String type

**Giải pháp**:

```javascript
// ❌ Wrong
timestamp: {
  type: String;
}

// ✅ Correct
timestamp: {
  type: Date;
}
```

---

## References

- [ISO8601 Standard](https://en.wikipedia.org/wiki/ISO_8601)
- [MDN - Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)
- [MongoDB Date Types](https://www.mongodb.com/docs/manual/reference/bson-types/#date)

---

**Document Type:** Technical Guide
**Last Updated:** 2025-10-26
**Maintained By:** Development Team
