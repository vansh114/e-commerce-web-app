const express = require('express');
const mongoose = require('mongoose');
const fetchUser = require('../middleware/fetchUser');
const Cart = require('../models/Cart');
const router = express.Router();
const Product = require('../models/Product');

// ROUTE 1: Get current user's cart
router.get('/', fetchUser, async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
        if (!cart) {
            return res.status(404).json({ error: "No cart found for this user" });
        }
        const items = cart.items.map(item => ({
            productId: item.product ? item.product._id : null,
            quantity: item.quantity,
            product: item.product ? {
                id: item.product._id,
                title: item.product.title,
                price: item.product.price,
                image: item.product.image,
            } : null
        }));

        const total = items.reduce((sum, item) => {
            return item.product ? sum + (item.product.price * item.quantity) : sum;
        }, 0);

        res.json({
            items,
            total: total.toFixed(2)
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

// ROUTE 2: Add item to cart
router.post('/add', fetchUser, async (req, res) => {
    const { productId, quantity } = req.body;

    // Validate input
    if (!productId || !quantity) {
        return res.status(400).json({ error: "Product ID and quantity are required" });
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
        return res.status(400).json({ error: "Quantity must be a positive integer" });
    }

    try {
        // Check if the user already has a cart
        let cart = await Cart.findOne({ user: req.user.id });

        // If no cart exists, create a new one
        if (!cart) {
            cart = new Cart({
                user: req.user.id,
                items: [{ product: productId, quantity }]
            });
        }
        else {
            // If cart exists, check if the product is already in the cart
            const existingProduct = cart.items.find(item => item.product.equals(productId));

            if (existingProduct) {
                // If the product already exists, update the quantity
                existingProduct.quantity += Number(quantity);
            }
            else {
                // If it's a new product, add it to the cart
                cart.items.push({ product: productId, quantity });
            }
        }
        // Save the updated cart
        await cart.save();
        // Populate product details before sending response
        await cart.populate('items.product');
        res.json({
            items: cart.items.map(item => ({
                product: {
                    _id: item.product._id,
                    title: item.product.title,
                    price: item.product.price,
                    image: item.product.image
                },
                quantity: item.quantity,
                subtotal: item.quantity * item.product.price
            }))
        });
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

// ROUTE 3: Update quantity of item in cart
router.put('/update/:productId', fetchUser, async (req, res) => {
    const { quantity } = req.body;
    const { productId } = req.params;

    if (!Number.isInteger(quantity) || quantity <= 0) {
        return res.status(400).json({ error: "Quantity must be a positive integer" });
    }

    try {
        const cart = await Cart.findOne({ user: req.user.id });

        if (!cart) {
            return res.status(404).json({ error: "Cart not found for this user" });
        }

        // Find the product in the cart and update its quantity
        const item = cart.items.find(item => item.product.equals(productId));
        if (!item) {
            return res.status(404).json({ error: "Product not found in cart" });
        }

        item.quantity = quantity;

        await cart.save();
        res.json({
            items: cart.items.map(item => ({
                productId: item.product,
                quantity: item.quantity
            }))
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

// ROUTE 4: Remove item from cart
router.delete('/remove/:productId', fetchUser, async (req, res) => {
    const { productId } = req.params;

    try {
        const cart = await Cart.findOne({ user: req.user.id });

        if (!cart) {
            return res.status(404).json({ error: "Cart not found for this user" });
        }

        // Remove the product from the cart
        cart.items = cart.items.filter(item => !item.product.equals(new mongoose.Types.ObjectId(productId)));

        await cart.save();
        res.json({
            items: cart.items.map(item => ({
                productId: item.product,
                quantity: item.quantity
            }))
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

// ROUTE 5: Clear all items from the cart
router.delete('/clear', fetchUser, async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id });

        if (!cart) {
            return res.status(404).json({ error: "Cart not found for this user" });
        }

        // Clear the cart
        cart.items = [];
        await cart.save();

        res.json({ message: "Cart cleared successfully", items: [] });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});


module.exports = router;