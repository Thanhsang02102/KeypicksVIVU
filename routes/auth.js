const express = require('express');
const router = express.Router();
const { validateLogin, validateRegister } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

// Mock user database
const users = [
    {
        id: 1,
        email: 'admin@keypicksvivu.com',
        password: 'admin123',
        name: 'Admin User',
        role: 'admin'
    }
];

// Login
router.post('/login', validateLogin, (req, res) => {
    const { email, password } = req.body;

    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        const token = 'mock_token_' + Date.now();
        res.json({
            success: true,
            user: { id: user.id, email: user.email, name: user.name },
            token: token
        });
    } else {
        res.status(401).json({
            success: false,
            message: 'Email hoặc mật khẩu không đúng'
        });
    }
});

// Register
router.post('/register', validateRegister, (req, res) => {
    const { firstName, lastName, email, phone, password } = req.body;

    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
        return res.status(400).json({
            success: false,
            message: 'Email đã được sử dụng'
        });
    }

    // Create new user
    const newUser = {
        id: users.length + 1,
        email: email,
        password: password,
        name: `${firstName} ${lastName}`,
        phone: phone,
        role: 'user'
    };

    users.push(newUser);

    res.json({
        success: true,
        message: 'Đăng ký thành công',
        user: { id: newUser.id, email: newUser.email, name: newUser.name }
    });
});

// Logout
router.post('/logout', authenticateToken, (req, res) => {
    res.json({ success: true, message: 'Đăng xuất thành công' });
});

// Get current user
router.get('/me', authenticateToken, (req, res) => {
    const user = users.find(u => u.id === req.user.id);
    if (user) {
        res.json({ success: true, user: { id: user.id, email: user.email, name: user.name } });
    } else {
        res.status(404).json({ success: false, message: 'User not found' });
    }
});

module.exports = router;