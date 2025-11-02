const mongoose = require('mongoose');

const airlineSchema = new mongoose.Schema({
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
    logo: {
        type: String
    },
    country: {
        type: String,
        default: 'Vietnam'
    },
    website: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Airline', airlineSchema);

