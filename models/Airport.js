const mongoose = require('mongoose');

const airportSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true
    },
    name: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    country: {
        type: String,
        default: 'Vietnam'
    },
    timezone: {
        type: String,
        default: 'Asia/Ho_Chi_Minh'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Airport', airportSchema);

