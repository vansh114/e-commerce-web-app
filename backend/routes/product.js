const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const fetchUser = require('../middleware/fetchUser');
const { body, validationResult } = require('express-validator');


// ROUTE 1: POST /api/products - Add a new product (Retailer must be authenticated)
router.post('/', fetchUser, [
  body('title', 'Enter a valid title (min 3 chars)').isLength({ min: 3 }),
  body('price', 'Price must be a positive number').isFloat({ min: 0 }),
  body('description', 'Description must be at least 10 characters').isLength({ min: 10 }),
  body('category', 'Category is required').notEmpty(),
  body('image', 'Enter a valid image URL').isURL(),
  body('stock', 'Stock must be a positive number').isInt({ min: 0 })
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, price, description, category, image, stock } = req.body;

    // Role check
    if (req.user.role !== 'retailer') {
      return res.status(403).json({ error: "Access denied. Only retailers can add products." });
    }

    const existing = await Product.findOne({ title, seller: req.user.id });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: "You have already listed a product with this title."
      });
    }

    const newProduct = new Product({
      title,
      price,
      description,
      category,
      image,
      seller: req.user.id,
      stock
    });

    const savedProduct = await newProduct.save();
    res.status(201).json({
      success: true,
      message: "Product created successfully",
      productId: savedProduct._id, // <- For frontend ease of use
      data: savedProduct
    });
  } catch (error) {
    console.error("Error adding product:", error.message);
    res.status(500).json({ success: false, error: "Something went wrong. Please try again later." });
  }
}
);


// ROUTE 2: GET /api/products/my - Get all products (Retailer must be authenticated)
router.get('/my', fetchUser, async (req, res) => {
  try {
    if (req.user.role !== 'retailer') {
      return res.status(403).json({ error: "Access denied. Only retailers can view their products." });
    }

    const products = await Product.find({ seller: req.user.id });
    res.status(200).json({
      success: true,
      count: products.length,
      message: products.length ? "Products retrieved successfully." : "No products found.",
      data: products
    });
  } 
  catch (error) {
    console.error("Error fetching your products:", error.message);
    res.status(500).json({ success: false, error: "Something went wrong. Please try again later." });
  }
});


// ROUTE 3: DELETE /api/products/:id - Delete a product by ID (Retailer must be authenticated)
router.delete('/:id', fetchUser, async (req, res) => {
  try {
    const productId = req.params.id;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, error: "Invalid product ID format" });
    }

    // Delete the product only if it belongs to the logged-in retailer
    const deletedProduct = await Product.findOneAndDelete({
      _id: productId,
      seller: req.user.id
    });

    // Find the product by ID
    if (!deletedProduct) {
      return res.status(404).json({ success: false, error: "Product not found or unauthorized" });
    }

    res.status(200).json({
      success: true,
      message: "Product has been deleted successfully.",
      data: deletedProduct
    });
  }
  catch (error) {
    console.error("Error deleting product:", error.message);
    res.status(500).json({ success: false, error: "Something went wrong. Please try again later." });
  }
});


// ROUTE 4: PATCH /api/products/:id - Update product details (Retailer must be authenticated)
router.patch('/:id', fetchUser, [
  body('title').optional().trim().isLength({ min: 3 }),
  body('description').optional().trim().isLength({ min: 10 }),
  body('price').optional().trim().isFloat({ min: 0 }),
  body('category').optional().trim().notEmpty(),
  body('image').optional().trim().isURL(),
  body('stock').optional().isInt({ min: 0 })
], async (req, res) => {
  try {
    const productId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, error: "Invalid product ID format" });
    }

    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    // Extract fields from body
    const { title, description, price, category, image, stock } = req.body;

    // Create a newProduct object with only fields that are being updated
    const newProduct = {};
    if (title) newProduct.title = title;
    if (description) newProduct.description = description;
    if (category) newProduct.category = category;
    if (image) newProduct.image = image;
    if (price !== undefined) newProduct.price = parseFloat(price);
    if (stock !== undefined) newProduct.stock = stock;

    // If no fields provided
    if (Object.keys(newProduct).length === 0) {
      return res.status(400).json({ success: false, error: "No valid fields provided for update" });
    }

    // Attempt to find and update the product in a single DB operation
    const product = await Product.findOneAndUpdate(
      { _id: productId, seller: req.user.id },
      { $set: newProduct },
      { new: true }
    );

    // if no matching product found (ID is wrong or user isn't the owner)
    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found or unauthorized"
      });
    }

    // If everything well, return updated product data
    res.json({
      success: true,
      message: "Product updated successfully",
      data: product
    });
  }
  catch (error) {
    console.error("Error updating product:", error.message);
    res.status(500).json({ success: false, error: "Something went wrong. Please try again later." });
  }
});


// ROUTE 5: GET /api/products/:id
router.get('/:id', async (req, res) => {
  const productId = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({ success: false, error: "Invalid product ID format" });
  }

  try {
    const product = await Product.findById(productId)
      .populate('reviews')
      .exec();
      
    if (!product) {
      return res.status(404).json({ success: false, error: "Product not found" });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    console.error("Error fetching product:", error.message);
    res.status(500).json({ success: false, error: "Server error" });
  }
});


// ROUTE 6: GET /api/products - Public route to fetch all products (No auth required)
router.get('/', async (req, res) => {
  try {
    const { search, page = 1, limit = 10, category, sort, minPrice, maxPrice } = req.query;

    let query = {}; 
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    if (category) {
      query.category = category;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const allowedSortFields = ['price', 'title', 'averageRating'];

    if (sort) {
      const sortKey = sort.replace('-', '');
      if (allowedSortFields.includes(sortKey)) {
        const sortOrder = sort.startsWith('-') ? -1 : 1;
        sortOption = { [sortKey]: sortOrder };
      }
      else {
        sortOption = { title: 1 };
      }
    }
    else {
      sortOption = { title: 1 };
    }

    let products = await Product.find(query)
      .skip(skip)
      .limit(Number(limit))
      .sort(sortOption);

    const total = await Product.countDocuments(query);
    const pages = Math.ceil(total / limit);

    res.status(200).json({ products, total, page, pages });
  }
  catch (error) {
    console.error("Error fetching products:", error.message);
    res.status(500).json("Internal Server Error");
  }
});

module.exports = router;