const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'Access token required' });
    }

    // Mock token verification
    if (token.startsWith('mock_token_')) {
        req.user = { id: 1, email: 'user@example.com', name: 'Test User' };
        next();
    } else {
        res.status(403).json({ success: false, message: 'Invalid token' });
    }
};

module.exports = { authenticateToken };