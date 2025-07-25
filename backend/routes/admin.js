const express = require('express');
const fetchUser = require('../middleware/fetchUser');
const checkAdmin = require('../middleware/checkAdmin');
const User = require('../models/User');
const bcrypt = require('bcryptjs'); // Add this import
const router = express.Router();



// ROUTE 1: Admin - Get all users
router.get('/all', fetchUser, checkAdmin, async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } 
    catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
});


// ROUTE 2: Admin - Delete a user (with self-deletion prevention)
router.delete('/delete/:id', fetchUser, checkAdmin, async (req, res) => {
    const { password } = req.body;
    
    // Validate password is provided
    if (!password) {
        return res.status(400).json({ error: 'Admin password is required for user deletion' });
    }
    
    try {
        // Verify admin's password first
        const admin = await User.findById(req.user.id);
        if (!admin) return res.status(404).json({ error: 'Admin account not found' });
        
        // Verify password
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid admin password' });
        
        // Prevent admin from deleting their own account
        if (req.params.id === req.user.id) {
            return res.status(400).json({ error: 'Admin cannot delete their own account' });
        }

        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
});


// ROUTE 3: Admin - Deactive a user
router.delete('/deactivate/:id', fetchUser, checkAdmin, async (req, res) => {
    const { password } = req.body;
    
    // Validate password is provided
    if (!password) {
        return res.status(400).json({ error: 'Admin password is required for user deactivation' });
    }
    
    try {
        // Verify admin's password first
        const admin = await User.findById(req.user.id);
        if (!admin) return res.status(404).json({ error: 'Admin account not found' });
        
        // Verify password
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid admin password' });
        
        if (req.params.id === req.user.id) {
            return res.status(400).json({ error: "Admin cannot deactive their own account" });
        }
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        // Call the custom softDelete method to mark the user as deleted
        await user.softDelete();
        res.json({ message: 'User got deactivated successfully' });
    } 
    catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
});


// ROUTE 4: Admin - Restore a soft deleted user
router.put('/restore/:id', fetchUser, checkAdmin, async (req, res) => {
    const { password } = req.body;
    
    // Validate password is provided
    if (!password) {
        return res.status(400).json({ error: 'Admin password is required for user restoration' });
    }
    
    try {
        // Verify admin's password first
        const admin = await User.findById(req.user.id);
        if (!admin) return res.status(404).json({ error: 'Admin account not found' });
        
        // Verify password
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid admin password' });
        
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        if (!user.isDeleted) {
            return res.status(400).json({ error: 'User is not deleted' });
        }
        user.isDeleted = false;
        await user.save();

        res.json({ message: 'User restored successfully', data: user });
    } 
    catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
});


module.exports = router;