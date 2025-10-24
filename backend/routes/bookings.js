const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

// Mock bookings database
const bookings = [];

// Create booking
router.post('/', authenticateToken, (req, res) => {
    const { flightId, passengers, contactInfo } = req.body;

    const booking = {
        id: 'BK' + Date.now(),
        userId: req.user.id,
        flightId: flightId,
        passengers: passengers,
        contactInfo: contactInfo,
        status: 'pending',
        totalAmount: 2100000,
        createdAt: new Date().toISOString()
    };

    bookings.push(booking);

    res.json({
        success: true,
        booking: booking
    });
});

// Confirm booking
router.post('/:id/confirm', authenticateToken, (req, res) => {
    const bookingId = req.params.id;
    const { paymentMethod, paymentData } = req.body;

    const booking = bookings.find(b => b.id === bookingId && b.userId === req.user.id);

    if (!booking) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    booking.status = 'confirmed';
    booking.bookingCode = 'VN' + Math.random().toString(36).substr(2, 6).toUpperCase();
    booking.paymentMethod = paymentMethod;
    booking.confirmedAt = new Date().toISOString();

    res.json({
        success: true,
        booking: booking,
        bookingCode: booking.bookingCode
    });
});

// Get user bookings
router.get('/user', authenticateToken, (req, res) => {
    const userBookings = bookings.filter(b => b.userId === req.user.id);

    res.json({
        success: true,
        bookings: userBookings
    });
});

// Get booking details
router.get('/:id', authenticateToken, (req, res) => {
    const bookingId = req.params.id;
    const booking = bookings.find(b => b.id === bookingId && b.userId === req.user.id);

    if (booking) {
        res.json({ success: true, booking: booking });
    } else {
        res.status(404).json({ success: false, message: 'Booking not found' });
    }
});

// Cancel booking
router.post('/:id/cancel', authenticateToken, (req, res) => {
    const bookingId = req.params.id;
    const booking = bookings.find(b => b.id === bookingId && b.userId === req.user.id);

    if (!booking) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    booking.status = 'cancelled';
    booking.cancelledAt = new Date().toISOString();

    res.json({
        success: true,
        message: 'Booking cancelled successfully'
    });
});

module.exports = router;