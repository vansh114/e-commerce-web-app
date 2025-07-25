const express = require('express');
const fetchUser = require('../middleware/fetchUser');
const User = require('../models/User');
const router = express.Router();
const bcrypt = require('bcryptjs');



// ROUTE 1: Get logged-in user's profile
router.get('/me', fetchUser, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
});


// ROUTE 2: Update logged-in user's profile
router.put('/update', fetchUser, async (req, res) => {
    const { name, address, phone } = req.body;

    // Prevent role manipulation
    if (req.body.role) {
        delete req.body.role;
    }

    try {
        const updatedFields = {};
        if (name) updatedFields.name = name;
        if (address) updatedFields.address = address;
        if (phone) updatedFields.phone = phone;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updatedFields },
            { new: true, runValidators: true }
        ).select('-password');

        res.json(user);
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
});



// ROUTE 3: Change password
router.put('/change-password', fetchUser, async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    // Prevent role manipulation
    if (req.body.role) {
        delete req.body.role;
    }

    if (!currentPassword || !newPassword)
        return res.status(400).json({ error: 'Both current and new passwords are required' });

    if (newPassword.length < 6)
        return res.status(400).json({ error: 'New password must be at least 6 characters' });

    try {
        const user = await User.findById(req.user.id);

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid current password' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        user.password = hashedPassword;

        await user.save();
        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
});


// ROUTE 4: Soft Delete for Logged-in User (Self-Deletion)
router.put('/me/deactivate', fetchUser, async (req, res) => {
    const { password } = req.body;
    
    // Validate password is provided
    if (!password) {
        return res.status(400).json({ error: 'Password is required for account deactivation' });
    }
    
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        
        // Prevent admin from deactivating their account through user routes
        if (user.role === 'admin') {
            return res.status(403).json({ error: 'Admin accounts cannot be deactivated through user routes' });
        }
        
        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid password' });
        
        // Call the custom softDelete method to mark the user as deleted
        await user.softDelete();
        res.json({ message: 'Your account has been deactivated' });
    } 
    catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
});


// ROUTE 5: Delete logged-in user's account
router.delete('/delete', fetchUser, async (req, res) => {
    const { password } = req.body;
    
    // Validate password is provided
    if (!password) {
        return res.status(400).json({ error: 'Password is required for account deletion' });
    }
    
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        
        // Prevent admin from deleting their account through user routes
        if (user.role === 'admin') {
            return res.status(403).json({ error: 'Admin accounts cannot be deleted through user routes' });
        }
        
        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid password' });
        
        // Proceed with account deletion
        const deletedUser = await User.findByIdAndDelete(req.user.id);
        
        if (!deletedUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({ message: 'Account deleted successfully', user: deletedUser });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


module.exports = router;