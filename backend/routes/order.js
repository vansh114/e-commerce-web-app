const express = require("express");
const fetchUser = require("../middleware/fetchUser");
const checkAdmin = require("../middleware/checkAdmin");
const Order = require("../models/Order");
const Product = require("../models/Product");
const router = express.Router();



// ROUTE 1: Place an Order
router.post("/place", fetchUser, async (req, res) => {
    const {
        orderItems,
        shippingAddress,
        paymentMethod
    } = req.body;

    if (orderItems && orderItems.length === 0) {
        return res.status(400).json({ error: "No order items" });
    }

    if (!shippingAddress || Object.keys(shippingAddress).length === 0) {
        return res.status(400).json({ error: "Shipping address is required" });
    }

    if (!paymentMethod || paymentMethod.trim() === "") {
        return res.status(400).json({ error: "Payment method is required" });
    }

    try {
        let itemsPrice = 0;
        let shippingPrice = 0;
        let taxPrice = 0;
        
        for (let item of orderItems) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(404).json({ error: `Product with ID ${item.product} not found` });
            }
            if (product.stock < item.quantity) {
                return res.status(400).json({ error: `Not enough stock for ${product.name}` });
            }
            itemsPrice += product.price * item.quantity;
        }
        
        taxPrice = itemsPrice * 0.15;
        
        shippingPrice = orderItems.length > 5 ? 20 : 10;

        const totalPrice = itemsPrice + taxPrice + shippingPrice;

        const order = new Order({
            user: req.user.id,
            orderItems,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
            isPaid: ['Credit Card', 'UPI', 'Net Banking'].includes(paymentMethod),
            paidAt: ['Credit Card', 'UPI', 'Net Banking'].includes(paymentMethod) ? Date.now() : undefined
        });

        await order.save();

        for (let item of orderItems) {
            const product = await Product.findById(item.product);
            product.stock -= item.quantity;
            await product.save();
        }

        res.status(201).json({ message: "Order placed successfully", order });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});


// ROUTE 2: Get all orders placed by the logged-in user
router.get("/my-orders", fetchUser, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id });

        if (orders.length === 0) {
            return res.status(404).json({ message: "No orders found for this user" });
        }

        res.status(200).json({ orders });
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});


// ROUTE 3: Get Order by ID
router.get("/:id", fetchUser, async (req, res) => {
    const { id } = req.params;
    try {
        const order = await Order.findById(id).populate('user', 'name');
        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }
        
        if (order.user._id.toString() !== req.user.id && (req.user.role !== 'admin' && req.user.role !== 'retailer')) {
            return res.status(403).json({ error: "Access denied: insufficient permissions to view this order" });
        }
        res.status(200).json(order);
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});


// ROUTE 4: GET /retailer/all - Fetch all orders across the system
router.get('/retailer/all', fetchUser, async (req, res) => {
    try {
        if (req.user.role !== 'retailer') {
            return res.status(403).json({ error: "Access denied. Only retailers can view all orders" });
        }

        const orders = await Order.find().populate('user', 'name');

        if (orders.length === 0) {
            return res.status(404).json({ message: "No orders found in the system" });
        }

        res.status(200).json({ orders });
    }
    catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({
            error: "Internal Server Error",
            message: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});


// ROUTE 5: PUT /update-status/:id - Update the Order Status
router.put("/retailer/update-status/:id", fetchUser, async (req, res) => {
    const { status } = req.body;
    if (req.user.role !== 'retailer') {
        return res.status(403).json({ error: "Access denied. Only retailers can update order status" });
    }
    const validStatuses = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid order status" });
    }
    try {
        let order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }
        order.status = status;
        await order.save();
        // Populate user field before sending response
        order = await Order.findById(order._id).populate('user', 'name');
        res.status(200).json({ message: "Order status updated successfully", order });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});


// ROUTE 5: DELETE /delete/:id - Hard delete an order (Admin only)
router.delete("/retailer/delete/:id", fetchUser, async (req, res) => {
    const { id } = req.params;

    if (req.user.role !== 'retailer') {
        return res.status(403).json({ error: "Access denied. Only retailers can update order status" });
    }
    try {
        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }

        await Order.findByIdAndDelete(id);

        res.status(200).json({ message: "Order deleted successfully" });
    } catch (error) {
        console.error(error.message);
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
});


// ROUTE 6: POST /cancel-request/:id - Order Cancellation Requests
router.post('/cancel-request/:id', fetchUser, async (req, res) => {
    try {
        const { reason } = req.body;
        if (!reason) {
            return res.status(400).json({ error: "Cancellation reason is required" });
        }
        
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }
        
        if (order.user.toString() !== req.user.id) {
            return res.status(403).json({ error: "Not authorized to cancel this order" });
        }
        
        if (['Delivered', 'Cancelled'].includes(order.status)) {
            return res.status(400).json({ error: `Cannot cancel order with status: ${order.status}` });
        }
        
        order.cancellationRequest = {
            reason: reason,
            requestedAt: Date.now(),
            status: 'Pending'
        };
        
        await order.save();
        return res.json({ success: true, message: "Cancellation request submitted successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error" });
    }
});

// ROUTE 7: PUT /retailer/cancel-request/:id - Seller's response to cancellation requests
router.put('/retailer/cancellation-request/:id', fetchUser, async (req, res) => {
    try {
        const { action } = req.body; // 'approve' or 'reject'
        
        if (!['approve', 'reject'].includes(action)) {
            return res.status(400).json({ error: "Invalid action. Must be 'approve' or 'reject'" });
        }
        
        if (req.user.role !== 'retailer') {
            return res.status(403).json({ error: "Access denied. Only retailers can handle cancellation requests" });
        }
        
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }
        
        if (!order.cancellationRequest || order.cancellationRequest.status !== 'Pending') {
            return res.status(400).json({ error: "No pending cancellation request found for this order" });
        }
        
        if (action === 'approve') {
            order.status = 'Cancelled';
            order.cancellationRequest.status = 'Approved';
        } else {
            order.cancellationRequest.status = 'Rejected';
        }
        
        await order.save();
        
        const populatedOrder = await Order.findById(order._id).populate('user', 'name');
        
        return res.json({ 
            success: true, 
            message: `Cancellation request ${action}ed successfully`,
            order: populatedOrder
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;