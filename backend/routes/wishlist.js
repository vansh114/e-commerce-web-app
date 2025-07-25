const express = require('express');
const mongoose = require('mongoose');
const fetchUser = require('../middleware/fetchUser');
const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const router = express.Router();


// ROUTE 1: Get current user's wishlist
router.get('/', fetchUser, async (req, res) => {
    try {
        const wlist = await Wishlist.findOne({ user: req.user.id }).lean();
        if (!wlist) {
            return res.status(404).json({ error: "No wishlist found for this user" });
        }
        res.json({
            items: wlist.items.map(item => ({
                productId: item.product
            }))
        });
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

// ROUTE 2: Add item to wishlist
router.post('/add', fetchUser, async (req, res) => {
    const { productId } = req.body;

    // Validate input
    if (!productId) {
        return res.status(400).json({ error: "Product ID are required" });
    }

    try {
        // Check if the user already has a wishlist
        let wlist = await Wishlist.findOne({ user: req.user.id });

        // If no wishlist exists, create a new one
        if (!wlist) {
            wlist = new Wishlist({
                user: req.user.id,
                items: [{ product: productId }]
            });
        }
        else{
            const exists = wlist.items.find(item => item.product.equals(productId));
            if (!exists) {
                wlist.items.push({ product: productId });
            }
        }
        // Save the updated wishlist
        await wlist.save();
        res.json({
            items: wlist.items.map(item => ({
                productId: item.product
            }))
        });
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});


// ROUTE 3: Remove item from wishlist
router.delete('/remove/:productId', fetchUser, async (req, res) => {
    const { productId } = req.params;

    try {
        const wlist = await Wishlist.findOne({ user: req.user.id });

        if (!wlist) {
            return res.status(404).json({ error: "Wishlist not found for this user" });
        }

        // Remove the product from the wishlist
        wlist.items = wlist.items.filter(item => !item.product.equals(new mongoose.Types.ObjectId(productId)));

        await wlist.save();
        res.json({
            items: wlist.items.map(item => ({
                productId: item.product
            }))
        });
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;