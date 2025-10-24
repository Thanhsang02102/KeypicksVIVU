module.exports = {
    // API Configuration
    API_VERSION: 'v1',
    BASE_URL: process.env.API_BASE_URL || 'http://localhost:3000/api',

    // External APIs
    FLIGHT_API: {
        AMADEUS: {
            API_KEY: process.env.AMADEUS_API_KEY,
            API_SECRET: process.env.AMADEUS_API_SECRET,
            BASE_URL: 'https://api.amadeus.com'
        },
        SABRE: {
            API_KEY: process.env.SABRE_API_KEY,
            BASE_URL: 'https://api.sabre.com'
        }
    },

    // Payment APIs
    PAYMENT_API: {
        VNPAY: {
            TMN_CODE: process.env.VNPAY_TMN_CODE,
            HASH_SECRET: process.env.VNPAY_HASH_SECRET,
            URL: process.env.VNPAY_URL
        },
        MOMO: {
            PARTNER_CODE: process.env.MOMO_PARTNER_CODE,
            ACCESS_KEY: process.env.MOMO_ACCESS_KEY,
            SECRET_KEY: process.env.MOMO_SECRET_KEY
        }
    },

    // Email Configuration
    EMAIL: {
        SMTP_HOST: process.env.SMTP_HOST,
        SMTP_PORT: process.env.SMTP_PORT,
        SMTP_USER: process.env.SMTP_USER,
        SMTP_PASS: process.env.SMTP_PASS
    }
};