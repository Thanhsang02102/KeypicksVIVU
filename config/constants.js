module.exports = {
    // Application Constants
    APP_NAME: 'KeyPicks VIVU',
    APP_VERSION: '1.0.0',

    // User Roles
    USER_ROLES: {
        USER: 'user',
        ADMIN: 'admin'
    },

    // Booking Status
    BOOKING_STATUS: {
        PENDING: 'pending',
        CONFIRMED: 'confirmed',
        CANCELLED: 'cancelled',
        COMPLETED: 'completed'
    },

    // Payment Status
    PAYMENT_STATUS: {
        PENDING: 'pending',
        PAID: 'paid',
        FAILED: 'failed',
        REFUNDED: 'refunded'
    },

    // Flight Types
    FLIGHT_TYPES: {
        DIRECT: 'direct',
        CONNECTING: 'connecting'
    },

    // Seat Classes
    SEAT_CLASSES: {
        ECONOMY: 'economy',
        PREMIUM: 'premium',
        BUSINESS: 'business',
        FIRST: 'first'
    },

    // Airports
    AIRPORTS: {
        SGN: { code: 'SGN', name: 'TP. Hồ Chí Minh (SGN)', city: 'TP. Hồ Chí Minh' },
        HAN: { code: 'HAN', name: 'Hà Nội (HAN)', city: 'Hà Nội' },
        DAD: { code: 'DAD', name: 'Đà Nẵng (DAD)', city: 'Đà Nẵng' },
        CXR: { code: 'CXR', name: 'Nha Trang (CXR)', city: 'Nha Trang' },
        PQC: { code: 'PQC', name: 'Phú Quốc (PQC)', city: 'Phú Quốc' }
    },

    // Airlines
    AIRLINES: {
        VN: { code: 'VN', name: 'Vietnam Airlines', logo: '/images/airlines/vn.png' },
        VJ: { code: 'VJ', name: 'VietJet Air', logo: '/images/airlines/vj.png' },
        QH: { code: 'QH', name: 'Bamboo Airways', logo: '/images/airlines/qh.png' }
    }
};