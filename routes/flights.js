const express = require('express');
const router = express.Router();
const Flight = require('../models/Flight');
const Airport = require('../models/Airport');
const Airline = require('../models/Airline');

// Search flights
router.get('/search', async (req, res) => {
    try {
        const { departure, arrival, date, passengers } = req.query;

        // Build query
        const query = {};
        
        if (departure) {
            query['departure.airport'] = departure;
        }
        
        if (arrival) {
            query['arrival.airport'] = arrival;
        }
        
        if (date) {
            // Search for flights on the specified date
            const searchDate = new Date(date);
            const nextDay = new Date(searchDate);
            nextDay.setDate(nextDay.getDate() + 1);
            
            query['departure.timestamp'] = {
                $gte: searchDate,
                $lt: nextDay
            };
        }

        // Find flights sorted by departure timestamp
        const flights = await Flight.find(query).sort({ 'departure.timestamp': 1 });

        // Note: Pricing logic moved to dedicated pricing module
        // Price calculation will depend on seat class, promotions, and booking time

        res.json({
            success: true,
            flights: flights,
            total: flights.length
        });
    } catch (error) {
        console.error('Error searching flights:', error);
        res.status(500).json({
            success: false,
            message: 'Error searching flights',
            error: error.message
        });
    }
});

// Get flight details
router.get('/:id', async (req, res) => {
    try {
        const flight = await Flight.findById(req.params.id);

        if (flight) {
            res.json({ success: true, flight: flight });
        } else {
            res.status(404).json({ success: false, message: 'Flight not found' });
        }
    } catch (error) {
        console.error('Error getting flight:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting flight details',
            error: error.message
        });
    }
});

// Get airports
router.get('/airports/list', async (req, res) => {
    try {
        const airports = await Airport.find().sort({ city: 1 });
        res.json({ success: true, airports: airports });
    } catch (error) {
        console.error('Error getting airports:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting airports',
            error: error.message
        });
    }
});

// Get airlines
router.get('/airlines/list', async (req, res) => {
    try {
        const airlines = await Airline.find().sort({ name: 1 });
        res.json({ success: true, airlines: airlines });
    } catch (error) {
        console.error('Error getting airlines:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting airlines',
            error: error.message
        });
    }
});

module.exports = router;