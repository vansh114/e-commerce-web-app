const express = require("express");
const fetchUser = require("../middleware/fetchUser");
const Review = require("../models/Review");
const Product = require("../models/Product");
const router = express.Router();

// Route 1: Add a review
router.post("/add", fetchUser, async (req, res) => {
    const { productId, rating, comment } = req.body;

    // Check if the user has already reviewed the product
    const existingReview = await Review.findOne({ product: productId, user: req.user.id });
    if (existingReview) {
        return res.status(400).json({ error: "You have already reviewed this product" });
    }

    if (!productId || !rating) {
        return res.status(400).json({ error: "Product ID and rating are required" });
    }

    if (rating < 1 || rating > 5) {
        return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    try {
        // Ensure the product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        // Create a new review
        const review = new Review({
            product: productId,
            user: req.user.id,
            rating,
            comment,
        });

        // Save the review to the database
        await review.save();

        product.numReviews += 1;
        // If it's the first review, set the average rating to the current review's rating
        if (product.numReviews === 1) {
            product.averageRating = rating;
        } else {
            product.averageRating = ((product.averageRating * (product.numReviews - 1)) + rating) / product.numReviews;
        }

        await product.save();
        res.status(201).json({ message: "Review added successfully", review });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

// Route 2: Get reviews for a product
router.get("/:productId", async (req, res) => {
    const { productId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    try {
        const reviews = await Review.find({ product: productId })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate("user", "name email avatar");

        if (!reviews.length) {
            return res.status(404).json({ message: "No reviews found for this product" });
        }

        res.status(200).json({ reviews, page, limit });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

// Route 3: Update a review
router.put("/:id", fetchUser, async (req, res) => {
    const { rating, comment } = req.body;

    if (rating && (rating < 1 || rating > 5)) {
        return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ error: "Review not found" });
        }

        if (review.user.toString() !== req.user.id) {
            return res.status(401).json({ error: "You can only edit your own review" });
        }

        review.rating = rating || review.rating;
        review.comment = comment || review.comment;
        await review.save();

        // Recalculate average rating for the product
        const product = await Product.findById(review.product);
        const allReviews = await Review.find({ product: review.product });
        const totalRating = allReviews.reduce((acc, r) => acc + r.rating, 0);
        product.averageRating = totalRating / allReviews.length;
        await product.save();

        res.status(200).json({ message: "Review updated successfully", review });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

// Route 4: Delete a review
router.delete("/:id", fetchUser, async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ error: "Review not found" });
        }

        if (review.user.toString() !== req.user.id) {
            return res.status(401).json({ error: "You can only delete your own review" });
        }

        await review.deleteOne({ _id: review._id });

        // Recalculate average rating and numReviews after deletion
        const product = await Product.findById(review.product);
        if (product) {
            const allReviews = await Review.find({ product: review.product });

            if (allReviews.length === 0) {
                product.averageRating = 0;;
                product.numReviews = 0;
            } else {
                const totalRating = allReviews.reduce((acc, r) => acc + r.rating, 0);
                product.averageRating = totalRating / allReviews.length;;
                product.numReviews = allReviews.length;
            }
            await product.save();
        }

        res.status(200).json({ message: "Review deleted successfully" });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;