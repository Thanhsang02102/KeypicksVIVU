const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

// Get user profile
router.get('/profile', authenticateToken, (req, res) => {
    const user = {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
        phone: '0123456789',
        dateOfBirth: '1990-01-01',
        address: '123 Main St, Ho Chi Minh City'
    };

    res.json({ success: true, user: user });
});

// Update user profile
router.put('/profile', authenticateToken, (req, res) => {
    const { name, phone, dateOfBirth, address } = req.body;

    // Update user profile logic here
    res.json({
        success: true,
        message: 'Profile updated successfully',
        user: {
            id: req.user.id,
            email: req.user.email,
            name: name,
            phone: phone,
            dateOfBirth: dateOfBirth,
            address: address
        }
    });
});

// Change password
router.post('/change-password', authenticateToken, (req, res) => {
    const { currentPassword, newPassword } = req.body;

    // Validate current password and update logic here
    res.json({
        success: true,
        message: 'Password changed successfully'
    });
});

module.exports = router;