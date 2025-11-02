# 💰 Pricing Module - Hướng dẫn triển khai

> **Lưu ý**: Module này chưa được triển khai. File này mô tả thiết kế và kế hoạch triển khai.

## 📋 Tổng quan

Giá vé máy bay **KHÔNG** được lưu trữ trong model `Flight` vì giá vé phụ thuộc vào nhiều yếu tố động:

### Các yếu tố ảnh hưởng đến giá vé

1. **Loại ghế (Seat Class)**
   - Economy
   - Premium Economy  
   - Business
   - First Class

2. **Thời điểm đặt vé**
   - Early bird (đặt trước nhiều tuần)
   - Đặt gần ngày bay
   - Last minute booking

3. **Ưu đãi & Khuyến mãi**
   - Mã giảm giá (promo codes)
   - Chương trình khuyến mãi theo mùa
   - Giảm giá cho khách hàng thân thiết

4. **Số lượng ghế còn trống**
   - Dynamic pricing dựa trên demand
   - Giá tăng khi ghế sắp hết

5. **Dịch vụ bổ sung**
   - Hành lý ký gửi
   - Chọn chỗ ngồi
   - Bữa ăn trên máy bay
   - Bảo hiểm du lịch

## 🏗️ Kiến trúc đề xuất

### 1. Model: `Pricing`

```javascript
const pricingSchema = new mongoose.Schema({
    flight: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Flight',
        required: true
    },
    basePrice: {
        type: Number,
        required: true,
        description: "Giá cơ bản (economy class)"
    },
    seatClasses: {
        economy: {
            price: Number,
            multiplier: { type: Number, default: 1.0 }
        },
        premiumEconomy: {
            price: Number,
            multiplier: { type: Number, default: 1.5 }
        },
        business: {
            price: Number,
            multiplier: { type: Number, default: 2.0 }
        },
        firstClass: {
            price: Number,
            multiplier: { type: Number, default: 3.0 }
        }
    },
    dynamicPricing: {
        enabled: { type: Boolean, default: true },
        demandMultiplier: { type: Number, default: 1.0 },
        lastUpdated: Date
    },
    validFrom: {
        type: Date,
        required: true
    },
    validUntil: {
        type: Date,
        required: true
    }
}, {
    timestamps: true
});
```

### 2. Model: `Promotion`

```javascript
const promotionSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true
    },
    type: {
        type: String,
        enum: ['percentage', 'fixed', 'bundle'],
        required: true
    },
    discount: {
        type: Number,
        required: true
    },
    description: String,
    applicableFlights: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Flight'
    }],
    applicableAirlines: [String],
    applicableRoutes: [String],
    minPurchase: Number,
    maxDiscount: Number,
    usageLimit: Number,
    usageCount: { type: Number, default: 0 },
    validFrom: Date,
    validUntil: Date,
    active: { type: Boolean, default: true }
}, {
    timestamps: true
});
```

### 3. Service: `PricingService`

```javascript
class PricingService {
    /**
     * Tính giá vé dựa trên nhiều yếu tố
     */
    async calculatePrice(flightId, options = {}) {
        const {
            seatClass = 'economy',
            passengers = 1,
            promotionCode = null,
            bookingDate = new Date(),
            addons = []
        } = options;

        // 1. Lấy base price
        const pricing = await Pricing.findOne({
            flight: flightId,
            validFrom: { $lte: bookingDate },
            validUntil: { $gte: bookingDate }
        });

        if (!pricing) {
            throw new Error('Pricing not available for this flight');
        }

        let totalPrice = pricing.basePrice;

        // 2. Áp dụng multiplier theo loại ghế
        totalPrice *= pricing.seatClasses[seatClass].multiplier;

        // 3. Áp dụng dynamic pricing
        if (pricing.dynamicPricing.enabled) {
            totalPrice *= pricing.dynamicPricing.demandMultiplier;
        }

        // 4. Tính cho số lượng hành khách
        totalPrice *= passengers;

        // 5. Áp dụng promotion
        if (promotionCode) {
            const discount = await this.applyPromotion(
                promotionCode, 
                totalPrice, 
                flightId
            );
            totalPrice -= discount;
        }

        // 6. Thêm các dịch vụ bổ sung
        const addonsCost = await this.calculateAddons(addons);
        totalPrice += addonsCost;

        return {
            basePrice: pricing.basePrice,
            seatClass,
            seatClassMultiplier: pricing.seatClasses[seatClass].multiplier,
            subtotal: totalPrice - addonsCost,
            addons: addonsCost,
            total: totalPrice,
            currency: 'VND'
        };
    }

    /**
     * Áp dụng mã khuyến mãi
     */
    async applyPromotion(code, currentPrice, flightId) {
        const promo = await Promotion.findOne({
            code: code.toUpperCase(),
            active: true,
            validFrom: { $lte: new Date() },
            validUntil: { $gte: new Date() },
            usageCount: { $lt: '$usageLimit' }
        });

        if (!promo) {
            throw new Error('Invalid or expired promotion code');
        }

        // Check if applicable
        if (promo.applicableFlights.length > 0 &&
            !promo.applicableFlights.includes(flightId)) {
            throw new Error('Promotion not applicable to this flight');
        }

        // Calculate discount
        let discount = 0;
        if (promo.type === 'percentage') {
            discount = currentPrice * (promo.discount / 100);
            if (promo.maxDiscount) {
                discount = Math.min(discount, promo.maxDiscount);
            }
        } else if (promo.type === 'fixed') {
            discount = promo.discount;
        }

        // Update usage count
        await Promotion.updateOne(
            { _id: promo._id },
            { $inc: { usageCount: 1 } }
        );

        return discount;
    }

    /**
     * Cập nhật dynamic pricing dựa trên demand
     */
    async updateDynamicPricing(flightId) {
        const flight = await Flight.findById(flightId);
        const occupancyRate = 
            (flight.totalSeats - flight.availableSeats) / flight.totalSeats;

        // Tăng giá khi ghế gần hết
        let multiplier = 1.0;
        if (occupancyRate > 0.8) {
            multiplier = 1.3;
        } else if (occupancyRate > 0.6) {
            multiplier = 1.15;
        }

        await Pricing.updateOne(
            { flight: flightId },
            {
                'dynamicPricing.demandMultiplier': multiplier,
                'dynamicPricing.lastUpdated': new Date()
            }
        );

        return multiplier;
    }

    /**
     * Tính chi phí các dịch vụ bổ sung
     */
    async calculateAddons(addons) {
        const addonPrices = {
            baggageExtra: 200000,      // VND per bag
            seatSelection: 100000,     // VND per seat
            mealUpgrade: 150000,       // VND per meal
            insurance: 50000           // VND per person
        };

        return addons.reduce((total, addon) => {
            return total + (addonPrices[addon.type] || 0) * (addon.quantity || 1);
        }, 0);
    }
}

module.exports = new PricingService();
```

