const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema({
    airline: {
        type: String,
        required: true
    },
    flightNumber: {
        type: String,
        required: true
    },
    departure: {
        airport: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        time: {
            type: String,
            required: true
        },
        date: {
            type: Date,
            required: true
        }
    },
    arrival: {
        airport: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        time: {
            type: String,
            required: true
        },
        date: {
            type: Date,
            required: true
        }
    },
    duration: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ['direct', 'connecting'],
        default: 'direct'
    },
    availableSeats: {
        type: Number,
        default: 0
    },
    totalSeats: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Flight', flightSchema);