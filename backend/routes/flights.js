const express = require('express');
const router = express.Router();

// Mock flight data
const flights = [
    {
        id: 'FL001',
        airline: 'Vietnam Airlines',
        flightNumber: 'VN 7120',
        departure: {
            time: '08:00',
            airport: 'SGN',
            city: 'TP. Hồ Chí Minh',
            date: '2024-12-15'
        },
        arrival: {
            time: '10:00',
            airport: 'HAN',
            city: 'Hà Nội',
            date: '2024-12-15'
        },
        duration: '2h 00m',
        price: 1850000,
        type: 'direct',
        availableSeats: 50
    },
    {
        id: 'FL002',
        airline: 'VietJet Air',
        flightNumber: 'VJ 123',
        departure: {
            time: '14:30',
            airport: 'SGN',
            city: 'TP. Hồ Chí Minh',
            date: '2024-12-15'
        },
        arrival: {
            time: '16:30',
            airport: 'HAN',
            city: 'Hà Nội',
            date: '2024-12-15'
        },
        duration: '2h 00m',
        price: 1650000,
        type: 'direct',
        availableSeats: 30
    }
];

// Search flights
router.get('/search', (req, res) => {
    const { departure, arrival, date, passengers, class: flightClass } = req.query;

    // Filter flights based on search criteria
    let filteredFlights = flights.filter(flight => {
        return flight.departure.airport === departure &&
            flight.arrival.airport === arrival &&
            flight.departure.date === date;
    });

    // Apply class filter
    if (flightClass && flightClass !== 'economy') {
        filteredFlights = filteredFlights.map(flight => ({
            ...flight,
            price: flight.price * (flightClass === 'business' ? 2 : 1.5)
        }));
    }

    res.json({
        success: true,
        flights: filteredFlights,
        total: filteredFlights.length
    });
});

// Get flight details
router.get('/:id', (req, res) => {
    const flightId = req.params.id;
    const flight = flights.find(f => f.id === flightId);

    if (flight) {
        res.json({ success: true, flight: flight });
    } else {
        res.status(404).json({ success: false, message: 'Flight not found' });
    }
});

// Get airports
router.get('/airports/list', (req, res) => {
    const airports = [
        { code: 'SGN', name: 'TP. Hồ Chí Minh (SGN)', city: 'TP. Hồ Chí Minh' },
        { code: 'HAN', name: 'Hà Nội (HAN)', city: 'Hà Nội' },
        { code: 'DAD', name: 'Đà Nẵng (DAD)', city: 'Đà Nẵng' },
        { code: 'CXR', name: 'Nha Trang (CXR)', city: 'Nha Trang' },
        { code: 'PQC', name: 'Phú Quốc (PQC)', city: 'Phú Quốc' }
    ];

    res.json({ success: true, airports: airports });
});

module.exports = router;