## 🔌 API Endpoints đề xuất

### GET `/api/flights/:id/pricing`
Lấy thông tin giá của một chuyến bay

**Query Parameters:**
- `seatClass` - Economy, Business, etc.
- `passengers` - Số lượng hành khách
- `promotionCode` - Mã khuyến mãi (optional)
- `addons` - Các dịch vụ bổ sung (optional)

**Response:**
```json
{
  "success": true,
  "pricing": {
    "basePrice": 1500000,
    "seatClass": "business",
    "seatClassMultiplier": 2.0,
    "subtotal": 3000000,
    "addons": 200000,
    "discount": 300000,
    "total": 2900000,
    "currency": "VND",
    "breakdown": {
      "basePrice": 1500000,
      "seatClassPrice": 3000000,
      "baggageExtra": 200000,
      "promotionDiscount": -300000
    }
  }
}
```

### POST `/api/promotions/validate`
Kiểm tra mã khuyến mãi

**Request Body:**
```json
{
  "code": "SALE50",
  "flightId": "675d890abcdef123456",
  "subtotal": 3000000
}
```

**Response:**
```json
{
  "success": true,
  "valid": true,
  "discount": 300000,
  "message": "Promotion applied successfully"
}
```

## 📝 Database Migration

Khi triển khai module pricing, cần:

1. **Tạo collection mới:**
   ```bash
   # Không cần migration vì đây là collection mới
   # Chỉ cần seed initial pricing data
   ```

2. **Seed pricing data:**
   ```javascript
   // scripts/data/pricing.json
   {
     "pricing": [
       {
         "flight": "VN210",
         "basePrice": 1500000,
         "seatClasses": {
           "economy": { "multiplier": 1.0 },
           "business": { "multiplier": 2.0 }
         },
         "validFrom": "2025-10-01",
         "validUntil": "2025-12-31"
       }
     ]
   }
   ```

## 🚀 Kế hoạch triển khai

### Phase 1: Basic Pricing (Sprint 1)
- [ ] Tạo model `Pricing`
- [ ] Tạo `PricingService` với base functionality
- [ ] API endpoint `/api/flights/:id/pricing`
- [ ] Seed initial pricing data

### Phase 2: Promotions (Sprint 2)
- [ ] Tạo model `Promotion`
- [ ] API CRUD cho promotions
- [ ] API validate promotion code
- [ ] Admin UI để quản lý promotions

### Phase 3: Dynamic Pricing (Sprint 3)
- [ ] Implement dynamic pricing algorithm
- [ ] Scheduled job để cập nhật prices
- [ ] Analytics dashboard

### Phase 4: Add-ons (Sprint 4)
- [ ] Model cho dịch vụ bổ sung
- [ ] UI cho người dùng chọn add-ons
- [ ] Tích hợp vào booking flow

## 🧪 Testing Strategy

```javascript
describe('PricingService', () => {
    it('should calculate base price correctly', async () => {
        const price = await PricingService.calculatePrice(
            'flight-id',
            { seatClass: 'economy', passengers: 1 }
        );
        expect(price.total).toBe(1500000);
    });

    it('should apply seat class multiplier', async () => {
        const price = await PricingService.calculatePrice(
            'flight-id',
            { seatClass: 'business', passengers: 1 }
        );
        expect(price.total).toBe(3000000);
    });

    it('should apply promotion code', async () => {
        const price = await PricingService.calculatePrice(
            'flight-id',
            { 
                seatClass: 'economy', 
                passengers: 1,
                promotionCode: 'SALE50'
            }
        );
        expect(price.total).toBeLessThan(1500000);
    });
});
```

## 📚 Tài liệu liên quan

- [Flight Model](../models/Flight.js) - Model chuyến bay (không có price)
- [Booking Model](../models/Booking.js) - Model đặt vé (sẽ reference Pricing)
- [Routes Documentation](../routes/flights.js) - API endpoints

---

**Cập nhật lần cuối**: 2025-10-26  
**Trạng thái**: Planning / Not Implemented  
**Ưu tiên**: Medium (sẽ triển khai sau khi core features hoàn thành)

