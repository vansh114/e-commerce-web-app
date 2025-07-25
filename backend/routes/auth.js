const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET;


// ROUTE:1 Register a new user using : POST "/api/auth/register". No Login Required
router.post('/register', [
    body('name', 'Name must be at least 2 characters!').isLength({ min: 2 }),
    body('email', 'Invalid email!').isEmail().normalizeEmail(),
    body('password', 'Password must be at least 6 characters!').isLength({ min: 6 }),
    body('role').optional().isIn(['user', 'admin', 'retailer']).withMessage('Invalid role!')
], async (req, res) => {
    let success = false;

    // If there are errors, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() });
    }

    // Extract values from request body
    const { name, email, password, role } = req.body;

    // Check whether the user with this email already exists
    try {
        let euser = await User.findOne({ email });
        if (euser) {
            return res.status(400).json({ success, error: "User already exists!" });
        }

        // Generate salt and hash password
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(password, salt);

        // Create a new user
        const user = await User({
            name,
            email,
            password: secPass,
            role: role || 'user'
        });

        // Save user to DB
        await user.save();

        // Create payload for JWT
        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        }

        // Sign JWT token (expires in 1 hour)
        const authToken = jwt.sign(payload, JWT_SECRET, /* { expiresIn: '1h' } */);
        success = true;
        res.json({ success, authToken, user: { id: user.id, name: user.name, role: user.role } });
    }

    // Catch errors
    catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error!");
    }
});


// ROUTE:2 Login existing user using : POST "/api/auth/login". No Login Required
router.post('/login', [
    body('email', 'Enter a valid Email!').isEmail().normalizeEmail(),
    body('password', 'Password can\'t be blank').exists()
], async (req, res) => {
    let success = false;

    // If there are errors, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() });
    }

    // Extract values from request body
    const { email, password } = req.body;

    try {
        // Check whether the user with this email already exists
        // Inside the login route, after finding the user but before checking password
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success, error: "Incorrect credentials!" });
        }
        
        // Add this check for deactivated accounts
        if (user.isDeleted) {
            return res.status(403).json({ success: false, error: "Your account has been deactivated. Please restore it to continue." });
        }
        
        // Then continue with password check
        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {
            return res.status(400).json({ success, error: "Incorrect credentials!" });
        }

        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        }

        const authToken = jwt.sign(payload, JWT_SECRET, /* { expiresIn: '1h' } */);
        success = true;
        res.json({ success, authToken, user: { id: user.id, name: user.name, role: user.role } });
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error!");
    }
});

// ROUTE:3 Restore deactivated account using : POST "/api/auth/restore". No Login Required
router.post('/restore', [
    body('email', 'Enter a valid Email!').isEmail().normalizeEmail(),
    body('password', 'Password can\'t be blank').exists()
], async (req, res) => {
    // If there are errors, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    // Extract values from request body
    const { email, password } = req.body;

    try {
        // Find the user by email
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, error: "User not found" });
        }

        // Verify password
        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {
            return res.status(400).json({ success: false, error: "Invalid password" });
        }
        
        // Check if account is actually deactivated
        if (!user.isDeleted) {
            return res.status(400).json({ success: false, error: "Account is already active" });
        }

        // Restore the account
        user.isDeleted = false;
        user.deletedAt = null;
        await user.save();

        // Generate auth token for automatic login
        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        }

        const authToken = jwt.sign(payload, JWT_SECRET);
        
        return res.json({ 
            success: true, 
            message: "Your account has been restored", 
            authToken,
            user: { id: user.id, name: user.name, role: user.role }
        });
    } 
    catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error!");
    }
});

module.exports = router;