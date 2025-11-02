const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const Booking = require('../models/Booking');
const Flight = require('../models/Flight');

// Create booking
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { flightId, passengers, contactInfo, totalAmount } = req.body;

        // Verify flight exists
        const flight = await Flight.findById(flightId);
        if (!flight) {
            return res.status(404).json({ success: false, message: 'Flight not found' });
        }

        // Check available seats
        if (flight.availableSeats < passengers.length) {
            return res.status(400).json({ success: false, message: 'Not enough available seats' });
        }

        const booking = new Booking({
            userId: req.user.id,
            flightId: flightId,
            passengers: passengers,
            contactInfo: contactInfo,
            status: 'pending',
            totalAmount: totalAmount || (flight.price * passengers.length)
        });

        await booking.save();

        res.json({
            success: true,
            booking: booking
        });
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating booking',
            error: error.message
        });
    }
});

// Confirm booking
router.post('/:id/confirm', authenticateToken, async (req, res) => {
    try {
        const bookingId = req.params.id;
        const { paymentMethod } = req.body;

        const booking = await Booking.findOne({ _id: bookingId, userId: req.user.id });

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        // Generate booking code
        booking.status = 'confirmed';
        booking.bookingCode = 'VN' + Math.random().toString(36).substr(2, 6).toUpperCase();
        booking.paymentMethod = paymentMethod;
        booking.paymentStatus = 'paid';

        await booking.save();

        // Update flight available seats
        const flight = await Flight.findById(booking.flightId);
        if (flight) {
            flight.availableSeats -= booking.passengers.length;
            await flight.save();
        }

        res.json({
            success: true,
            booking: booking,
            bookingCode: booking.bookingCode
        });
    } catch (error) {
        console.error('Error confirming booking:', error);
        res.status(500).json({
            success: false,
            message: 'Error confirming booking',
            error: error.message
        });
    }
});

// Get user bookings
router.get('/user', authenticateToken, async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.user.id })
            .populate('flightId')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            bookings: bookings
        });
    } catch (error) {
        console.error('Error getting user bookings:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting bookings',
            error: error.message
        });
    }
});

// Get booking details
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const booking = await Booking.findOne({ _id: req.params.id, userId: req.user.id })
            .populate('flightId');

        if (booking) {
            res.json({ success: true, booking: booking });
        } else {
            res.status(404).json({ success: false, message: 'Booking not found' });
        }
    } catch (error) {
        console.error('Error getting booking:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting booking details',
            error: error.message
        });
    }
});

// Cancel booking
router.post('/:id/cancel', authenticateToken, async (req, res) => {
    try {
        const booking = await Booking.findOne({ _id: req.params.id, userId: req.user.id });

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        booking.status = 'cancelled';
        await booking.save();

        // Restore flight available seats
        const flight = await Flight.findById(booking.flightId);
        if (flight) {
            flight.availableSeats += booking.passengers.length;
            await flight.save();
        }

        res.json({
            success: true,
            message: 'Booking cancelled successfully'
        });
    } catch (error) {
        console.error('Error cancelling booking:', error);
        res.status(500).json({
            success: false,
            message: 'Error cancelling booking',
            error: error.message
        });
    }
});

module.exports = router;