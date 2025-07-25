const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET;

const fetchUser = async (req, res, next) => {
    const token = req.header('auth-token');
    if (!token) {
        return res.status(401).json({ error: "Access denied. No token provided!" });
    }
    try {
        const data = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(data.user.id);
        if (!user || user.isDeleted) {
            return res.status(403).json({ success: false, message: "Access denied. User account is inactive or deleted." });
        }
        req.user = data.user;
        next();
    } catch (error) {
        res.status(401).json({ error: "Invalid token!" });
    }
};

module.exports = fetchUser;